import { getEmployeById, updateEmploye, getAllEmployes, updateEmployePhoto } from '../models/employeModel.js';

export const getProfile = async (req, res) => {
  try {
    const employe = await getEmployeById(req.user.id);
    
    if (!employe) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }

    const { mot_de_passe, ...safeEmploye } = employe;
    res.json(safeEmploye);
  } catch (error) {
    console.error('Erreur getProfile:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, adresse } = req.body;
    const updated = await updateEmploye(req.user.id, { nom, prenom, email, telephone, adresse });

    if (!updated) {
      return res.status(400).json({ error: 'Aucune modification effectuée' });
    }

    const { mot_de_passe, ...safeEmploye } = updated;
    res.json(safeEmploye);
  } catch (error) {
    console.error('Erreur updateProfile:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getAllEmployesCtrl = async (req, res) => {
  try {
    const employes = await getAllEmployes();
    res.json(employes);
  } catch (error) {
    console.error('Erreur getAllEmployes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const uploadPhoto = async (req, res) => {
  try {
    const { photo } = req.body;
    
    if (!photo) {
      return res.status(400).json({ error: 'Photo requise' });
    }

    await updateEmployePhoto(req.user.id, photo);
    
    const employe = await getEmployeById(req.user.id);
    const { mot_de_passe, ...safeEmploye } = employe;
    
    res.json({ 
      success: true, 
      photo_url: photo,
      employe: safeEmploye
    });
  } catch (error) {
    console.error('Erreur uploadPhoto:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la photo' });
  }
};
