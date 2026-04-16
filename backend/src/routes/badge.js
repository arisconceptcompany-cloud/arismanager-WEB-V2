import express from 'express';
import { getBadgeQR, getBadgeInfo } from '../controllers/badgeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/qr/:badgeId', getBadgeQR);
router.get('/employes', authenticateToken, getBadgeInfo);

export default router;
