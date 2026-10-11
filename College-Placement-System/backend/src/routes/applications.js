import { Router } from 'express';
import { authenticate, requireRoles, requireAdmin } from '../middleware/auth.js';
import { Application, Drive } from '../models/Placement.js';
import { ROLES, APPLICATION_STATUSES } from '../constants.js';
import { checkEligibility } from '../services/eligibility.js';
import { notifyUsers, audit } from '../services/notify.js';
import { HttpError, asyncHandler, paginate, pageResult, requireId } from '../utils/index.js';

const router = Router();
router.use(authenticate);

router.post('/', requireRoles(ROLES.STUDENT), asyncHandler(async (req, res) => {
  const drive = await Drive.findById(requireId(req.body.driveId, 'driveId'));
  if (!drive) throw new HttpError(404, 'Drive not found');
  if (drive.status !== 'open' || drive.deadline < new Date()) throw new HttpError(409, 'Applications are closed for this drive');
  if (!req.user.student?.resume?.file) throw new HttpError(400, 'Upload your resume before applying');
  const el = checkEligibility(req.user.student, drive);
  if (!el.eligible) throw new HttpError(403, 'You are not eligible for this drive', { reasons: el.reasons });
  const app = await Application.create({ drive: drive._id, student: req.user._id, history: [{ status: 'applied', by: req.user._id }] }); // unique index blocks duplicates
  res.status(201).json(app);
}));

router.get('/mine', requireRoles(ROLES.STUDENT), asyncHandler(async (req, res) => {
  const items = await Application.find({ student: req.user._id }).populate({ path: 'drive', select: 'title role ctcLpa deadline driveDate company', populate: { path: 'company', select: 'name' } }).sort({ createdAt: -1 });
  res.json({ items });
}));

router.post('/:id/withdraw', requireRoles(ROLES.STUDENT), asyncHandler(async (req, res) => {
  const a = await Application.findOne({ _id: requireId(req.params.id), student: req.user._id });
  if (!a) throw new HttpError(404, 'Application not found');
  if (!['applied', 'shortlisted'].includes(a.status)) throw new HttpError(409, 'Cannot withdraw at this stage');
  a.status = 'withdrawn'; a.history.push({ status: 'withdrawn', by: req.user._id });
  await a.save();
  res.json(a);
}));

// Placement-office management is TPO admin only.
router.get('/', requireAdmin, asyncHandler(async (req, res) => {
  const p = paginate(req);
  const filter = {};
  if (req.query.driveId) filter.drive = requireId(req.query.driveId, 'driveId');
  if (req.query.status) filter.status = String(req.query.status);
  const [items, total] = await Promise.all([
    Application.find(filter).populate('student', 'name email student.rollNo student.branch student.year student.cgpa').populate({ path: 'drive', select: 'title company', populate: { path: 'company', select: 'name' } }).sort({ createdAt: -1 }).skip(p.skip).limit(p.limit),
    Application.countDocuments(filter),
  ]);
  res.json(pageResult(items, total, p));
}));

router.patch('/:id/status', requireAdmin, asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  if (!APPLICATION_STATUSES.includes(status) || status === 'withdrawn') throw new HttpError(400, 'Invalid status');
  const a = await Application.findById(requireId(req.params.id)).populate('drive', 'title');
  if (!a) throw new HttpError(404, 'Application not found');
  if (a.status === 'withdrawn') throw new HttpError(409, 'Application was withdrawn by the student');
  a.status = status; a.history.push({ status, note: typeof note === 'string' ? note.slice(0, 300) : undefined, by: req.user._id });
  await a.save();
  await notifyUsers([a.student], { title: `Application ${status}`, message: `Your application for "${a.drive.title}" is now ${status}.`, type: 'application', link: '/applications' });
  await audit(req, 'application.status', { targetType: 'Application', targetId: a._id, details: { status } });
  res.json(a);
}));
export default router;
