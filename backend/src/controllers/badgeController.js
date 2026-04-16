import QRCode from 'qrcode';
import pool from '../config/db.js';

export const getBadgeQR = async (req, res) => {
  try {
    const { badgeId } = req.params;
    
    const [employe] = await pool.query(
      'SELECT id, matricule, nom, prenom, poste, photo FROM employes WHERE matricule = ?',
      [badgeId]
    );
    
    if (employe.length === 0) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }
    
    const qrDataUrl = await QRCode.toDataURL(badgeId, { width: 300, margin: 2 });
    
    res.json({ 
      qr: qrDataUrl,
      employe: {
        matricule: employe[0].matricule,
        nom: employe[0].nom,
        prenom: employe[0].prenom,
        poste: employe[0].poste
      }
    });
  } catch (error) {
    console.error('Erreur badge QR:', error);
    res.status(500).json({ error: 'Erreur génération QR' });
  }
};

export const getBadgeInfo = async (req, res) => {
  try {
    const employes = await pool.query(
      'SELECT id, matricule, nom, prenom, poste, photo FROM employes ORDER BY matricule'
    );
    res.json(employes[0]);
  } catch (error) {
    console.error('Erreur badge info:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
