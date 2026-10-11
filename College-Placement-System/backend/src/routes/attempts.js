import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { Test, Attempt } from '../models/Exam.js';
import { ROLES } from '../constants.js';
import { studentTargeted } from '../services/targeting.js';
import { reviewVisible } from '../services/exam.js';
import { sanitizeAnswers } from '../services/scoring.js';
import { finalizeAttempt, attemptSummary, answersToMap, mapToAnswers, sanitizable } from '../services/attempts.js';
import { HttpError, asyncHandler, requireId, shuffle } from '../utils/index.js';

const router = Router();
router.use(authenticate, requireRoles(ROLES.STUDENT));

// Builds the payload the exam UI needs. It NEVER contains correct answers.
function payload(attempt, test) {
  const qmap = new Map(test.questions.map((q) => [String(q._id), q]));
  return {
    attemptId: attempt._id, testId: test._id, title: test.title, instructions: test.instructions, durationMinutes: test.durationMinutes,
    negativeMarks: test.negativeMarks, totalMarks: test.totalMarks, expiresAt: attempt.expiresAt, serverNow: new Date(),
    answers: answersToMap(attempt.answers), tabSwitches: attempt.tabSwitches,
    questions: attempt.order.map((o) => {
      const q = qmap.get(String(o.questionId));
      const opts = new Map(q.options.map((x) => [String(x._id), x]));
      return { id: q._id, text: q.text, marks: q.marks, options: o.optionOrder.map((id) => ({ id, text: opts.get(String(id)).text })) };
    }),
  };
}

async function owned(req) {
  const a = await Attempt.findOne({ _id: requireId(req.params.id), student: req.user._id });
  if (!a) throw new HttpError(404, 'Attempt not found');
  return a;
}

router.post('/start', asyncHandler(async (req, res) => {
  const test = await Test.findById(requireId(req.body.testId, 'testId'));
  if (!test || test.status !== 'published' || !studentTargeted(test.targets, req.user)) throw new HttpError(404, 'Test not found');
  const now = new Date();
  let attempt = await Attempt.findOne({ test: test._id, student: req.user._id });
  if (attempt) {
    if (attempt.status === 'in_progress' && attempt.expiresAt <= now) attempt = await finalizeAttempt(attempt._id, 'timeout');
    if (attempt.status !== 'in_progress') throw new HttpError(409, 'You have already completed this test', { attemptId: attempt._id });
    return res.json(payload(attempt, test)); // resume after refresh / network failure
  }
  if (now < test.startTime) throw new HttpError(403, 'This test has not started yet');
  if (now >= test.deadline) throw new HttpError(403, 'This test is closed');
  const expiresAt = new Date(Math.min(now.getTime() + test.durationMinutes * 60000, test.deadline.getTime()));
  const qs = test.shuffleQuestions ? shuffle(test.questions) : [...test.questions];
  const order = qs.map((q) => ({ questionId: q._id, optionOrder: (test.shuffleOptions ? shuffle(q.options) : q.options).map((o) => o._id) }));
  try {
    attempt = await Attempt.create({ test: test._id, student: req.user._id, startedAt: now, expiresAt, order });
  } catch (e) {
    if (e.code !== 11000) throw e; // double-click / two tabs: reuse the attempt created first
    attempt = await Attempt.findOne({ test: test._id, student: req.user._id });
  }
  res.status(201).json(payload(attempt, test));
}));

router.get('/mine', asyncHandler(async (req, res) => {
  const attempts = await Attempt.find({ student: req.user._id }).populate('test', 'title startTime deadline resultPolicy resultsReleased reviewPolicy totalMarks').sort({ createdAt: -1 }).limit(100);
  const now = new Date();
  res.json({ items: attempts.filter((a) => a.test).map((a) => attemptSummary(a, a.test, now)) });
}));

// Autosave: merges answers; the server rejects saves after expiry and finalises instead.
router.put('/:id/answers', asyncHandler(async (req, res) => {
  const a = await owned(req);
  const now = new Date();
  if (a.status !== 'in_progress') throw new HttpError(409, 'Attempt already submitted', { finalized: true });
  if (now > a.expiresAt) { await finalizeAttempt(a._id, 'timeout'); throw new HttpError(409, 'Time is up; your attempt was submitted', { finalized: true }); }
  const test = await Test.findById(a.test);
  const merged = { ...answersToMap(a.answers), ...sanitizeAnswers(sanitizable(test), req.body.answers) };
  const tabs = Math.min(1000, Math.max(a.tabSwitches, Number(req.body.tabSwitches) || 0));
  const upd = await Attempt.findOneAndUpdate({ _id: a._id, status: 'in_progress' }, { $set: { answers: mapToAnswers(merged), lastSavedAt: now, tabSwitches: tabs } }, { new: true });
  if (!upd) throw new HttpError(409, 'Attempt already submitted', { finalized: true });
  res.json({ savedAt: now, serverNow: now, expiresAt: a.expiresAt });
}));

const REASONS = ['manual', 'back_navigation', 'timeout', 'page_unload', 'fullscreen_exit'];
router.post('/:id/submit', asyncHandler(async (req, res) => {
  const a = await owned(req);
  const reason = REASONS.includes(req.body.reason) ? req.body.reason : 'manual';
  const final = await finalizeAttempt(a._id, reason, req.body.answers); // idempotent
  const test = await Test.findById(final.test).select('-questions');
  res.json(attemptSummary(final, test));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  let a = await owned(req);
  if (a.status === 'in_progress' && a.expiresAt <= new Date()) a = await finalizeAttempt(a._id, 'timeout'); // lazy auto-finalisation
  const test = await Test.findById(a.test).select('-questions');
  const now = new Date();
  res.json({ ...attemptSummary(a, test, now), reviewAvailable: a.status !== 'in_progress' && reviewVisible(test, now) });
}));

router.get('/:id/review', asyncHandler(async (req, res) => {
  const a = await owned(req);
  const test = await Test.findById(a.test);
  if (a.status === 'in_progress') throw new HttpError(409, 'Submit the test first');
  if (!reviewVisible(test)) throw new HttpError(403, 'Answer review is not available yet for this test');
  const mine = answersToMap(a.answers);
  res.json({ items: test.questions.map((q) => {
    const correct = q.options[q.correctIndex]._id;
    return { id: q._id, text: q.text, explanation: q.explanation, marks: q.marks, options: q.options.map((o) => ({ id: o._id, text: o.text })), correctOptionId: correct, selectedOptionId: mine[String(q._id)] || null };
  }) });
}));
export default router;
