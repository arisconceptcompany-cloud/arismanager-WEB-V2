import { Router } from 'express';
import { getSalaires, getActuel, getByMonthYear } from '../controllers/salaireController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getSalaires);
router.get('/actuel', authenticateToken, getActuel);
router.get('/search', authenticateToken, getByMonthYear);

export default router;
