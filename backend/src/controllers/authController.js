import bcrypt from 'bcryptjs';
import { getEmployeByMatricule, createSession, deleteSessionByEmployeId } from '../models/employeModel.js';

const generateToken = () => {
  return 'aris_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const login = async (req, res) => {
  try {
    const { matricule, mot_de_passe } = req.body;

    if (!matricule || !mot_de_passe) {
      return res.status(400).json({ error: 'Matricule et mot de passe requis' });
    }

    const employe = await getEmployeByMatricule(matricule);

    if (!employe) {
      return res.status(401).json({ error: 'Matricule ou mot de passe incorrect' });
    }

    const validPassword = await bcrypt.compare(mot_de_passe, employe.mot_de_passe);

    if (!validPassword) {
      return res.status(401).json({ error: 'Matricule ou mot de passe incorrect' });
    }

    if (employe.statut === 'inactif') {
      return res.status(403).json({ error: 'Compte désactivé' });
    }

    await deleteSessionByEmployeId(employe.id);

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await createSession(employe.id, token, expiresAt);

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });

    res.json({
      message: 'Connexion réussie',
      token: token,
      user: {
        id: employe.id,
        matricule: employe.matricule,
        nom: employe.nom,
        prenom: employe.prenom,
        email: employe.email,
        poste: employe.poste,
        departement: employe.departement,
        role: employe.role
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const logout = async (req, res) => {
  const token = req.cookies.session_token;

  if (token) {
    await deleteSessionByEmployeId(req.user.id);
  }

    res.clearCookie('session_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      path: '/'
    });
    
    res.json({ message: 'Déconnexion réussie' });
  res.json({ message: 'Déconnexion réussie' });
};

export const checkAuth = async (req, res) => {
  res.json({ user: req.user });
};
