import { Router } from 'express';
import path from 'node:path';
import { authenticate, requireStaff } from '../middleware/auth.js';
import { RESUME_DIR } from '../middleware/upload.js';
import User from '../models/User.js';
import { studentScopeFilter, inScope } from '../services/permissions.js';
import { HttpError, asyncHandler, paginate, pageResult, escapeRegex, requireId } from '../utils/index.js';

const router = Router();
router.use(authenticate, requireStaff);

// Staff see ONLY students inside their authorised branch/year scope (enforced in the query itself).
router.get('/', asyncHandler(async (req, res) => {
  const p = paginate(req);
  const and = [studentScopeFilter(req.user)];
  if (req.query.branch) and.push({ 'student.branch': String(req.query.branch) });
  if (req.query.year) and.push({ 'student.year': Number(req.query.year) });
  if (req.query.search) { const rx = new RegExp(escapeRegex(String(req.query.search).slice(0, 60)), 'i'); and.push({ $or: [{ name: rx }, { email: rx }, { 'student.rollNo': rx }] }); }
  const filter = { $and: and };
  const [rows, total] = await Promise.all([User.find(filter).sort({ name: 1 }).skip(p.skip).limit(p.limit), User.countDocuments(filter)]);
  const items = rows.map((u) => ({ id: u._id, name: u.name, email: u.email, active: u.active, ...u.student?.toObject?.({ depopulate: true }), resume: undefined, hasResume: !!u.student?.resume?.file }));
  res.json(pageResult(items, total, p));
}));

router.get('/:id/resume', asyncHandler(async (req, res) => {
  const u = await User.findOne({ _id: requireId(req.params.id), role: 'student' });
  if (!u || !inScope(req.user, u.student)) throw new HttpError(404, 'Student not found');
  if (!u.student.resume?.file) throw new HttpError(404, 'No resume uploaded');
  res.type('application/pdf').sendFile(path.join(RESUME_DIR, path.basename(u.student.resume.file)));
}));

export default router;
