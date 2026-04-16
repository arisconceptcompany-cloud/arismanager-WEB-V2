import { Router } from 'express';
import { getProjets, getAll, getById } from '../controllers/projetController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getProjets);
router.get('/all', authenticateToken, getAll);
router.get('/:id', authenticateToken, getById);

export default router;
