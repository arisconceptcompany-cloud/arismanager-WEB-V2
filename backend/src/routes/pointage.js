import { Router } from 'express';
import { getPointages, addPointage, getStats } from '../controllers/pointageController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getPointages);
router.post('/', authenticateToken, addPointage);
router.get('/stats', authenticateToken, getStats);

export default router;
