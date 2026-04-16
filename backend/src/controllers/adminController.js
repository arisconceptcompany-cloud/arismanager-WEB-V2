import bcrypt from 'bcryptjs';
import {
  getAllEmployes,
  getEmployeById,
  createEmploye,
  updateEmploye,
  deleteEmploye,
  getAllPresences,
  getAllSalaires,
  updateSalaire,
  getAllConges,
  approveConge,
  rejectConge,
  getAllRapports,
  getCongeById
} from '../models/adminModel.js';
import { createNotification } from '../models/notificationModel.js';

export const getEmployesCtrl = async (req, res) => {
  try {
    const employes = await getAllEmployes();
    res.json(employes);
  } catch (error) {
    console.error('Erreur getEmployes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getEmployeCtrl = async (req, res) => {
  try {
    const employe = await getEmployeById(req.params.id);
    if (!employe) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }
    res.json(employe);
  } catch (error) {
    console.error('Erreur getEmploye:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const createEmployeCtrl = async (req, res) => {
  try {
    const { matricule, nom, prenom, email, mot_de_passe, poste, departement, telephone, adresse, date_embauche, role } = req.body;
    
    if (!matricule || !nom || !prenom || !email || !mot_de_passe) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }
    
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    const employe = await createEmploye({
      matricule,
      nom,
      prenom,
      email,
      mot_de_passe: hashedPassword,
      poste,
      departement,
      telephone,
      adresse,
      date_embauche,
      role
    });
    
    res.status(201).json(employe);
  } catch (error) {
    console.error('Erreur createEmploye:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Matricule ou email déjà existant' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateEmployeCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, poste, departement, telephone, adresse, date_embauche, role, mot_de_passe } = req.body;
    
    const employeData = { nom, prenom, email, poste, departement, telephone, adresse, date_embauche, role };
    if (mot_de_passe) {
      employeData.mot_de_passe = await bcrypt.hash(mot_de_passe, 10);
    }
    
    await updateEmploye(id, employeData);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur updateEmploye:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const deleteEmployeCtrl = async (req, res) => {
  try {
    await deleteEmploye(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur deleteEmploye:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getPresencesCtrl = async (req, res) => {
  try {
    const presences = await getAllPresences(req.query);
    res.json(presences);
  } catch (error) {
    console.error('Erreur getPresences:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getSalairesCtrl = async (req, res) => {
  try {
    const salaires = await getAllSalaires();
    res.json(salaires);
  } catch (error) {
    console.error('Erreur getSalaires:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateSalaireCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { salaire_base, primes, deductions, salaire_net } = req.body;
    await updateSalaire(id, { salaire_base, primes, deductions, salaire_net });
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur updateSalaire:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getCongesCtrl = async (req, res) => {
  try {
    const conges = await getAllConges();
    res.json(conges);
  } catch (error) {
    console.error('Erreur getConges:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const approveCongeCtrl = async (req, res) => {
  try {
    const conge = await getCongeById(req.params.id);
    if (!conge) {
      return res.status(404).json({ error: 'Congé non trouvé' });
    }
    
    await approveConge(req.params.id);
    
    await createNotification(conge.employe_id, {
      type: 'conge_approuve',
      titre: 'Congé approuvé',
      message: `Votre demande de ${conge.jours_demandes} jour${conge.jours_demandes > 1 ? 's' : ''} de congé a été approuvée`,
      lien: '/conges'
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur approveConge:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const rejectCongeCtrl = async (req, res) => {
  try {
    const conge = await getCongeById(req.params.id);
    if (!conge) {
      return res.status(404).json({ error: 'Congé non trouvé' });
    }
    
    await rejectConge(req.params.id);
    
    await createNotification(conge.employe_id, {
      type: 'conge_rejete',
      titre: 'Congé refusé',
      message: `Votre demande de congé du ${conge.date_debut} au ${conge.date_fin} a été refusée`,
      lien: '/conges'
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur rejectConge:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getRapportsCtrl = async (req, res) => {
  try {
    const rapports = await getAllRapports();
    res.json(rapports);
  } catch (error) {
    console.error('Erreur getRapports:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
