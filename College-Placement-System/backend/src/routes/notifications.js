import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { Notification } from '../models/Misc.js';
import { HttpError, asyncHandler, paginate, pageResult, requireId } from '../utils/index.js';

const router = Router();
router.use(authenticate);
router.get('/', asyncHandler(async (req, res) => {
  const p = paginate(req, 50);
  const [items, total, unread] = await Promise.all([Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(p.skip).limit(p.limit), Notification.countDocuments({ user: req.user._id }), Notification.countDocuments({ user: req.user._id, read: false })]);
  res.json({ ...pageResult(items, total, p), unread });
}));
router.post('/read-all', asyncHandler(async (req, res) => { await Notification.updateMany({ user: req.user._id, read: false }, { read: true }); res.json({ message: 'ok' }); }));
router.patch('/:id/read', asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate({ _id: requireId(req.params.id), user: req.user._id }, { read: true }, { new: true });
  if (!n) throw new HttpError(404, 'Notification not found');
  res.json(n);
}));
export default router;
