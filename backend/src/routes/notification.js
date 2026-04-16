import { Router } from 'express';
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationCtrl
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getNotifications);
router.get('/unread', getUnreadNotificationsCount);
router.put('/:id/read', markNotificationAsRead);
router.put('/read-all', markAllNotificationsAsRead);
router.delete('/:id', deleteNotificationCtrl);

export default router;
