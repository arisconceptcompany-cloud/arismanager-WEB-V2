import { getPointagesByEmploye, createPointage, getStatisticsByEmploye } from '../models/pointageModel.js';

export const getPointages = async (req, res) => {
  try {
    const { month, year } = req.query;
    const pointages = await getPointagesByEmploye(req.user.id, month, year);
    res.json(pointages);
  } catch (error) {
    console.error('Erreur getPointages:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const addPointage = async (req, res) => {
  try {
    const { date, heure_arrivee, heure_depart, statut } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date requise' });
    }

    const pointage = await createPointage(req.user.id, { date, heure_arrivee, heure_depart, statut });
    res.status(201).json(pointage);
  } catch (error) {
    console.error('Erreur addPointage:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getStats = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const stats = await getStatisticsByEmploye(req.user.id, year);
    res.json(stats);
  } catch (error) {
    console.error('Erreur getStats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
