import { Router } from 'express';
import { authenticate, requireStaff, requireAdmin, requireRoles } from '../middleware/auth.js';
import User from '../models/User.js';
import { Application, Drive } from '../models/Placement.js';
import { Test, Attempt } from '../models/Exam.js';
import { Notification } from '../models/Misc.js';
import { PracticeProfile } from '../models/Practice.js';
import { ROLES } from '../constants.js';
import { studentScopeFilter, isAdmin } from '../services/permissions.js';
import { studentTargeted } from '../services/targeting.js';
import { effectiveStatus, resultVisible } from '../services/exam.js';
import { audit } from '../services/notify.js';
import { asyncHandler, toCsv } from '../utils/index.js';

const router = Router();
router.use(authenticate);

router.get('/overview', requireStaff, asyncHandler(async (req, res) => {
  const students = await User.find(studentScopeFilter(req.user)).select('student.branch');
  const ids = students.map((s) => s._id), branchOf = new Map(students.map((s) => [String(s._id), s.student?.branch]));
  const apps = await Application.find({ student: { $in: ids } }).populate('drive', 'ctcLpa').select('status student drive');
  const byStatus = {}, placed = new Set(), ctcs = [];
  for (const a of apps) { byStatus[a.status] = (byStatus[a.status] || 0) + 1; if (a.status === 'selected') { placed.add(String(a.student)); if (a.drive?.ctcLpa) ctcs.push(a.drive.ctcLpa); } }
  const branches = {};
  for (const s of students) { const b = s.student?.branch || 'Unknown'; (branches[b] ||= { branch: b, total: 0, placed: 0 }).total++; if (placed.has(String(s._id))) branches[b].placed++; }
  const testFilter = isAdmin(req.user) ? {} : { createdBy: req.user._id };
  const tests = await Test.find(testFilter).select('status startTime deadline');
  const now = new Date();
  res.json({
    totals: { students: students.length, placed: placed.size, placementRate: students.length ? Math.round((placed.size / students.length) * 100) : 0, applications: apps.length, avgCtcLpa: ctcs.length ? Math.round((ctcs.reduce((a, b) => a + b, 0) / ctcs.length) * 100) / 100 : null },
    applicationsByStatus: byStatus, branchWise: Object.values(branches),
    drives: isAdmin(req.user) ? { total: await Drive.countDocuments(), open: await Drive.countDocuments({ status: 'open', deadline: { $gt: now } }) } : null,
    tests: { total: tests.length, active: tests.filter((t) => effectiveStatus(t, now) === 'active').length, pendingApproval: tests.filter((t) => t.status === 'pending_approval').length },
  });
}));

router.get('/placements.csv', requireAdmin, asyncHandler(async (req, res) => {
  const apps = await Application.find().populate('student', 'name email student.rollNo student.branch student.year student.cgpa').populate({ path: 'drive', select: 'title role ctcLpa company', populate: { path: 'company', select: 'name' } });
  await audit(req, 'report.export_placements', { details: { rows: apps.length } });
  const csv = toCsv(['Student', 'Email', 'Roll No', 'Branch', 'Year', 'CGPA', 'Company', 'Drive', 'Role', 'CTC (LPA)', 'Status'],
    apps.filter((a) => a.student && a.drive).map((a) => [a.student.name, a.student.email, a.student.student?.rollNo, a.student.student?.branch, a.student.student?.year, a.student.student?.cgpa, a.drive.company?.name, a.drive.title, a.drive.role, a.drive.ctcLpa, a.status]));
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="placements.csv"' }).send(csv);
}));

router.get('/student-dashboard', requireRoles(ROLES.STUDENT), asyncHandler(async (req, res) => {
  const me = req.user, now = new Date();
  const [apps, tests, attempts, practice, unread] = await Promise.all([
    Application.find({ student: me._id }).select('status'),
    Test.find({ status: 'published', deadline: { $gt: now } }).select('-questions').sort({ startTime: 1 }).limit(100),
    Attempt.find({ student: me._id }).populate('test', 'title resultPolicy resultsReleased deadline totalMarks').sort({ updatedAt: -1 }).limit(50),
    PracticeProfile.findOne({ user: me._id }),
    Notification.countDocuments({ user: me._id, read: false }),
  ]);
  const done = new Set(attempts.filter((a) => a.status !== 'in_progress').map((a) => String(a.test?._id)));
  const s = me.student || {};
  const fields = [s.branch, s.year, s.cgpa, s.rollNo, s.skills?.length, s.resume?.file];
  const byStatus = {}; apps.forEach((a) => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; });
  res.json({
    profileCompleteness: Math.round((fields.filter((x) => x !== undefined && x !== null && x !== '' && x !== 0).length / fields.length) * 100),
    applicationsByStatus: byStatus, placed: !!byStatus.selected,
    upcomingTests: tests.filter((t) => studentTargeted(t.targets, me) && !done.has(String(t._id))).slice(0, 5).map((t) => ({ id: t._id, title: t.title, startTime: t.startTime, deadline: t.deadline, state: effectiveStatus(t, now), durationMinutes: t.durationMinutes })),
    recentResults: attempts.filter((a) => a.status !== 'in_progress' && a.test && resultVisible(a.test, now)).slice(0, 5).map((a) => ({ id: a._id, title: a.test.title, score: a.score, totalMarks: a.totalMarks })),
    practice: practice ? { xp: practice.xp, level: practice.level, streak: practice.streak, accuracy: practice.totalAttempted ? Math.round((practice.totalCorrect / practice.totalAttempted) * 100) : null } : { xp: 0, level: 1, streak: 0, accuracy: null },
    unreadNotifications: unread,
  });
}));
export default router;
