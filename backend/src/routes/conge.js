import { Router } from 'express';
import { getConges, addConge, getStats } from '../controllers/congeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getConges);
router.post('/', authenticateToken, addConge);
router.get('/stats', authenticateToken, getStats);

export default router;
