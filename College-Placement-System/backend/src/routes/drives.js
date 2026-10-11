import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { Drive, Application, Company } from '../models/Placement.js';
import User from '../models/User.js';
import { ROLES, BRANCHES } from '../constants.js';
import { checkEligibility } from '../services/eligibility.js';
import { notifyUsers, audit } from '../services/notify.js';
import { HttpError, asyncHandler, paginate, pageResult, requireId } from '../utils/index.js';

const router = Router();
router.use(authenticate);

function driveFields(b) {
  const out = {};
  for (const k of ['title', 'role', 'location', 'description']) if (typeof b[k] === 'string') out[k] = b[k].trim();
  if (b.company) out.company = requireId(b.company, 'company');
  if (b.ctcLpa !== undefined && b.ctcLpa !== '') out.ctcLpa = Number(b.ctcLpa);
  if (b.deadline) out.deadline = new Date(b.deadline);
  if (b.driveDate) out.driveDate = new Date(b.driveDate);
  if (['open', 'closed'].includes(b.status)) out.status = b.status;
  if (Array.isArray(b.rounds)) out.rounds = b.rounds.map(String).map((s) => s.trim()).filter(Boolean);
  const e = b.eligibility || {};
  out.eligibility = {
    minCgpa: Number(e.minCgpa) || 0,
    maxBacklogs: e.maxBacklogs === '' || e.maxBacklogs == null ? 0 : Number(e.maxBacklogs),
    branches: (e.branches || []).filter((x) => BRANCHES.includes(x)),
    years: (e.years || []).map(Number).filter((y) => y >= 1 && y <= 4),
    requiredSkills: (Array.isArray(e.requiredSkills) ? e.requiredSkills : String(e.requiredSkills || '').split(',')).map((s) => String(s).trim()).filter(Boolean),
  };
  if (out.deadline && isNaN(out.deadline)) throw new HttpError(400, 'Invalid deadline');
  return out;
}

router.get('/', asyncHandler(async (req, res) => {
  const p = paginate(req);
  const filter = {};
  if (req.query.status) filter.status = String(req.query.status);
  const isStudent = req.user.role === ROLES.STUDENT;
  const [rows, total] = await Promise.all([Drive.find(filter).populate('company', 'name industry location').sort({ deadline: -1 }).skip(p.skip).limit(p.limit), Drive.countDocuments(filter)]);
  let applied = new Map();
  if (isStudent) (await Application.find({ student: req.user._id, drive: { $in: rows.map((d) => d._id) } })).forEach((a) => applied.set(String(a.drive), a));
  const items = rows.map((d) => {
    const o = d.toObject();
    if (isStudent) {
      o.eligibility_result = checkEligibility(req.user.student, d);
      o.application = applied.get(String(d._id)) ? { id: applied.get(String(d._id))._id, status: applied.get(String(d._id)).status } : null;
      o.open = d.status === 'open' && d.deadline > new Date();
    }
    return o;
  });
  res.json(pageResult(items, total, p));
}));

router.get('/:id/eligibility', asyncHandler(async (req, res) => {
  const d = await Drive.findById(requireId(req.params.id));
  if (!d) throw new HttpError(404, 'Drive not found');
  res.json(checkEligibility(req.user.student, d));
}));

router.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const f = driveFields(req.body);
  if (!(await Company.exists({ _id: f.company }))) throw new HttpError(400, 'Company not found');
  const d = await Drive.create({ ...f, createdBy: req.user._id });
  const students = await User.find({ role: ROLES.STUDENT, active: true });
  const eligible = students.filter((s) => checkEligibility(s.student, d).eligible).map((s) => s._id);
  await notifyUsers(eligible, { title: `New drive: ${d.title}`, message: `Apply before ${d.deadline.toLocaleDateString('en-IN')}`, type: 'drive', link: '/drives' });
  await audit(req, 'drive.create', { targetType: 'Drive', targetId: d._id });
  res.status(201).json(d);
}));
router.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const d = await Drive.findByIdAndUpdate(requireId(req.params.id), { $set: driveFields(req.body) }, { new: true, runValidators: true });
  if (!d) throw new HttpError(404, 'Drive not found');
  res.json(d);
}));
router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const id = requireId(req.params.id);
  if (await Application.exists({ drive: id })) throw new HttpError(409, 'Drive has applications; close it instead of deleting');
  if (!(await Drive.findByIdAndDelete(id))) throw new HttpError(404, 'Drive not found');
  await audit(req, 'drive.delete', { targetType: 'Drive', targetId: id });
  res.json({ message: 'Deleted' });
}));
export default router;
