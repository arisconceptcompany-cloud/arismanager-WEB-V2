import pool from '../config/db.js';

export const getRapportsByEmploye = async (employeId) => {
  const [rows] = await pool.query(
    'SELECT * FROM rapports WHERE employe_id = ? ORDER BY date_rapport DESC',
    [employeId]
  );
  return rows;
};

export const createRapport = async (employeId, data) => {
  const { titre, contenu, type, date_rapport } = data;
  const [result] = await pool.query(
    'INSERT INTO rapports (employe_id, titre, contenu, type, date_rapport, statut) VALUES (?, ?, ?, ?, ?, ?)',
    [employeId, titre, contenu, type, date_rapport, 'brouillon']
  );
  return { id: result.insertId, employeId, ...data, statut: 'brouillon' };
};

export const updateRapport = async (id, data) => {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) return null;

  values.push(id);
  await pool.query(`UPDATE rapports SET ${fields.join(', ')} WHERE id = ?`, values);

  const [rows] = await pool.query('SELECT * FROM rapports WHERE id = ?', [id]);
  return rows[0];
};

export const submitRapport = async (id) => {
  await pool.query('UPDATE rapports SET statut = ? WHERE id = ?', ['soumis', id]);
  const [rows] = await pool.query('SELECT * FROM rapports WHERE id = ?', [id]);
  return rows[0];
};
