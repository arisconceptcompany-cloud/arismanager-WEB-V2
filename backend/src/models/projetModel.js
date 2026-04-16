import pool from '../config/db.js';

export const getProjetsByEmploye = async (employeId) => {
  const [rows] = await pool.query(`
    SELECT p.*, ap.role_projet 
    FROM projets p 
    JOIN affectations_projets ap ON p.id = ap.projet_id 
    WHERE ap.employe_id = ?
    ORDER BY p.date_debut DESC
  `, [employeId]);
  return rows;
};

export const getAllProjets = async () => {
  const [rows] = await pool.query('SELECT * FROM projets ORDER BY date_debut DESC');
  return rows;
};

export const getProjetById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM projets WHERE id = ?', [id]);
  return rows[0];
};

export const getEmployesByProjet = async (projetId) => {
  const [rows] = await pool.query(`
    SELECT e.id, e.matricule, e.nom, e.prenom, e.poste, ap.role_projet
    FROM employes e
    JOIN affectations_projets ap ON e.id = ap.employe_id
    WHERE ap.projet_id = ?
  `, [projetId]);
  return rows;
};
