import pool from '../config/db.js';

export const getEmployeByMatricule = async (matricule) => {
  const [rows] = await pool.query('SELECT * FROM employes WHERE matricule = ?', [matricule]);
  return rows[0];
};

export const getEmployeById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM employes WHERE id = ?', [id]);
  return rows[0];
};

export const createSession = async (employeId, token, expiresAt) => {
  await pool.query(
    'INSERT INTO sessions (employe_id, token, expires_at) VALUES (?, ?, ?)',
    [employeId, token, expiresAt]
  );
};

export const getSession = async (token) => {
  const [rows] = await pool.query(
    'SELECT s.*, e.matricule, e.nom, e.prenom, e.email, e.poste, e.departement, e.role FROM sessions s JOIN employes e ON s.employe_id = e.id WHERE s.token = ? AND s.expires_at > NOW()',
    [token]
  );
  return rows[0];
};

export const deleteSession = async (token) => {
  await pool.query('DELETE FROM sessions WHERE token = ?', [token]);
};

export const deleteSessionByEmployeId = async (employeId) => {
  await pool.query('DELETE FROM sessions WHERE employe_id = ?', [employeId]);
};

export const updateEmploye = async (id, data) => {
  const fields = [];
  const values = [];
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && key !== 'id' && key !== 'mot_de_passe') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  
  if (fields.length === 0) return null;
  
  values.push(id);
  await pool.query(`UPDATE employes SET ${fields.join(', ')} WHERE id = ?`, values);
  return getEmployeById(id);
};

export const getAllEmployes = async () => {
  const [rows] = await pool.query('SELECT id, matricule, nom, prenom, email, poste, departement, statut, role, date_embauche, photo FROM employes');
  return rows;
};

export const updateEmployePhoto = async (id, photo) => {
  await pool.query('UPDATE employes SET photo = ? WHERE id = ?', [photo, id]);
  return true;
};
