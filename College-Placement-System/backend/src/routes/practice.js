import { Router } from 'express';
import { authenticate, requireRoles, requireAdmin } from '../middleware/auth.js';
import { PracticeQuestion, PracticeSession, PracticeProfile } from '../models/Practice.js';
import User from '../models/User.js';
import { ROLES, CATEGORIES, DIFFICULTIES } from '../constants.js';
import { getQuestionsForSession } from '../services/aiQuestions.js';
import { HttpError, asyncHandler, requireId, shuffle, seededPick, istDayKey, istYesterdayKey } from '../utils/index.js';

const router = Router();
router.use(authenticate);
const XP = { easy: 10, medium: 20, hard: 30 }, SECS = { easy: 45, medium: 60, hard: 90 };
export const levelFor = (xp) => 1 + Math.floor(Math.sqrt(xp / 50));
const BADGES = {
  first_quiz: (p) => p.sessions >= 1, perfect_score: (p, s) => s.correct === s.total && s.total >= 5, streak_3: (p) => p.bestStreak >= 3, streak_7: (p) => p.bestStreak >= 7,
  xp_500: (p) => p.xp >= 500, xp_2000: (p) => p.xp >= 2000, century: (p) => p.totalCorrect >= 100, daily_hero: (p, s) => s.kind === 'daily',
};

const getProfile = async (userId) => (await PracticeProfile.findOne({ user: userId })) || PracticeProfile.create({ user: userId });
const student = requireRoles(ROLES.STUDENT);

function view(session, questions) {
  const qm = new Map(questions.map((q) => [String(q._id), q]));
  return {
    sessionId: session._id, kind: session.kind, category: session.category, difficulty: session.difficulty, timeLimitSec: session.timeLimitSec, startedAt: session.startedAt, serverNow: new Date(),
    questions: session.items.map((it) => { const q = qm.get(String(it.question)); return { id: q._id, text: q.text, topic: q.topic, difficulty: q.difficulty, options: it.order.map((i) => q.options[i]) }; }),
  };
}
async function makeSession(userId, qs, meta) {
  const items = qs.map((q) => ({ question: q._id, order: shuffle(q.options.map((_, i) => i)) }));
  const limit = qs.reduce((s, q) => s + SECS[q.difficulty], 0);
  const s = await PracticeSession.create({ user: userId, items, timeLimitSec: limit, ...meta });
  return view(s, qs);
}

router.post('/sessions', student, asyncHandler(async (req, res) => {
  const { category, difficulty } = req.body;
  const count = Math.min(20, Math.max(3, Number(req.body.count) || 5));
  if (category && category !== 'any' && !CATEGORIES.includes(category)) throw new HttpError(400, 'Invalid category');
  if (difficulty && difficulty !== 'mixed' && !DIFFICULTIES.includes(difficulty)) throw new HttpError(400, 'Invalid difficulty');
  const { questions, notice } = await getQuestionsForSession({ category, difficulty, count, userId: req.user._id });
  if (!questions.length) throw new HttpError(404, 'No questions available for this selection');
  const session = await makeSession(req.user._id, questions, { kind: 'practice', category: category || 'any', difficulty: difficulty || 'mixed' });
  res.status(201).json({ ...session, notice });
}));

router.post('/daily', student, asyncHandler(async (req, res) => {
  const dayKey = istDayKey();
  const existing = await PracticeSession.findOne({ user: req.user._id, kind: 'daily', dayKey });
  if (existing?.status === 'submitted') throw new HttpError(409, "You've completed today's challenge. Come back tomorrow!");
  if (existing) return res.json(view(existing, await PracticeQuestion.find({ _id: { $in: existing.items.map((i) => i.question) } })));
  const all = await PracticeQuestion.find().select('_id').sort({ _id: 1 });
  const ids = seededPick(all.map((q) => String(q._id)), 5, dayKey); // same 5 questions for every student that day
  if (!ids.length) throw new HttpError(404, 'No questions available');
  const qs = await PracticeQuestion.find({ _id: { $in: ids } });
  res.status(201).json(await makeSession(req.user._id, ids.map((id) => qs.find((q) => String(q._id) === id)), { kind: 'daily', dayKey, category: 'Daily Challenge', difficulty: 'mixed' }));
}));

// Scoring is done here; the client never sends marks or correctness.
router.post('/sessions/:id/submit', student, asyncHandler(async (req, res) => {
  const s = await PracticeSession.findOne({ _id: requireId(req.params.id), user: req.user._id });
  if (!s) throw new HttpError(404, 'Session not found');
  const qs = await PracticeQuestion.find({ _id: { $in: s.items.map((i) => i.question) } });
  const qm = new Map(qs.map((q) => [String(q._id), q]));
  const given = new Map((Array.isArray(req.body.answers) ? req.body.answers : []).map((a) => [String(a?.questionId), Number(a?.optionIndex)]));
  const review = s.items.map((it) => {
    const q = qm.get(String(it.question));
    const pick = given.get(String(q._id));
    const chosen = Number.isInteger(pick) && pick >= 0 && pick < it.order.length ? it.order[pick] : null; // map displayed index -> original index
    return { q, chosen, isCorrect: chosen === q.correctIndex };
  });
  const toResp = (rev, result) => ({ result, review: rev.map((r) => ({ id: r.q._id, text: r.q.text, topic: r.q.topic, options: r.q.options, correctIndex: r.q.correctIndex, selectedIndex: r.chosen, isCorrect: r.isCorrect, explanation: r.q.explanation })) });
  if (s.status === 'submitted') return res.json(toResp(review, s.result)); // idempotent

  const correct = review.filter((r) => r.isCorrect).length, total = review.length;
  const taken = Math.round((Date.now() - s.startedAt.getTime()) / 1000), overtime = taken > s.timeLimitSec + 10;
  let xp = review.reduce((sum, r) => sum + (r.isCorrect ? XP[r.q.difficulty] : 0), 0);
  if (correct === total && total >= 5) xp = Math.round(xp * 1.2);
  if (s.kind === 'daily') xp *= 2;
  if (overtime) xp = Math.floor(xp / 2);
  const result = { correct, total, xpEarned: xp, timeTakenSec: taken, overtime };
  const done = await PracticeSession.findOneAndUpdate({ _id: s._id, status: 'in_progress' }, { $set: { status: 'submitted', submittedAt: new Date(), result } });
  if (!done) return res.json(toResp(review, (await PracticeSession.findById(s._id)).result));

  const p = await getProfile(req.user._id), today = istDayKey();
  if (p.lastPracticeDay !== today) { p.streak = p.lastPracticeDay === istYesterdayKey() ? p.streak + 1 : 1; p.lastPracticeDay = today; }
  p.bestStreak = Math.max(p.bestStreak, p.streak);
  p.xp += xp; p.level = levelFor(p.xp); p.sessions += 1; p.totalAttempted += total; p.totalCorrect += correct;
  for (const r of review) {
    let t = p.topicStats.find((x) => x.category === r.q.category && x.topic === r.q.topic);
    if (!t) { p.topicStats.push({ category: r.q.category, topic: r.q.topic, attempted: 0, correct: 0 }); t = p.topicStats[p.topicStats.length - 1]; }
    t.attempted += 1; if (r.isCorrect) t.correct += 1;
  }
  const newBadges = Object.entries(BADGES).filter(([k, fn]) => !p.badges.some((b) => b.key === k) && fn(p, { correct, total, kind: s.kind })).map(([k]) => k);
  newBadges.forEach((key) => p.badges.push({ key, earnedAt: new Date() }));
  await p.save();
  res.json({ ...toResp(review, result), newBadges, profile: { xp: p.xp, level: p.level, streak: p.streak } });
}));

router.get('/profile', student, asyncHandler(async (req, res) => {
  const p = await getProfile(req.user._id);
  const topics = p.topicStats.map((t) => ({ category: t.category, topic: t.topic, attempted: t.attempted, accuracy: Math.round((t.correct / t.attempted) * 100) }));
  const history = await PracticeSession.find({ user: req.user._id, status: 'submitted' }).sort({ submittedAt: -1 }).limit(15).select('kind category difficulty result submittedAt');
  const today = await PracticeSession.exists({ user: req.user._id, kind: 'daily', dayKey: istDayKey(), status: 'submitted' });
  res.json({
    xp: p.xp, level: p.level, nextLevelXp: 50 * Math.pow(p.level, 2), streak: p.lastPracticeDay === istDayKey() || p.lastPracticeDay === istYesterdayKey() ? p.streak : 0, bestStreak: p.bestStreak,
    sessions: p.sessions, accuracy: p.totalAttempted ? Math.round((p.totalCorrect / p.totalAttempted) * 100) : null, badges: p.badges, topics,
    weakTopics: topics.filter((t) => t.attempted >= 3 && t.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy).slice(0, 5), history, dailyDone: !!today,
  });
}));

router.get('/leaderboard', asyncHandler(async (req, res) => {
  const top = await PracticeProfile.find({ xp: { $gt: 0 } }).sort({ xp: -1 }).limit(20).populate('user', 'name student.branch');
  const mine = await PracticeProfile.findOne({ user: req.user._id });
  const rank = mine ? (await PracticeProfile.countDocuments({ xp: { $gt: mine.xp } })) + 1 : null;
  res.json({ items: top.filter((t) => t.user).map((t, i) => ({ rank: i + 1, name: t.user.name, branch: t.user.student?.branch, xp: t.xp, level: t.level, streak: t.streak, me: String(t.user._id) === String(req.user._id) })), myRank: rank });
}));

router.post('/questions', requireAdmin, asyncHandler(async (req, res) => res.status(201).json(await PracticeQuestion.create(req.body))));
export default router;
