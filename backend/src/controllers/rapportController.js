import { getRapportsByEmploye, createRapport, updateRapport, submitRapport } from '../models/rapportModel.js';

export const getRapports = async (req, res) => {
  try {
    const rapports = await getRapportsByEmploye(req.user.id);
    res.json(rapports);
  } catch (error) {
    console.error('Erreur getRapports:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const create = async (req, res) => {
  try {
    const { titre, contenu, type, date_rapport } = req.body;

    if (!titre || !contenu || !type || !date_rapport) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const rapport = await createRapport(req.user.id, { titre, contenu, type, date_rapport });
    res.status(201).json(rapport);
  } catch (error) {
    console.error('Erreur createRapport:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, contenu, type, date_rapport } = req.body;

    const rapport = await updateRapport(id, { titre, contenu, type, date_rapport });

    if (!rapport) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    res.json(rapport);
  } catch (error) {
    console.error('Erreur updateRapport:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const submit = async (req, res) => {
  try {
    const { id } = req.params;
    const rapport = await submitRapport(id);

    if (!rapport) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    res.json(rapport);
  } catch (error) {
    console.error('Erreur submitRapport:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
