import crypto from 'node:crypto';
import { PracticeQuestion, PracticeSession } from '../models/Practice.js';
import { CATEGORIES, DIFFICULTIES } from '../constants.js';
import { shuffle, normText, parseJsonArray, cleanQuestion, planSlots } from '../utils/index.js';

export const aiEnabled = () => !!process.env.ANTHROPIC_API_KEY;

const TOPICS = {
  'Quantitative Aptitude': ['Percentages', 'Profit and Loss', 'Time and Work', 'Speed, Distance, Time', 'Ratio and Proportion', 'Averages', 'Simple and Compound Interest', 'Permutation and Combination', 'Probability', 'Number System', 'Mixtures and Alligations', 'Ages', 'Mensuration', 'Pipes and Cisterns', 'Partnership'],
  'Logical Reasoning': ['Number Series', 'Blood Relations', 'Syllogisms', 'Seating Arrangement', 'Coding-Decoding', 'Direction Sense', 'Puzzles', 'Odd One Out', 'Clocks and Calendars', 'Statement and Conclusion', 'Ranking and Order'],
  'Verbal Ability': ['Synonyms', 'Antonyms', 'Sentence Correction', 'Idioms and Phrases', 'One Word Substitution', 'Reading Comprehension (short passage)', 'Fill in the Blanks', 'Para Jumbles', 'Spotting Errors', 'Analogies'],
  'Data Interpretation': ['Tables', 'Bar Graphs (data given in text)', 'Pie Charts (data given in text)', 'Line Graphs (data given in text)', 'Percentage Change', 'Ratios in Data', 'Averages in Data'],
};
const LEVEL = {
  easy: 'EASY: one-step, solvable in 20-40 seconds, small numbers.',
  medium: 'MEDIUM: 2-3 steps, solvable in about 1 minute.',
  hard: 'HARD: multi-step or tricky, solvable in 1.5-2 minutes, typical of top-company placement tests.',
};

async function callClaude(prompt, maxTokens) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.AI_MODEL || 'claude-haiku-5-5', max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
    signal: AbortSignal.timeout(90000),
  });
  if (!res.ok) throw new Error(`AI API error ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return (data.content || []).map((c) => c.text || '').join('');
}

// AI answer keys can be wrong, so a second independent pass solves every question; only questions where both agree are kept.
async function verify(list) {
  if (!list.length) return [];
  const prompt = `Solve each multiple-choice question below independently and carefully.\nReply with ONLY a JSON array of integers: the 0-based index of the correct option for each question, in the same order. No other text.\n\n${JSON.stringify(list.map((q) => ({ text: q.text, options: q.options })))}`;
  const answers = parseJsonArray(await callClaude(prompt, 1500));
  return list.filter((q, i) => answers[i] === q.correctIndex);
}

export async function generateQuestions({ category, difficulty, count }) {
  if (!aiEnabled()) throw new Error('ANTHROPIC_API_KEY is not set in backend/.env');
  if (!CATEGORIES.includes(category) || !DIFFICULTIES.includes(difficulty)) throw new Error('Invalid category or difficulty');
  const topics = shuffle(TOPICS[category]).slice(0, 6);
  const recent = await PracticeQuestion.find({ category, difficulty }).sort({ _id: -1 }).limit(25).select('text');
  const prompt = `Create exactly ${count} NEW multiple-choice questions for campus-placement aptitude tests of Indian engineering colleges.
Category: ${category}
Difficulty: ${LEVEL[difficulty]}
Spread the questions across these topics: ${topics.join('; ')}.
Rules:
- Plain text only (no images). For Data Interpretation, put all the data inside the question text.
- Exactly 4 options and exactly ONE correct option. Wrong options must be plausible.
- Vary names, numbers and wording; spread the correct answer position across 0-3.
- Do not repeat or closely copy these existing questions: ${JSON.stringify(recent.map((r) => r.text.slice(0, 80)))}
Return ONLY a JSON array, no other text, in this shape:
[{"topic":"...","text":"...","options":["...","...","...","..."],"correctIndex":0,"explanation":"short worked solution"}]`;
  const raw = parseJsonArray(await callClaude(prompt, 6000));
  const cleaned = raw.map((q) => cleanQuestion(q, category, difficulty)).filter(Boolean);
  const verified = await verify(cleaned);
  const withHash = verified.map((q) => ({ ...q, hash: crypto.createHash('sha1').update(normText(q.text)).digest('hex'), source: 'ai' }));
  const dup = await PracticeQuestion.find({ $or: [{ hash: { $in: withHash.map((q) => q.hash) } }, { text: { $in: withHash.map((q) => q.text) } }] }).select('hash text');
  const known = new Set(dup.flatMap((d) => [d.hash, d.text]));
  const fresh = withHash.filter((q, i, arr) => !known.has(q.hash) && !known.has(q.text) && arr.findIndex((x) => x.hash === q.hash) === i);
  if (fresh.length) await PracticeQuestion.insertMany(fresh);
  return { requested: count, generated: raw.length, accepted: fresh.length };
}

/** Picks questions the student has NOT seen recently; creates new ones with AI when the bank runs short. */
export async function getQuestionsForSession({ category, difficulty, count, userId }) {
  const cats = category && category !== 'any' ? [category] : CATEGORIES;
  const diffs = difficulty && difficulty !== 'mixed' ? [difficulty] : DIFFICULTIES;
  const past = await PracticeSession.find({ user: userId }).sort({ _id: -1 }).limit(200).select('items.question');
  const seen = past.flatMap((s) => s.items.map((i) => i.question));
  const chosen = []; let notice = '';

  const run = async ({ category, difficulty, n }) => {
    const take = (exclude, size) => PracticeQuestion.aggregate([{ $match: { category, difficulty, _id: { $nin: exclude } } }, { $sample: { size } }]);
    let got = await take(seen, n);
    if (got.length < n && aiEnabled()) {
      try { await generateQuestions({ category, difficulty, count: Math.max(5, n - got.length + 3) }); got = await take(seen, n); }
      catch (e) { console.error('AI generation failed:', e.message); notice = 'AI se naye sawal nahi ban paaye, isliye purane sawal diye gaye hain.'; }
    }
    if (got.length < n) got = got.concat(await take(got.map((g) => g._id), n - got.length)); // last resort: repeat older questions
    chosen.push(...got);
  };
  const slots = planSlots(cats, diffs, count);
  for (let i = 0; i < slots.length; i += 4) await Promise.all(slots.slice(i, i + 4).map(run)); // max 4 parallel AI calls

  const questions = shuffle(chosen).slice(0, count);
  if (questions.length < count && !notice) notice = aiEnabled() ? `Sirf ${questions.length} sawal mil paaye.` : `Sirf ${questions.length} sawal available hain. Aur sawal ke liye backend/.env mein ANTHROPIC_API_KEY set karo.`;
  return { questions, notice };
}