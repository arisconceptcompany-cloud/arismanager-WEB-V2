import { 
  getConversations, 
  getOrCreateConversation, 
  getOrCreateGroupConversation,
  getMessages, 
  sendMessage,
  deleteMessageForMe,
  deleteMessageForAll,
  addReaction,
  removeReaction,
  getAllEmployes,
  getUnreadCount,
  markAsRead,
  getGroupConversation
} from '../models/messageModel.js';

export const getConversationsCtrl = async (req, res) => {
  try {
    const conversations = await getConversations(req.user.id);
    res.json(conversations);
  } catch (error) {
    console.error('Erreur getConversations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getOrCreateConversationCtrl = async (req, res) => {
  try {
    const { destinaire_id, group_name } = req.body;
    
    if (group_name) {
      const conversation = await getOrCreateGroupConversation(group_name, req.user.id);
      return res.json(conversation);
    }
    
    const conversation = await getOrCreateConversation(req.user.id, destinaire_id);
    res.json(conversation);
  } catch (error) {
    console.error('Erreur getOrCreateConversation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getMessagesCtrl = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await getMessages(conversationId, req.user.id);
    await markAsRead(conversationId, req.user.id);
    res.json(messages);
  } catch (error) {
    console.error('Erreur getMessages:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const sendMessageCtrl = async (req, res) => {
  try {
    const { conversation_id, destinaire_id, contenu, reply_to_id, fichiers } = req.body;
    
    let conversationId = conversation_id;
    if (!conversationId && destinaire_id) {
      const conversation = await getOrCreateConversation(req.user.id, destinaire_id);
      conversationId = conversation.id;
    }
    
    const message = await sendMessage(conversationId, req.user.id, contenu, reply_to_id, fichiers || []);
    res.json(message);
  } catch (error) {
    console.error('Erreur sendMessage:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const deleteMessageCtrl = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { forEveryone } = req.body;
    
    if (forEveryone) {
      await deleteMessageForAll(parseInt(messageId));
    } else {
      await deleteMessageForMe(parseInt(messageId), req.user.id);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur deleteMessage:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const reactionCtrl = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji, remove } = req.body;
    
    if (remove) {
      await removeReaction(parseInt(messageId), req.user.id);
    } else {
      await addReaction(parseInt(messageId), req.user.id, emoji);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur reaction:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getEmployesCtrl = async (req, res) => {
  try {
    const employes = await getAllEmployes(req.user.id);
    res.json(employes);
  } catch (error) {
    console.error('Erreur getEmployes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getUnreadCountCtrl = async (req, res) => {
  try {
    const count = await getUnreadCount(req.user.id);
    res.json({ unread: count });
  } catch (error) {
    console.error('Erreur getUnreadCount:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getGroupConversationCtrl = async (req, res) => {
  try {
    const conversation = await getGroupConversation();
    if (conversation) {
      await markAsRead(conversation.id, req.user.id);
    }
    res.json(conversation);
  } catch (error) {
    console.error('Erreur getGroupConversation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const markAsReadCtrl = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await markAsRead(parseInt(conversationId), req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur markAsRead:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
