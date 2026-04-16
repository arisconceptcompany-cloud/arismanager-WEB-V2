import {
  createNotification,
  getNotificationsByEmploye,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../models/notificationModel.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await getNotificationsByEmploye(req.user.id);
    res.json(notifications);
  } catch (error) {
    console.error('Erreur getNotifications:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getUnreadNotificationsCount = async (req, res) => {
  try {
    const count = await getUnreadCount(req.user.id);
    res.json({ unread: count });
  } catch (error) {
    console.error('Erreur getUnreadCount:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    await markAsRead(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur markAsRead:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await markAllAsRead(req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur markAllAsRead:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const deleteNotificationCtrl = async (req, res) => {
  try {
    await deleteNotification(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur deleteNotification:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const createNotificationCtrl = async (employeId, data) => {
  return await createNotification(employeId, data);
};
