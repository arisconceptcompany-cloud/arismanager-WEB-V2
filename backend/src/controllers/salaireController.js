import { getSalairesByEmploye, getSalaireActuel, getSalaireByMonthYear } from '../models/salaireModel.js';

export const getSalaires = async (req, res) => {
  try {
    const salaires = await getSalairesByEmploye(req.user.id);
    res.json(salaires);
  } catch (error) {
    console.error('Erreur getSalaires:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getActuel = async (req, res) => {
  try {
    const salaire = await getSalaireActuel(req.user.id);
    res.json(salaire || {});
  } catch (error) {
    console.error('Erreur getSalaireActuel:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getByMonthYear = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ error: 'Mois et année requis' });
    }

    const salaire = await getSalaireByMonthYear(req.user.id, month, year);
    res.json(salaire || {});
  } catch (error) {
    console.error('Erreur getByMonthYear:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
