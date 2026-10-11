import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { Company, Drive } from '../models/Placement.js';
import { HttpError, asyncHandler, paginate, pageResult, escapeRegex, requireId } from '../utils/index.js';
import { audit } from '../services/notify.js';

const router = Router();
router.use(authenticate);
const fields = (b) => Object.fromEntries(['name', 'industry', 'website', 'location', 'description'].filter((k) => typeof b[k] === 'string').map((k) => [k, b[k].trim()]));

router.get('/', asyncHandler(async (req, res) => {
  const p = paginate(req, 200);
  const filter = req.query.search ? { name: new RegExp(escapeRegex(String(req.query.search).slice(0, 60)), 'i') } : {};
  const [items, total] = await Promise.all([Company.find(filter).sort({ name: 1 }).skip(p.skip).limit(p.limit), Company.countDocuments(filter)]);
  res.json(pageResult(items, total, p));
}));
router.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const c = await Company.create({ ...fields(req.body), createdBy: req.user._id });
  await audit(req, 'company.create', { targetType: 'Company', targetId: c._id });
  res.status(201).json(c);
}));
router.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const c = await Company.findByIdAndUpdate(requireId(req.params.id), { $set: fields(req.body) }, { new: true, runValidators: true });
  if (!c) throw new HttpError(404, 'Company not found');
  res.json(c);
}));
router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const id = requireId(req.params.id);
  if (await Drive.exists({ company: id })) throw new HttpError(409, 'Company has drives; delete or close them first');
  if (!(await Company.findByIdAndDelete(id))) throw new HttpError(404, 'Company not found');
  await audit(req, 'company.delete', { targetType: 'Company', targetId: id });
  res.json({ message: 'Deleted' });
}));
export default router;
