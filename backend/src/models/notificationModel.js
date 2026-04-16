import pool from '../config/db.js';

export const createNotification = async (employeId, data) => {
  const { type, titre, message, lien } = data;
  const [result] = await pool.query(
    'INSERT INTO notifications (employe_id, type, titre, message, lien) VALUES (?, ?, ?, ?, ?)',
    [employeId, type, titre, message, lien || null]
  );
  return { id: result.insertId, employeId, ...data, est_lu: 0 };
};

export const getNotificationsByEmploye = async (employeId) => {
  const [rows] = await pool.query(
    'SELECT * FROM notifications WHERE employe_id = ? ORDER BY created_at DESC LIMIT 50',
    [employeId]
  );
  return rows;
};

export const getUnreadCount = async (employeId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM notifications WHERE employe_id = ? AND est_lu = 0',
    [employeId]
  );
  return rows[0].count;
};

export const markAsRead = async (notificationId, employeId) => {
  await pool.query(
    'UPDATE notifications SET est_lu = 1 WHERE id = ? AND employe_id = ?',
    [notificationId, employeId]
  );
};

export const markAllAsRead = async (employeId) => {
  await pool.query(
    'UPDATE notifications SET est_lu = 1 WHERE employe_id = ? AND est_lu = 0',
    [employeId]
  );
};

export const getAllAdmins = async () => {
  const [rows] = await pool.query(
    'SELECT id FROM employes WHERE role = "admin"'
  );
  return rows;
};

export const deleteNotification = async (notificationId, employeId) => {
  await pool.query(
    'DELETE FROM notifications WHERE id = ? AND employe_id = ?',
    [notificationId, employeId]
  );
};
