import { getProjetsByEmploye, getAllProjets, getProjetById, getEmployesByProjet } from '../models/projetModel.js';

export const getProjets = async (req, res) => {
  try {
    const projets = await getProjetsByEmploye(req.user.id);
    res.json(projets);
  } catch (error) {
    console.error('Erreur getProjets:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getAll = async (req, res) => {
  try {
    const projets = await getAllProjets();
    res.json(projets);
  } catch (error) {
    console.error('Erreur getAllProjets:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const projet = await getProjetById(id);

    if (!projet) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    const employes = await getEmployesByProjet(id);
    res.json({ ...projet, employes });
  } catch (error) {
    console.error('Erreur getById projet:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
