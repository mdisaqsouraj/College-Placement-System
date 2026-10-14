import { Router } from 'express';
import { authenticate, requireRoles, requireStaff } from '../middleware/auth.js';
import { Test, Attempt, Question } from '../models/Exam.js';
import User from '../models/User.js';
import { ROLES, BRANCHES } from '../constants.js';
import { isAdmin, validateTargets, canManageTest, canViewResults, studentScopeFilter, inScope } from '../services/permissions.js';
import { studentTargeted, targetFilter } from '../services/targeting.js';
import { effectiveStatus, resultVisible } from '../services/exam.js';
import { finalizeAttempt, answersToMap, scorable } from '../services/attempts.js';
import { notifyUsers, audit } from '../services/notify.js';
import { toXlsx, XLSX_MIME } from '../utils/xlsx.js';
import { HttpError, asyncHandler, isId, requireId, paginate, pageResult, isWeekendIST, toCsv } from '../utils/index.js';

const router = Router();
router.use(authenticate);

/* ---------------- student: tests assigned to me ---------------- */
router.get('/available', requireRoles(ROLES.STUDENT), asyncHandler(async (req, res) => {
  const now = new Date();
  const tests = (await Test.find({ status: 'published' }).select('-questions').sort({ startTime: -1 }).limit(300)).filter((t) => studentTargeted(t.targets, req.user));
  const attempts = await Attempt.find({ student: req.user._id, test: { $in: tests.map((t) => t._id) } });
  const byTest = new Map(attempts.map((a) => [String(a.test), a]));
  res.json({
    items: tests.map((t) => {
      const a = byTest.get(String(t._id));
      const done = a && a.status !== 'in_progress';
      return {
        id: t._id, title: t.title, description: t.description, durationMinutes: t.durationMinutes, startTime: t.startTime, deadline: t.deadline,
        totalMarks: t.totalMarks, questionCount: t.questionCount, negativeMarks: t.negativeMarks, state: effectiveStatus(t, now),
        attempt: a ? { id: a._id, status: a.status, score: done && resultVisible(t, now) ? a.score : null } : null,
      };
    }),
  });
}));

/* ---------------- staff ---------------- */
router.use(requireStaff);

const listOf = (v, f) => (Array.isArray(v) ? v.map(f).filter((x) => x !== null && x !== undefined && x !== '' && !Number.isNaN(x)) : []);

async function parseTargets(user, raw = {}) {
  const t = {
    branches: listOf(raw.branches, String).filter((b) => BRANCHES.includes(b)),
    years: listOf(raw.years, Number).filter((y) => y >= 1 && y <= 4),
    batches: listOf(raw.batches, (b) => String(b).trim()),
    students: [...new Set(listOf(raw.students, String).filter(isId))],
  };
  const v = validateTargets(user, t);
  if (!v.ok) throw new HttpError(403, v.error);
  if (t.students.length && !isAdmin(user)) {
    const n = await User.countDocuments({ _id: { $in: t.students }, ...studentScopeFilter(user) });
    if (n !== t.students.length) throw new HttpError(403, 'Some selected students are outside your authorised branches/years');
  }
  return t;
}

async function buildQuestions(user, body) {
  const out = [];
  for (const q of Array.isArray(body.questions) ? body.questions : []) {
    const options = Array.isArray(q.options) ? q.options.map((o) => String(o?.text ?? o).trim()).filter(Boolean) : [];
    const correctIndex = Number(q.correctIndex);
    if (String(q.text || '').trim().length < 3) throw new HttpError(400, 'Each question needs text');
    if (options.length < 2 || options.length > 6) throw new HttpError(400, 'Each question needs 2 to 6 options');
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) throw new HttpError(400, 'Each question needs a valid correct option');
    out.push({ text: String(q.text).trim(), topic: q.topic, options: options.map((text) => ({ text })), correctIndex, marks: Number(q.marks) || 1, explanation: q.explanation });
  }
  const ids = listOf(body.bankQuestionIds, String).filter(isId);
  if (ids.length) {
    const docs = await Question.find({ _id: { $in: ids } });
    const map = new Map(docs.map((d) => [String(d._id), d]));
    for (const id of ids) { const d = map.get(id); if (d) out.push({ text: d.text, topic: d.topic, options: d.options.map((text) => ({ text })), correctIndex: d.correctIndex, marks: d.marks, explanation: d.explanation }); }
  }
  return out;
}

function scalarFields(b) {
  const f = {};
  for (const k of ['title', 'description', 'instructions']) if (typeof b[k] === 'string') f[k] = b[k].trim();
  f.durationMinutes = Number(b.durationMinutes);
  f.startTime = new Date(b.startTime); f.deadline = new Date(b.deadline);
  f.negativeMarks = Number(b.negativeMarks) || 0;
  for (const k of ['shuffleQuestions', 'shuffleOptions', 'enforceWeekend']) if (typeof b[k] === 'boolean') f[k] = b[k];
  if (['immediate', 'after_deadline', 'manual'].includes(b.resultPolicy)) f.resultPolicy = b.resultPolicy;
  if (['none', 'after_deadline', 'immediate'].includes(b.reviewPolicy)) f.reviewPolicy = b.reviewPolicy;
  if (!f.title) throw new HttpError(400, 'Title is required');
  if (!(f.durationMinutes >= 1 && f.durationMinutes <= 300)) throw new HttpError(400, 'Duration must be 1-300 minutes');
  if (isNaN(f.startTime) || isNaN(f.deadline)) throw new HttpError(400, 'Valid start time and deadline are required');
  if (f.deadline <= f.startTime) throw new HttpError(400, 'Deadline must be after the start time');
  if (f.enforceWeekend && (!isWeekendIST(f.startTime) || !isWeekendIST(f.deadline))) throw new HttpError(400, 'Weekend scheduling is enabled: start and deadline must fall on Saturday/Sunday (IST)');
  return f;
}

const withAnswers = (t) => t; // staff views include correctIndex; students never reach these routes

async function load(req, id, { results = false } = {}) {
  const t = await Test.findById(requireId(id));
  if (!t || !canManageTest(req.user, t)) throw new HttpError(404, 'Test not found'); // 404, not 403: do not reveal other people's tests
  if (results && !canViewResults(req.user, t)) throw new HttpError(403, 'You are not allowed to view results');
  return t;
}

router.get('/', asyncHandler(async (req, res) => {
  const p = paginate(req);
  const filter = isAdmin(req.user) ? {} : { createdBy: req.user._id };
  if (req.query.status) filter.status = String(req.query.status);
  const [rows, total] = await Promise.all([Test.find(filter).select('-questions').populate('createdBy', 'name role').sort({ createdAt: -1 }).skip(p.skip).limit(p.limit), Test.countDocuments(filter)]);
  const now = new Date();
  res.json(pageResult(rows.map((t) => ({ ...t.toObject(), effectiveStatus: effectiveStatus(t, now) })), total, p));
}));

router.post('/', asyncHandler(async (req, res) => {
  const targets = await parseTargets(req.user, req.body.targets);
  const t = await Test.create({ ...scalarFields(req.body), targets, questions: await buildQuestions(req.user, req.body), createdBy: req.user._id, status: 'draft' });
  await audit(req, 'test.create', { targetType: 'Test', targetId: t._id, details: { branches: targets.branches } });
  res.status(201).json(withAnswers(t));
}));

router.get('/:id', asyncHandler(async (req, res) => res.json(withAnswers(await load(req, req.params.id)))));

router.put('/:id', asyncHandler(async (req, res) => {
  const t = await load(req, req.params.id);
  if (t.status !== 'draft') throw new HttpError(409, 'Only draft tests can be edited');
  const targets = await parseTargets(req.user, req.body.targets);
  t.set({ ...scalarFields(req.body), targets, questions: await buildQuestions(req.user, req.body) });
  await t.save();
  res.json(withAnswers(t));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const t = await load(req, req.params.id);
  if (t.status === 'published' || (await Attempt.exists({ test: t._id }))) throw new HttpError(409, 'Tests that are published or have attempts cannot be deleted; close them instead');
  await t.deleteOne();
  await audit(req, 'test.delete', { targetType: 'Test', targetId: t._id });
  res.json({ message: 'Deleted' });
}));

async function publishNow(req, t, by) {
  t.status = 'published'; t.approval = { ...(t.toObject().approval || {}), decidedBy: by._id, decidedAt: new Date() };
  await t.save();
  const students = await User.find(targetFilter(t.targets)).select('_id');
  await notifyUsers(students.map((s) => s._id), { title: `New test: ${t.title}`, message: `Opens ${t.startTime.toLocaleString('en-IN')}, closes ${t.deadline.toLocaleString('en-IN')}`, type: 'test', link: '/tests' });
  return students.length;
}

router.post('/:id/publish', asyncHandler(async (req, res) => {
  const t = await load(req, req.params.id);
  if (t.status !== 'draft') throw new HttpError(409, 'Only draft tests can be published');
  if (!t.questions.length) throw new HttpError(400, 'Add at least one question first');
  if (t.deadline <= new Date()) throw new HttpError(400, 'The deadline has already passed');
  await parseTargets(req.user, t.toObject().targets); // re-check authorisation: permissions may have changed since the draft was saved
  if (isAdmin(req.user) || req.user.coordinator.canPublishDirectly) {
    const n = await publishNow(req, t, req.user);
    await audit(req, 'test.publish', { targetType: 'Test', targetId: t._id, details: { assigned: n } });
    return res.json({ status: t.status, assigned: n });
  }
  t.status = 'pending_approval'; t.approval = { requestedAt: new Date() };
  await t.save();
  const admins = await User.find({ role: ROLES.ADMIN, active: true }).select('_id');
  await notifyUsers(admins.map((a) => a._id), { title: 'Test awaiting approval', message: `${req.user.name} requested approval for "${t.title}"`, type: 'approval', link: '/manage/tests' });
  await audit(req, 'test.request_approval', { targetType: 'Test', targetId: t._id });
  res.json({ status: t.status });
}));

router.post('/:id/approve', asyncHandler(async (req, res) => {
  if (!isAdmin(req.user)) throw new HttpError(403, 'TPO admin only');
  const t = await Test.findById(requireId(req.params.id));
  if (!t || t.status !== 'pending_approval') throw new HttpError(409, 'Test is not awaiting approval');
  if (t.deadline <= new Date()) throw new HttpError(400, 'The deadline has already passed');
  const n = await publishNow(req, t, req.user);
  await notifyUsers([t.createdBy], { title: 'Test approved', message: `"${t.title}" was approved and published`, type: 'approval', link: '/manage/tests' });
  await audit(req, 'test.approve', { targetType: 'Test', targetId: t._id, details: { assigned: n } });
  res.json({ status: t.status, assigned: n });
}));

router.post('/:id/reject', asyncHandler(async (req, res) => {
  if (!isAdmin(req.user)) throw new HttpError(403, 'TPO admin only');
  const t = await Test.findById(requireId(req.params.id));
  if (!t || t.status !== 'pending_approval') throw new HttpError(409, 'Test is not awaiting approval');
  const note = String(req.body.note || '').slice(0, 300);
  t.status = 'draft'; t.approval = { ...(t.toObject().approval || {}), decidedBy: req.user._id, decidedAt: new Date(), note };
  await t.save();
  await notifyUsers([t.createdBy], { title: 'Test rejected', message: `"${t.title}" was returned to draft. ${note}`, type: 'approval', link: '/manage/tests' });
  await audit(req, 'test.reject', { targetType: 'Test', targetId: t._id, details: { note } });
  res.json({ status: t.status });
}));

router.post('/:id/close', asyncHandler(async (req, res) => {
  const t = await load(req, req.params.id);
  if (t.status !== 'published') throw new HttpError(409, 'Only published tests can be closed');
  t.status = 'closed'; await t.save();
  const open = await Attempt.find({ test: t._id, status: 'in_progress' }).select('_id');
  for (const a of open) await finalizeAttempt(a._id, 'closed');
  await audit(req, 'test.close', { targetType: 'Test', targetId: t._id, details: { finalized: open.length } });
  res.json({ status: t.status, finalized: open.length });
}));

router.post('/:id/release-results', asyncHandler(async (req, res) => {
  const t = await load(req, req.params.id, { results: true });
  if (t.resultsReleased) return res.json({ released: true });
  t.resultsReleased = true; await t.save();
  const atts = await Attempt.find({ test: t._id, status: { $ne: 'in_progress' } }).select('student');
  await notifyUsers(atts.map((a) => a.student), { title: 'Results released', message: `Results for "${t.title}" are available`, type: 'result', link: '/tests' });
  await audit(req, 'test.release_results', { targetType: 'Test', targetId: t._id });
  res.json({ released: true });
}));

async function collectRows(req, t) {
  const students = (await User.find(targetFilter(t.toObject().targets))).filter((s) => inScope(req.user, s.student));
  const attempts = await Attempt.find({ test: t._id });
  const byStudent = new Map(attempts.map((a) => [String(a.student), a]));
  return students.map((s) => {
    const a = byStudent.get(String(s._id));
    return {
      studentId: s._id, name: s.name, email: s.email, rollNo: s.student?.rollNo, branch: s.student?.branch, year: s.student?.year,
      status: a ? a.status : 'not_started', score: a?.status !== 'in_progress' ? a?.score : undefined, totalMarks: a?.totalMarks ?? t.totalMarks,
      correct: a?.correct, wrong: a?.wrong, unanswered: a?.unanswered, tabSwitches: a?.tabSwitches, reason: a?.finalizeReason, submittedAt: a?.submittedAt,
    };
  }).sort((x, y) => (y.score ?? -1) - (x.score ?? -1));
}

router.get('/:id/results', asyncHandler(async (req, res) => {
  const t = await load(req, req.params.id, { results: true });
  const rows = await collectRows(req, t);
  const done = rows.filter((r) => r.score !== undefined && r.score !== null);
  const scores = done.map((r) => r.score);
  const p = paginate(req, 200);
  res.json({
    test: { id: t._id, title: t.title, totalMarks: t.totalMarks, status: effectiveStatus(t), resultsReleased: t.resultsReleased, resultPolicy: t.resultPolicy },
    summary: { targeted: rows.length, started: rows.filter((r) => r.status !== 'not_started').length, submitted: done.length, notStarted: rows.filter((r) => r.status === 'not_started').length, average: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : null, highest: scores.length ? Math.max(...scores) : null, lowest: scores.length ? Math.min(...scores) : null },
    ...pageResult(rows.slice(p.skip, p.skip + p.limit), rows.length, p),
  });
}));

const RESULT_HEADER = ['Name', 'Email', 'Roll No', 'Branch', 'Year', 'Status', 'Score', 'Total Marks', 'Correct', 'Wrong', 'Unanswered', 'Tab Switches', 'Finalized By', 'Submitted At (IST)'];
const resultRow = (r) => [r.name, r.email, r.rollNo, r.branch, r.year, r.status, r.score, r.totalMarks, r.correct, r.wrong, r.unanswered, r.tabSwitches, r.reason, r.submittedAt ? new Date(r.submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : ''];

router.get('/:id/results.csv', asyncHandler(async (req, res) => {
  const t = await load(req, req.params.id, { results: true });
  const rows = await collectRows(req, t);
  await audit(req, 'test.export_results', { targetType: 'Test', targetId: t._id, details: { rows: rows.length, format: 'csv' } });
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="results-${t._id}.csv"` }).send(toCsv(RESULT_HEADER, rows.map(resultRow)));
}));

// Excel file with auto-fitted column widths
router.get('/:id/results.xlsx', asyncHandler(async (req, res) => {
  const t = await load(req, req.params.id, { results: true });
  const rows = await collectRows(req, t);
  await audit(req, 'test.export_results', { targetType: 'Test', targetId: t._id, details: { rows: rows.length, format: 'xlsx' } });
  const buf = await toXlsx('Results', RESULT_HEADER, rows.map(resultRow));
  res.set({ 'Content-Type': XLSX_MIME, 'Content-Disposition': `attachment; filename="results-${t._id}.xlsx"` }).send(buf);
}));

router.get('/:id/analytics', asyncHandler(async (req, res) => {
  const t = await load(req, req.params.id, { results: true });
  const attempts = await Attempt.find({ test: t._id, status: { $ne: 'in_progress' } });
  const stats = new Map(t.questions.map((q) => [String(q._id), { attempted: 0, correct: 0 }]));
  const correctOf = new Map(scorable(t).map((q) => [String(q.id), String(q.correctOptionId)]));
  for (const a of attempts) for (const [qid, oid] of Object.entries(answersToMap(a.answers))) {
    const s = stats.get(qid); if (!s || !oid) continue;
    s.attempted++; if (correctOf.get(qid) === oid) s.correct++;
  }
  const buckets = Array.from({ length: 5 }, (_, i) => ({ range: `${i * 20}-${i * 20 + 20}%`, count: 0 }));
  for (const a of attempts) { const pct = t.totalMarks ? (a.score / t.totalMarks) * 100 : 0; buckets[Math.min(4, Math.floor(pct / 20))].count++; }
  res.json({
    attempts: attempts.length, distribution: buckets,
    questions: t.questions.map((q) => { const s = stats.get(String(q._id)); return { id: q._id, text: q.text, topic: q.topic, attempted: s.attempted, correctPercent: s.attempted ? Math.round((s.correct / s.attempted) * 100) : null }; }),
  });
}));

export default router;
