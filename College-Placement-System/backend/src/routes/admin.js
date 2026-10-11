import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import { AuditLog } from '../models/Misc.js';
import { ROLES, BRANCHES, REQUIRED_MEMBER_YEAR } from '../constants.js';
import { notifyUsers, audit } from '../services/notify.js';
import { checkPassword } from './auth.js';
import { HttpError, asyncHandler, paginate, pageResult, requireId } from '../utils/index.js';

const router = Router();
router.use(authenticate, requireAdmin); // every route here is TPO-admin only: delegates cannot promote themselves or change permissions

function parseCoordinator(b, role) {
  const branches = (b.branches || []).filter((x) => BRANCHES.includes(x));
  if (!branches.length) throw new HttpError(400, 'Select at least one branch');
  const years = (b.years || []).map(Number).filter((y) => y >= 1 && y <= 4);
  const memberYear = Number(b.memberYear);
  if (role === ROLES.MEMBER && memberYear !== REQUIRED_MEMBER_YEAR) throw new HttpError(400, `Delegated TPO members must be year ${REQUIRED_MEMBER_YEAR} students`);
  return { branches, years, memberYear: memberYear || undefined, canCreateTests: b.canCreateTests !== false, canPublishDirectly: !!b.canPublishDirectly, canViewResults: b.canViewResults !== false };
}

router.get('/members', asyncHandler(async (_req, res) => res.json({ items: await User.find({ role: { $in: [ROLES.MEMBER, ROLES.FACULTY] } }).sort({ name: 1 }) })));

router.post('/members', asyncHandler(async (req, res) => {
  const role = req.body.role === ROLES.FACULTY ? ROLES.FACULTY : ROLES.MEMBER;
  const email = String(req.body.email || '').trim().toLowerCase(), name = String(req.body.name || '').trim();
  const coordinator = { ...parseCoordinator(req.body.coordinator || {}, role), active: true, grantedBy: req.user._id, grantedAt: new Date() };
  let user = await User.findOne({ email });
  if (user) {
    if (user.role === ROLES.STUDENT || user.role === ROLES.ADMIN) throw new HttpError(409, 'This email belongs to a different account type');
    user.coordinator = coordinator; user.role = role;
  } else {
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new HttpError(400, 'Name and valid email are required');
    checkPassword(req.body.password);
    user = new User({ name, email, role, passwordHash: await bcrypt.hash(req.body.password, 12), coordinator });
  }
  await user.save();
  await notifyUsers([user._id], { title: 'Coordinator access granted', message: `You can manage tests for: ${coordinator.branches.join(', ')}`, type: 'permission', link: '/' });
  await audit(req, 'member.grant', { targetType: 'User', targetId: user._id, details: { role, ...coordinator } });
  res.status(201).json(user);
}));

router.put('/members/:id/permissions', asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: requireId(req.params.id), role: { $in: [ROLES.MEMBER, ROLES.FACULTY] } });
  if (!user) throw new HttpError(404, 'Member not found');
  user.coordinator = { ...parseCoordinator(req.body, user.role), active: true, grantedBy: req.user._id, grantedAt: new Date() };
  await user.save();
  await notifyUsers([user._id], { title: 'Permissions updated', message: `Your authorised branches: ${user.coordinator.branches.join(', ')}`, type: 'permission' });
  await audit(req, 'member.update_permissions', { targetType: 'User', targetId: user._id, details: user.coordinator });
  res.json(user);
}));

router.delete('/members/:id/permissions', asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: requireId(req.params.id), role: { $in: [ROLES.MEMBER, ROLES.FACULTY] } });
  if (!user) throw new HttpError(404, 'Member not found');
  user.coordinator.active = false; user.coordinator.revokedAt = new Date();
  await user.save();
  await notifyUsers([user._id], { title: 'Coordinator access revoked', message: 'Your test-management permissions were removed.', type: 'permission' });
  await audit(req, 'member.revoke', { targetType: 'User', targetId: user._id });
  res.json(user);
}));

router.get('/audit-logs', asyncHandler(async (req, res) => {
  const p = paginate(req, 100);
  const filter = req.query.action ? { action: new RegExp('^' + String(req.query.action).replace(/[^a-z_.]/gi, '')) } : {};
  const [items, total] = await Promise.all([AuditLog.find(filter).populate('actor', 'name email').sort({ createdAt: -1 }).skip(p.skip).limit(p.limit), AuditLog.countDocuments(filter)]);
  res.json(pageResult(items, total, p));
}));
export default router;
