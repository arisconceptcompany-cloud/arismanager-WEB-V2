import pool from '../config/db.js';

export const getCongesByEmploye = async (employeId) => {
  const [rows] = await pool.query(
    'SELECT * FROM conges WHERE employe_id = ? ORDER BY date_debut DESC',
    [employeId]
  );
  return rows;
};

export const createConge = async (employeId, data) => {
  const { type_conge, date_debut, date_fin, jours_demandes, motif } = data;
  
  let formattedDebut = date_debut;
  let formattedFin = date_fin;
  
  if (typeof date_debut === 'string' && date_debut.includes('T')) {
    formattedDebut = date_debut.split('T')[0];
  }
  if (typeof date_fin === 'string' && date_fin.includes('T')) {
    formattedFin = date_fin.split('T')[0];
  }
  
  const [result] = await pool.query(
    'INSERT INTO conges (employe_id, type_conge, date_debut, date_fin, jours_demandes, motif, statut) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [employeId, type_conge, formattedDebut, formattedFin, jours_demandes, motif || null, 'en_attente']
  );
  return { id: result.insertId, employeId, ...data, statut: 'en_attente' };
};

export const getCongeStats = async (employeId) => {
  const [rows] = await pool.query(`
    SELECT 
      type_conge,
      SUM(CASE WHEN statut = 'approuve' THEN jours_demandes ELSE 0 END) as jours_approuves,
      SUM(CASE WHEN statut = 'en_attente' THEN jours_demandes ELSE 0 END) as jours_en_attente,
      SUM(CASE WHEN statut = 'rejete' THEN jours_demandes ELSE 0 END) as jours_rejetes
    FROM conges 
    WHERE employe_id = ?
    GROUP BY type_conge
  `, [employeId]);
  return rows;
};
