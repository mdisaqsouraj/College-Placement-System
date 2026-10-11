import { Router } from 'express';
import { BRANCHES, YEARS, CATEGORIES, DIFFICULTIES, APPLICATION_STATUSES } from '../constants.js';
const router = Router();
router.get('/', (_req, res) => res.json({ branches: BRANCHES, years: YEARS, categories: CATEGORIES, difficulties: DIFFICULTIES, applicationStatuses: APPLICATION_STATUSES }));
export default router;
