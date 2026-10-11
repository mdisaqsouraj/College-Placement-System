import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { ROLES, BRANCHES, YEARS } from '../constants.js';
import { HttpError, asyncHandler } from '../utils/index.js';
import { authenticate, signToken } from '../middleware/auth.js';

const router = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many attempts, try again later' } });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const str = (v) => (typeof v === 'string' ? v.trim() : '');

export const checkPassword = (p) => {
  if (typeof p !== 'string' || p.length < 8 || p.length > 72) throw new HttpError(400, 'Password must be 8-72 characters');
  if (!/[A-Za-z]/.test(p) || !/\d/.test(p)) throw new HttpError(400, 'Password must contain letters and numbers');
};

router.post('/register', limiter, asyncHandler(async (req, res) => {
  const name = str(req.body.name), email = str(req.body.email).toLowerCase(), branch = str(req.body.branch);
  const year = Number(req.body.year), rollNo = str(req.body.rollNo) || undefined, batch = str(req.body.batch) || undefined;
  if (name.length < 2) throw new HttpError(400, 'Name is required');
  if (!EMAIL.test(email)) throw new HttpError(400, 'Valid email is required');
  checkPassword(req.body.password);
  if (!BRANCHES.includes(branch)) throw new HttpError(400, 'Select a valid branch');
  if (!YEARS.includes(year)) throw new HttpError(400, 'Select a valid year');
  if (await User.exists({ email })) throw new HttpError(409, 'Email already registered');
  // Self-registration can ONLY create students; role is never read from the request.
  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(req.body.password, 12), role: ROLES.STUDENT, student: { branch, year, rollNo, batch, backlogs: 0, skills: [] } });
  res.status(201).json({ token: signToken(user), user });
}));

router.post('/login', limiter, asyncHandler(async (req, res) => {
  const email = str(req.body.email).toLowerCase();
  const user = await User.findOne({ email }).select('+passwordHash');
  const ok = user && user.active && typeof req.body.password === 'string' && await bcrypt.compare(req.body.password, user.passwordHash);
  if (!ok) throw new HttpError(401, 'Invalid email or password');
  res.json({ token: signToken(user), user });
}));

router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));

router.post('/change-password', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!(await bcrypt.compare(String(req.body.currentPassword || ''), user.passwordHash))) throw new HttpError(400, 'Current password is incorrect');
  checkPassword(req.body.newPassword);
  user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
  await user.save();
  res.json({ message: 'Password updated' });
}));

export default router;
