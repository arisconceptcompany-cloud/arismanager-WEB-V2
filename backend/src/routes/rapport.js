import { Router } from 'express';
import { getRapports, create, update, submit } from '../controllers/rapportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getRapports);
router.post('/', authenticateToken, create);
router.put('/:id', authenticateToken, update);
router.put('/:id/submit', authenticateToken, submit);

export default router;
