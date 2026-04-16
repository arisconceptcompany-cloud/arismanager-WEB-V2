import pool from '../config/db.js';

export const getAllEmployes = async () => {
  const [rows] = await pool.query(
    'SELECT id, matricule, nom, prenom, email, poste, departement, telephone, adresse, date_embauche, statut, role, photo FROM employes ORDER BY CAST(SUBSTRING(matricule, 5) AS UNSIGNED)'
  );
  return rows;
};

export const getEmployeById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, matricule, nom, prenom, email, poste, departement, telephone, adresse, date_embauche, statut, role, photo FROM employes WHERE id = ?',
    [id]
  );
  return rows[0];
};

export const getCongeById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM conges WHERE id = ?',
    [id]
  );
  return rows[0];
};

export const createEmploye = async (data) => {
  const { matricule, nom, prenom, email, mot_de_passe, poste, departement, telephone, adresse, date_embauche, role } = data;
  const [result] = await pool.query(
    'INSERT INTO employes (matricule, nom, prenom, email, mot_de_passe, poste, departement, telephone, adresse, date_embauche, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [matricule, nom, prenom, email, mot_de_passe, poste, departement, telephone, adresse, date_embauche, role || 'employe']
  );
  return { id: result.insertId, ...data };
};

export const updateEmploye = async (id, data) => {
  const { nom, prenom, email, poste, departement, telephone, adresse, date_embauche, role, mot_de_passe } = data;
  
  let formattedDate = null;
  if (date_embauche) {
    if (typeof date_embauche === 'string' && date_embauche.includes('T')) {
      formattedDate = date_embauche.split('T')[0];
    } else if (date_embauche instanceof Date) {
      formattedDate = date_embauche.toISOString().split('T')[0];
    } else {
      formattedDate = date_embauche;
    }
  }
  
  let query = 'UPDATE employes SET nom = ?, prenom = ?, email = ?, poste = ?, departement = ?, telephone = ?, adresse = ?, date_embauche = ?, role = ?';
  let params = [nom, prenom, email, poste, departement, telephone, adresse, formattedDate, role];
  
  if (mot_de_passe) {
    query += ', mot_de_passe = ?';
    params.push(mot_de_passe);
  }
  
  query += ' WHERE id = ?';
  params.push(id);
  
  await pool.query(query, params);
  return { id, ...data };
};

export const deleteEmploye = async (id) => {
  await pool.query('DELETE FROM employes WHERE id = ?', [id]);
};

export const getAllPresences = async (params = {}) => {
  let query = `
    SELECT p.id, p.employe_id, DATE_FORMAT(p.date, '%Y-%m-%d') as date, p.heure_arrivee, p.heure_depart, p.statut,
           e.matricule, e.nom, e.prenom, e.poste, e.departement
    FROM pointages p
    JOIN employes e ON p.employe_id = e.id
    WHERE 1=1
  `;
  const queryParams = [];
  
  if (params.date) {
    query += ' AND DATE(p.date) = ?';
    queryParams.push(params.date);
  }
  if (params.year) {
    query += ' AND YEAR(p.date) = ?';
    queryParams.push(params.year);
  }
  if (params.month) {
    query += ' AND MONTH(p.date) = ?';
    queryParams.push(params.month);
  }
  if (params.employe_id) {
    query += ' AND p.employe_id = ?';
    queryParams.push(params.employe_id);
  }
  
  query += ' ORDER BY p.date DESC, e.nom, e.prenom';
  
  const [rows] = await pool.query(query, queryParams);
  return rows;
};

export const getAllSalaires = async () => {
  const [rows] = await pool.query(`
    SELECT s.*, e.matricule, e.nom, e.prenom, e.poste
    FROM salaries s
    JOIN employes e ON s.employe_id = e.id
    ORDER BY s.annee DESC, s.mois DESC
  `);
  return rows;
};

export const updateSalaire = async (id, data) => {
  const { salaire_base, primes, deductions, salaire_net } = data;
  await pool.query(
    'UPDATE salaries SET salaire_base = ?, primes = ?, deductions = ?, salaire_net = ? WHERE id = ?',
    [salaire_base, primes, deductions, salaire_net, id]
  );
  return { id, ...data };
};

export const getAllConges = async () => {
  const [rows] = await pool.query(`
    SELECT c.*, e.matricule, e.nom, e.prenom, e.poste
    FROM conges c
    JOIN employes e ON c.employe_id = e.id
    ORDER BY c.created_at DESC
  `);
  return rows;
};

export const approveConge = async (id) => {
  await pool.query('UPDATE conges SET statut = ? WHERE id = ?', ['approuve', id]);
};

export const rejectConge = async (id) => {
  await pool.query('UPDATE conges SET statut = ? WHERE id = ?', ['rejete', id]);
};

export const getAllRapports = async () => {
  const [rows] = await pool.query(`
    SELECT r.*, e.matricule, e.nom, e.prenom, e.poste
    FROM rapports r
    JOIN employes e ON r.employe_id = e.id
    ORDER BY r.date_rapport DESC
  `);
  return rows;
};
