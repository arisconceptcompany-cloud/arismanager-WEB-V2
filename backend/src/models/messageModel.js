import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';

export const getConversations = async (employeId) => {
  const [rows] = await pool.query(`
    SELECT 
      c.*,
      CASE 
        WHEN c.expediteur_id = ? THEN c.destinaire_id 
        WHEN c.is_group = 1 THEN 0
        ELSE c.expediteur_id 
      END as autre_utilisateur_id,
      e.matricule as autre_matricule,
      e.nom as autre_nom,
      e.prenom as autre_prenom,
      (SELECT COUNT(*) FROM messages m 
       WHERE m.conversation_id = c.id 
       AND m.expediteur_id != ? 
       AND m.id NOT IN (SELECT message_id FROM messages_lus WHERE employe_id = ?)
      ) as unread_count,
      (SELECT contenu FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT COUNT(*) FROM conversations_participants WHERE conversation_id = c.id AND is_mentioned = 1 AND employe_id = ? AND is_read = 0) as mentions_count
    FROM conversations c
    LEFT JOIN employes e ON e.id = CASE 
      WHEN c.expediteur_id = ? THEN c.destinaire_id 
      ELSE c.expediteur_id 
    END
    WHERE c.id IN (SELECT conversation_id FROM conversations_participants WHERE employe_id = ?)
    ORDER BY c.dernier_message_at DESC
  `, [employeId, employeId, employeId, employeId, employeId, employeId]);
  return rows;
};

export const getOrCreateConversation = async (expediteurId, destinaireId) => {
  let [rows] = await pool.query(`
    SELECT * FROM conversations 
    WHERE (expediteur_id = ? AND destinaire_id = ?) 
    OR (expediteur_id = ? AND destinaire_id = ?)
  `, [expediteurId, destinaireId, destinaireId, expediteurId]);
  
  if (rows.length === 0) {
    const [result] = await pool.query(
      'INSERT INTO conversations (expediteur_id, destinaire_id, created_at) VALUES (?, ?, NOW())',
      [expediteurId, destinaireId]
    );
    [rows] = await pool.query('SELECT * FROM conversations WHERE id = ?', [result.insertId]);
    
    await pool.query(
      'INSERT INTO conversations_participants (conversation_id, employe_id) VALUES (?, ?)',
      [result.insertId, expediteurId]
    );
    await pool.query(
      'INSERT INTO conversations_participants (conversation_id, employe_id) VALUES (?, ?)',
      [result.insertId, destinaireId]
    );
  }
  
  return rows[0];
};

export const getOrCreateGroupConversation = async (groupName, employeId) => {
  let [rows] = await pool.query(
    'SELECT * FROM conversations WHERE is_group = 1 AND group_name = ? LIMIT 1',
    [groupName]
  );
  
  if (rows.length === 0) {
    const [result] = await pool.query(
      'INSERT INTO conversations (expediteur_id, destinaire_id, is_group, group_name, created_at) VALUES (?, NULL, 1, ?, NOW())',
      [employeId, groupName]
    );
    
    const [employes] = await pool.query('SELECT id FROM employes');
    for (const emp of employes) {
      await pool.query(
        'INSERT INTO conversations_participants (conversation_id, employe_id) VALUES (?, ?)',
        [result.insertId, emp.id]
      );
    }
    
    [rows] = await pool.query('SELECT * FROM conversations WHERE id = ?', [result.insertId]);
  }
  
  return rows[0];
};

export const getMessages = async (conversationId, employeId) => {
  const [convRows] = await pool.query('SELECT is_group FROM conversations WHERE id = ?', [conversationId]);
  const isGroup = convRows[0]?.is_group === 1;
  
  let query = `
    SELECT m.*, e.matricule, e.nom, e.prenom, e.photo
    FROM messages m
    JOIN employes e ON m.expediteur_id = e.id
    WHERE m.conversation_id = ? AND m.is_deleted_for_all = 0
  `;
  
  const params = [conversationId];
  
  if (isGroup) {
    query += ` AND (m.deleted_for IS NULL OR m.deleted_for NOT LIKE CONCAT('%', ?, '%'))`;
    params.push(employeId);
  }
  
  query += ` ORDER BY m.created_at ASC`;
  
  const [rows] = await pool.query(query, params);
  
  const [reactions] = await pool.query(`
    SELECT r.*, emp.nom, emp.prenom 
    FROM reactions r 
    JOIN employes emp ON r.employe_id = emp.id
    WHERE r.message_id IN (SELECT id FROM messages WHERE conversation_id = ?)
  `, [conversationId]);
  
  const [readReceipts] = await pool.query(`
    SELECT ml.*, emp.nom, emp.prenom, emp.id as emp_id
    FROM messages_lus ml
    JOIN employes emp ON ml.employe_id = emp.id
    WHERE ml.message_id IN (SELECT id FROM messages WHERE conversation_id = ?)
  `, [conversationId]);
  
  const reactionsMap = {};
  reactions.forEach(r => {
    if (!reactionsMap[r.message_id]) {
      reactionsMap[r.message_id] = [];
    }
    reactionsMap[r.message_id].push({
      employe_id: r.employe_id,
      emoji: r.emoji,
      nom: r.nom,
      prenom: r.prenom
    });
  });
  
  const readMap = {};
  readReceipts.forEach(r => {
    if (!readMap[r.message_id]) {
      readMap[r.message_id] = [];
    }
    readMap[r.message_id].push({
      id: r.emp_id,
      nom: r.nom,
      prenom: r.prenom
    });
  });
  
  rows.forEach(row => {
    row.reactions = reactionsMap[row.id] || [];
    row.is_read_by = readMap[row.id] || [];
  });
  
  return rows;
};

export const sendMessage = async (conversationId, expediteurId, contenu, replyToId = null, fichiers = []) => {
  const [result] = await pool.query(
    'INSERT INTO messages (conversation_id, expediteur_id, contenu, reply_to_id, fichiers, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
    [conversationId, expediteurId, contenu, replyToId, JSON.stringify(fichiers)]
  );
  
  await pool.query(
    'UPDATE conversations SET dernier_message_at = NOW() WHERE id = ?',
    [conversationId]
  );
  
  const mentions = contenu.match(/@\w+/g) || [];
  if (mentions.includes('@tout_le_monde') || mentions.includes('@everyone')) {
    const [participants] = await pool.query(
      'SELECT employe_id FROM conversations_participants WHERE conversation_id = ?',
      [conversationId]
    );
    for (const p of participants) {
      if (p.employe_id !== expediteurId) {
        await pool.query(
          'UPDATE conversations_participants SET is_mentioned = 1, mentioned_by = ? WHERE conversation_id = ? AND employe_id = ?',
          [expediteurId, conversationId, p.employe_id]
        );
      }
    }
  }
  
  return { 
    id: result.insertId, 
    conversation_id: conversationId, 
    expediteur_id: expediteurId, 
    contenu, 
    reply_to_id: replyToId,
    fichiers: fichiers,
    created_at: new Date() 
  };
};

export const deleteMessageForMe = async (messageId, employeId) => {
  await pool.query(
    'UPDATE messages SET deleted_for = CONCAT(IFNULL(deleted_for, ""), ?, ",") WHERE id = ?',
    [employeId, messageId]
  );
};

export const deleteMessageForAll = async (messageId) => {
  await pool.query(
    'UPDATE messages SET is_deleted_for_all = 1 WHERE id = ?',
    [messageId]
  );
};

export const addReaction = async (messageId, employeId, emoji) => {
  const [existing] = await pool.query(
    'SELECT id FROM reactions WHERE message_id = ? AND employe_id = ? AND emoji = ?',
    [messageId, employeId, emoji]
  );
  
  if (existing.length === 0) {
    await pool.query(
      'INSERT INTO reactions (message_id, employe_id, emoji) VALUES (?, ?, ?)',
      [messageId, employeId, emoji]
    );
  }
};

export const removeReaction = async (messageId, employeId) => {
  await pool.query(
    'DELETE FROM reactions WHERE message_id = ? AND employe_id = ?',
    [messageId, employeId]
  );
};

export const getAllEmployes = async (excludeId) => {
  const [rows] = await pool.query(
    'SELECT id, matricule, nom, prenom, poste, departement, photo FROM employes WHERE id != ? ORDER BY nom, prenom',
    [excludeId]
  );
  return rows;
};

export const getUnreadCount = async (employeId) => {
  const [rows] = await pool.query(`
    SELECT COUNT(*) as count FROM messages m
    JOIN conversations_participants cp ON m.conversation_id = cp.conversation_id
    WHERE cp.employe_id = ?
    AND m.expediteur_id != ?
    AND m.id NOT IN (SELECT message_id FROM messages_lus WHERE employe_id = ?)
    AND m.is_deleted_for_all = 0
  `, [employeId, employeId, employeId]);
  return rows[0]?.count || 0;
};

export const markAsRead = async (conversationId, employeId) => {
  const [messages] = await pool.query(`
    SELECT m.id FROM messages m
    JOIN conversations_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.conversation_id = ? AND m.expediteur_id != ? AND cp.employe_id = ?
  `, [conversationId, employeId, employeId]);
  
  for (const msg of messages) {
    await pool.query(
      'INSERT IGNORE INTO messages_lus (message_id, employe_id) VALUES (?, ?)',
      [msg.id, employeId]
    );
  }
  
  await pool.query(
    'UPDATE conversations_participants SET is_read = 1, is_mentioned = 0 WHERE conversation_id = ? AND employe_id = ?',
    [conversationId, employeId]
  );
};

export const getGroupConversation = async () => {
  const [rows] = await pool.query(
    'SELECT * FROM conversations WHERE is_group = 1 AND group_name = "Tous les employés" LIMIT 1'
  );
  return rows[0] || null;
};
