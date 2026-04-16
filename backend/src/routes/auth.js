import { Router } from 'express';
import { login, logout, checkAuth } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/logout', authenticateToken, logout);
router.get('/check', authenticateToken, checkAuth);

export default router;
