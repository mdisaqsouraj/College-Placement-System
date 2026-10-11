import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { HttpError, asyncHandler } from '../utils/index.js';
import { isAdmin, isStaff } from '../services/permissions.js';

export const signToken = (user) => jwt.sign({ sub: String(user._id) }, env.jwtSecret, { expiresIn: env.jwtExpires });

export const authenticate = asyncHandler(async (req, _res, next) => {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) throw new HttpError(401, 'Authentication required');
  let payload;
  try { payload = jwt.verify(h.slice(7), env.jwtSecret); } catch { throw new HttpError(401, 'Invalid or expired token'); }
  // Always reload the user so revoked permissions / deactivation take effect immediately.
  const user = await User.findById(payload.sub);
  if (!user || !user.active) throw new HttpError(401, 'Account not available');
  req.user = user;
  next();
});

export const requireRoles = (...roles) => (req, _res, next) =>
  roles.includes(req.user.role) ? next() : next(new HttpError(403, 'You do not have permission for this action'));
export const requireAdmin = (req, _res, next) => (isAdmin(req.user) ? next() : next(new HttpError(403, 'TPO admin only')));
export const requireStaff = (req, _res, next) => (isStaff(req.user) ? next() : next(new HttpError(403, 'Staff access only')));
