import { Router } from 'express';
import { authenticate, requireStaff } from '../middleware/auth.js';
import { Question } from '../models/Exam.js';
import { isAdmin, isDelegate } from '../services/permissions.js';
import { DIFFICULTIES } from '../constants.js';
import { HttpError, asyncHandler, paginate, pageResult, escapeRegex, requireId } from '../utils/index.js';

const router = Router();
router.use(authenticate, requireStaff, (req, _res, next) =>
  isAdmin(req.user) || (isDelegate(req.user) && req.user.coordinator.canCreateTests) ? next() : next(new HttpError(403, 'Not allowed to use the question bank')));

function fields(b) {
  const options = Array.isArray(b.options) ? b.options.map((o) => String(o).trim()).filter(Boolean) : [];
  const correctIndex = Number(b.correctIndex);
  if (options.length < 2 || options.length > 6) throw new HttpError(400, 'Provide 2 to 6 non-empty options');
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) throw new HttpError(400, 'correctIndex is out of range');
  return {
    text: String(b.text || '').trim(), topic: String(b.topic || '').trim(), options, correctIndex,
    difficulty: DIFFICULTIES.includes(b.difficulty) ? b.difficulty : 'medium', marks: Number(b.marks) || 1, explanation: String(b.explanation || '').trim(),
  };
}

router.get('/', asyncHandler(async (req, res) => {
  const p = paginate(req);
  const filter = {};
  if (req.query.difficulty) filter.difficulty = String(req.query.difficulty);
  if (req.query.topic) filter.topic = new RegExp(escapeRegex(String(req.query.topic).slice(0, 60)), 'i');
  if (req.query.search) filter.text = new RegExp(escapeRegex(String(req.query.search).slice(0, 60)), 'i');
  const [items, total] = await Promise.all([Question.find(filter).sort({ createdAt: -1 }).skip(p.skip).limit(p.limit), Question.countDocuments(filter)]);
  res.json(pageResult(items, total, p));
}));
router.post('/', asyncHandler(async (req, res) => res.status(201).json(await Question.create({ ...fields(req.body), createdBy: req.user._id }))));
router.put('/:id', asyncHandler(async (req, res) => {
  const q = await Question.findById(requireId(req.params.id));
  if (!q) throw new HttpError(404, 'Question not found');
  if (!isAdmin(req.user) && String(q.createdBy) !== String(req.user._id)) throw new HttpError(403, 'You can only edit your own questions');
  q.set(fields(req.body)); await q.save();
  res.json(q);
}));
router.delete('/:id', asyncHandler(async (req, res) => {
  const q = await Question.findById(requireId(req.params.id));
  if (!q) throw new HttpError(404, 'Question not found');
  if (!isAdmin(req.user) && String(q.createdBy) !== String(req.user._id)) throw new HttpError(403, 'You can only delete your own questions');
  await q.deleteOne();
  res.json({ message: 'Deleted' });
}));
export default router;
