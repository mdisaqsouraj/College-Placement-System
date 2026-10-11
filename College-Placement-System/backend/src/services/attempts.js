import { Attempt, Test } from '../models/Exam.js';
import { sanitizeAnswers, scoreAnswers } from './scoring.js';
import { resultVisible } from './exam.js';

const GRACE_MS = 5000; // network latency allowance for the final answer sync

export const scorable = (test) => test.questions.map((q) => ({ id: q._id, marks: q.marks, correctOptionId: q.options[q.correctIndex]._id }));
export const sanitizable = (test) => test.questions.map((q) => ({ id: q._id, optionIds: q.options.map((o) => o._id) }));
export const answersToMap = (arr = []) => Object.fromEntries(arr.map((a) => [String(a.questionId), a.optionId ? String(a.optionId) : null]));
export const mapToAnswers = (m) => Object.entries(m).filter(([, v]) => v).map(([questionId, optionId]) => ({ questionId, optionId }));

/**
 * Idempotent finalisation. Safe to call many times / concurrently:
 * the update only matches an attempt that is still `in_progress`, so the first caller wins
 * and everyone else just receives the stored final attempt.
 */
export async function finalizeAttempt(attemptId, reason = 'manual', incoming) {
  const attempt = await Attempt.findById(attemptId);
  if (!attempt) return null;
  if (attempt.status !== 'in_progress') return attempt;
  const test = await Test.findById(attempt.test);
  const now = new Date();
  const expired = now.getTime() > attempt.expiresAt.getTime();
  let answers = answersToMap(attempt.answers);
  if (incoming && now.getTime() <= attempt.expiresAt.getTime() + GRACE_MS) {
    answers = { ...answers, ...sanitizeAnswers(sanitizable(test), incoming) };
  }
  const res = scoreAnswers(scorable(test), answers, test.negativeMarks);
  const timedOut = expired || reason === 'timeout' || reason === 'closed';
  const updated = await Attempt.findOneAndUpdate(
    { _id: attempt._id, status: 'in_progress' },
    { $set: { status: timedOut ? 'auto_submitted' : 'submitted', submittedAt: now > attempt.expiresAt ? attempt.expiresAt : now, finalizeReason: expired ? 'timeout' : reason, answers: mapToAnswers(answers), score: res.score, totalMarks: res.totalMarks, correct: res.correct, wrong: res.wrong, unanswered: res.unanswered } },
    { new: true },
  );
  return updated || Attempt.findById(attemptId);
}

/** Student-facing view of a finished attempt; marks are hidden unless the test's result policy allows them. */
export function attemptSummary(attempt, test, now = new Date()) {
  const visible = attempt.status !== 'in_progress' && resultVisible(test, now);
  return {
    id: attempt._id, testId: test._id, title: test.title, status: attempt.status, submittedAt: attempt.submittedAt, finalizeReason: attempt.finalizeReason,
    resultVisible: visible,
    result: visible ? { score: attempt.score, totalMarks: attempt.totalMarks, correct: attempt.correct, wrong: attempt.wrong, unanswered: attempt.unanswered } : null,
    message: visible ? null : 'Your attempt is submitted. Marks will be published according to the test policy.',
  };
}
