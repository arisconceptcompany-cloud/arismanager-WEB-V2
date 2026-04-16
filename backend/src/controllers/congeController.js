import { getCongesByEmploye, createConge, getCongeStats } from '../models/congeModel.js';
import { createNotification, getAllAdmins } from '../models/notificationModel.js';

export const getConges = async (req, res) => {
  try {
    const conges = await getCongesByEmploye(req.user.id);
    res.json(conges);
  } catch (error) {
    console.error('Erreur getConges:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const addConge = async (req, res) => {
  try {
    const { type_conge, date_debut, date_fin, jours_demandes, motif } = req.body;

    if (!type_conge || !date_debut || !date_fin) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    if (jours_demandes <= 0) {
      return res.status(400).json({ error: 'Le nombre de jours doit être supérieur à 0' });
    }

    const conge = await createConge(req.user.id, { type_conge, date_debut, date_fin, jours_demandes, motif });
    
    const admins = await getAllAdmins();
    const typeLabels = { annuel: 'Congé annuel', maladie: 'Congé maladie', maternite: 'Maternité', paternite: 'Paternité', sans_solde: 'Sans solde' };
    
    for (const admin of admins) {
      await createNotification(admin.id, {
        type: 'conge_demande',
        titre: 'Nouvelle demande de congé',
        message: `${req.user.prenom} ${req.user.nom} a demandé ${typeLabels[type_conge]} du ${date_debut} au ${date_fin} (${jours_demandes} jour${jours_demandes > 1 ? 's' : ''})`,
        lien: '/admin/conges'
      });
    }
    
    res.status(201).json(conge);
  } catch (error) {
    console.error('Erreur addConge:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getStats = async (req, res) => {
  try {
    const stats = await getCongeStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('Erreur getStats conge:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
