import pool from '../config/db.js';

export const getSalairesByEmploye = async (employeId) => {
  const [rows] = await pool.query(
    'SELECT * FROM salaries WHERE employe_id = ? ORDER BY annee DESC, mois DESC',
    [employeId]
  );
  return rows;
};

export const getSalaireActuel = async (employeId) => {
  const [rows] = await pool.query(`
    SELECT * FROM salaries 
    WHERE employe_id = ? 
    ORDER BY annee DESC, mois DESC 
    LIMIT 1
  `, [employeId]);
  return rows[0];
};

export const getSalaireByMonthYear = async (employeId, mois, annee) => {
  const [rows] = await pool.query(
    'SELECT * FROM salaries WHERE employe_id = ? AND mois = ? AND annee = ?',
    [employeId, mois, annee]
  );
  return rows[0];
};
