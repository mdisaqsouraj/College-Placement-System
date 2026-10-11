import multer from 'multer';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { HttpError } from '../utils/index.js';
import { fileURLToPath } from 'node:url';

export const RESUME_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads/resumes');
fs.mkdirSync(RESUME_DIR, { recursive: true });

export const uploadResume = multer({
  storage: multer.diskStorage({
    destination: RESUME_DIR,
    filename: (_req, _f, cb) => cb(null, crypto.randomBytes(16).toString('hex') + '.pdf'),
  }),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => (file.mimetype === 'application/pdf' ? cb(null, true) : cb(new HttpError(400, 'Only PDF resumes are allowed'))),
}).single('resume');

export const isPdf = (file) => {
  const fd = fs.openSync(file, 'r'); const b = Buffer.alloc(5); fs.readSync(fd, b, 0, 5, 0); fs.closeSync(fd);
  return b.toString() === '%PDF-';
};
