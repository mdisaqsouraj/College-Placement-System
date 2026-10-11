import mongoose from 'mongoose';

export class HttpError extends Error {
  constructor(status, message, extra) { super(message); this.status = status; this.extra = extra; }
}
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export const isId = (v) => mongoose.isValidObjectId(v) && String(v).length === 24;
export const requireId = (v, label = 'id') => { if (!isId(v)) throw new HttpError(400, `Invalid ${label}`); return String(v); };

export function paginate(req, max = 100) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(max, Math.max(1, parseInt(req.query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
}
export const pageResult = (items, total, { page, limit }) => ({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });

export * from './pure.js';
