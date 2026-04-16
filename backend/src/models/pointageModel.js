import pool from '../config/db.js';

export const getPointagesByEmploye = async (employeId, month, year) => {
  let query = 'SELECT id, employe_id, DATE_FORMAT(date, "%Y-%m-%d") as date, heure_arrivee, heure_depart, statut FROM pointages WHERE employe_id = ?';
  const params = [employeId];

  if (month && year) {
    query += ' AND MONTH(date) = ? AND YEAR(date) = ?';
    params.push(month, year);
  }

  query += ' ORDER BY date DESC';
  const [rows] = await pool.query(query, params);
  return rows;
};

export const createPointage = async (employeId, data) => {
  const { date, heure_arrivee, heure_depart, statut } = data;
  
  const [existing] = await pool.query(
    'SELECT id FROM pointages WHERE employe_id = ? AND DATE(date) = ?',
    [employeId, date]
  );

  if (existing.length > 0) {
    await pool.query(
      'UPDATE pointages SET heure_arrivee = COALESCE(?, heure_arrivee), heure_depart = COALESCE(?, heure_depart), statut = COALESCE(?, statut) WHERE employe_id = ? AND DATE(date) = ?',
      [heure_arrivee, heure_depart, statut, employeId, date]
    );
  } else {
    await pool.query(
      'INSERT INTO pointages (employe_id, date, heure_arrivee, heure_depart, statut) VALUES (?, ?, ?, ?, ?)',
      [employeId, date, heure_arrivee, heure_depart, statut || 'present']
    );
  }
  return { employeId, date, heure_arrivee, heure_depart, statut };
};

export const getStatisticsByEmploye = async (employeId, year) => {
  const [rows] = await pool.query(`
    SELECT 
      MONTH(date) as month,
      COUNT(*) as total_jours,
      SUM(CASE WHEN statut = 'present' THEN 1 ELSE 0 END) as jours_present,
      SUM(CASE WHEN statut = 'retard' THEN 1 ELSE 0 END) as jours_retard,
      SUM(CASE WHEN statut = 'absent' THEN 1 ELSE 0 END) as jours_absent,
      SUM(CASE WHEN statut = 'conge' THEN 1 ELSE 0 END) as jours_conge
    FROM pointages 
    WHERE employe_id = ? AND YEAR(date) = ?
    GROUP BY MONTH(date)
    ORDER BY month
  `, [employeId, year]);
  return rows;
};
