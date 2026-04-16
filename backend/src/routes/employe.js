import { Router } from 'express';
import { getProfile, updateProfile, getAllEmployesCtrl, uploadPhoto } from '../controllers/employeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/', authenticateToken, getAllEmployesCtrl);
router.post('/photo', authenticateToken, uploadPhoto);

export default router;
