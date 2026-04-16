import { getSession } from '../models/employeModel.js';

export const authenticateToken = async (req, res, next) => {
  let token = req.cookies.session_token;
  
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Token requis' });
  }

  try {
    const session = await getSession(token);
    
    if (!session) {
      return res.status(401).json({ error: 'Session invalide ou expirée' });
    }

    req.user = {
      id: session.employe_id,
      matricule: session.matricule,
      nom: session.nom,
      prenom: session.prenom,
      email: session.email,
      poste: session.poste,
      departement: session.departement,
      role: session.role
    };

    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    next();
  };
};
