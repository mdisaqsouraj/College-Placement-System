import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { uploadResume, isPdf, RESUME_DIR } from '../middleware/upload.js';
import User from '../models/User.js';
import { ROLES, BRANCHES, YEARS } from '../constants.js';
import { HttpError, asyncHandler } from '../utils/index.js';

const router = Router();
router.use(authenticate);

router.get('/', (req, res) => res.json({ user: req.user }));

// Whitelisted fields only: role, coordinator permissions, active etc. can never be changed here.
router.put('/', requireRoles(ROLES.STUDENT), asyncHandler(async (req, res) => {
  const b = req.body, u = req.user;
  if (b.name !== undefined) { if (typeof b.name !== 'string' || b.name.trim().length < 2) throw new HttpError(400, 'Invalid name'); u.name = b.name.trim(); }
  if (b.branch !== undefined) { if (!BRANCHES.includes(b.branch)) throw new HttpError(400, 'Invalid branch'); u.student.branch = b.branch; }
  if (b.year !== undefined) { if (!YEARS.includes(Number(b.year))) throw new HttpError(400, 'Invalid year'); u.student.year = Number(b.year); }
  if (b.cgpa !== undefined && b.cgpa !== '') { const c = Number(b.cgpa); if (!(c >= 0 && c <= 10)) throw new HttpError(400, 'CGPA must be between 0 and 10'); u.student.cgpa = c; }
  if (b.backlogs !== undefined && b.backlogs !== '') { const k = Number(b.backlogs); if (!Number.isInteger(k) || k < 0) throw new HttpError(400, 'Backlogs must be a non-negative integer'); u.student.backlogs = k; }
  if (b.skills !== undefined) {
    const list = (Array.isArray(b.skills) ? b.skills : String(b.skills).split(',')).map((s) => String(s).trim()).filter(Boolean);
    if (list.length > 30) throw new HttpError(400, 'Maximum 30 skills');
    u.student.skills = [...new Set(list)];
  }
  for (const f of ['rollNo', 'batch', 'phone']) if (b[f] !== undefined) u.student[f] = String(b[f]).trim() || undefined;
  await u.save();
  res.json({ user: u });
}));

router.post('/resume', requireRoles(ROLES.STUDENT), (req, res, next) => {
  uploadResume(req, res, (err) => {
    if (err) return next(err);
    if (!req.file) return next(new HttpError(400, 'Attach a PDF file in the "resume" field'));
    if (!isPdf(req.file.path)) { fs.unlink(req.file.path, () => {}); return next(new HttpError(400, 'File is not a valid PDF')); }
    next();
  });
}, asyncHandler(async (req, res) => {
  const old = req.user.student.resume?.file;
  req.user.student.resume = { file: req.file.filename, originalName: path.basename(req.file.originalname).slice(0, 100), size: req.file.size, uploadedAt: new Date() };
  await req.user.save();
  if (old) fs.unlink(path.join(RESUME_DIR, path.basename(old)), () => {});
  res.status(201).json({ user: req.user });
}));

router.get('/resume', requireRoles(ROLES.STUDENT), (req, res, next) => {
  const f = req.user.student?.resume?.file;
  if (!f) return next(new HttpError(404, 'No resume uploaded'));
  res.type('application/pdf').sendFile(path.join(RESUME_DIR, path.basename(f)));
});

export default router;
