import { Router } from 'express';
import { 
  getConversationsCtrl, 
  getOrCreateConversationCtrl, 
  getMessagesCtrl, 
  sendMessageCtrl,
  deleteMessageCtrl,
  reactionCtrl,
  getEmployesCtrl,
  getUnreadCountCtrl,
  getGroupConversationCtrl,
  markAsReadCtrl
} from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/conversations', authenticateToken, getConversationsCtrl);
router.post('/conversations', authenticateToken, getOrCreateConversationCtrl);
router.get('/conversations/group', authenticateToken, getGroupConversationCtrl);
router.get('/conversations/:conversationId/messages', authenticateToken, getMessagesCtrl);
router.post('/messages', authenticateToken, sendMessageCtrl);
router.delete('/messages/:messageId', authenticateToken, deleteMessageCtrl);
router.post('/messages/:messageId/reaction', authenticateToken, reactionCtrl);
router.get('/employes', authenticateToken, getEmployesCtrl);
router.get('/unread', authenticateToken, getUnreadCountCtrl);
router.post('/conversations/:conversationId/read', authenticateToken, markAsReadCtrl);

export default router;
