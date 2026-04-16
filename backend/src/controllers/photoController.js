import db from '../config/db.js';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'uploads');

const photoController = {
  uploadPhoto: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier fourni' });
      }

      const employeId = req.body.employe_id || req.user.id;
      const type = req.body.type || 'profil';

      const [existingPhoto] = await db.query(
        'SELECT id FROM photos WHERE employe_id = ? AND type = ?',
        [employeId, type]
      );

      if (existingPhoto.length > 0) {
        const oldPhoto = await db.query(
          'SELECT chemin FROM photos WHERE id = ?',
          [existingPhoto[0].id]
        );
        if (oldPhoto[0].length > 0 && oldPhoto[0][0].chemin) {
          const oldPath = path.join(uploadDir, oldPhoto[0][0].chemin);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        await db.query(
          'UPDATE photos SET nom_fichier = ?, chemin = ?, mime_type = ?, taille = ? WHERE id = ?',
          [req.file.originalname, req.file.path, req.file.mimetype, req.file.size, existingPhoto[0].id]
        );
        const photoId = existingPhoto[0].id;
        return res.json({ 
          success: true, 
          photo: { id: photoId, chemin: req.file.path },
          message: 'Photo mise à jour'
        });
      }

      const [result] = await db.query(
        'INSERT INTO photos (employe_id, type, nom_fichier, chemin, mime_type, taille) VALUES (?, ?, ?, ?, ?, ?)',
        [employeId, type, req.file.originalname, req.file.path, req.file.mimetype, req.file.size]
      );

      res.json({ 
        success: true, 
        photo: { id: result.insertId, chemin: req.file.path },
        message: 'Photo uploadée'
      });
    } catch (error) {
      console.error('Erreur upload photo:', error);
      res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
  },

  getPhoto: async (req, res) => {
    try {
      const { id } = req.params;
      
      const [photo] = await db.query('SELECT * FROM photos WHERE id = ?', [id]);
      
      if (photo.length === 0) {
        return res.status(404).json({ error: 'Photo non trouvée' });
      }

      const photoPath = path.join(uploadDir, photo[0].chemin);
      
      if (!fs.existsSync(photoPath)) {
        return res.status(404).json({ error: 'Fichier non trouvé' });
      }

      res.sendFile(photoPath);
    } catch (error) {
      console.error('Erreur get photo:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération' });
    }
  },

  getEmployePhoto: async (req, res) => {
    try {
      const employeId = req.params.employeId || req.user?.id;
      
      // First check if there's a photo in the employes table (base64)
      const [employe] = await db.query('SELECT photo FROM employes WHERE id = ?', [employeId]);
      if (employe.length > 0 && employe[0].photo) {
        // It's base64, return it as data URL
        if (employe[0].photo.startsWith('data:')) {
          return res.type('image/jpeg').send(Buffer.from(employe[0].photo.split(',')[1], 'base64'));
        }
        // If it's a path, try to serve it
        if (employe[0].photo.startsWith('/') || !employe[0].photo.startsWith('http')) {
          const photoPath = path.join(uploadDir, employe[0].photo);
          if (fs.existsSync(photoPath)) {
            return res.sendFile(photoPath);
          }
        }
      }
      
      // Then check the photos table (disk storage)
      const [photo] = await db.query(
        'SELECT * FROM photos WHERE employe_id = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
        [employeId, 'profil']
      );
      
      if (photo.length > 0 && photo[0].chemin) {
        const photoPath = path.join(uploadDir, photo[0].chemin);
        if (fs.existsSync(photoPath)) {
          return res.sendFile(photoPath);
        }
      }
      
      const employePhotoDir = '/home/tech-0002/Téléchargements/PresenceAris1/PresenceAris/photos';
      const possiblePaths = [
        path.join(employePhotoDir, `emp_${employeId}.jpeg`),
        path.join(employePhotoDir, `emp_${employeId}.jpg`),
        path.join(employePhotoDir, `emp_${employeId}.png`),
        path.join(employePhotoDir, `${employeId}.jpeg`),
        path.join(employePhotoDir, `${employeId}.jpg`),
        path.join(employePhotoDir, `${employeId}.png`)
      ];
      
      for (const photoPath of possiblePaths) {
        if (fs.existsSync(photoPath)) {
          return res.sendFile(photoPath);
        }
      }
      
      return res.status(404).send();
    } catch (error) {
      console.error('Erreur get photo:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération' });
    }
  },

  deletePhoto: async (req, res) => {
    try {
      const { id } = req.params;
      
      const [photo] = await db.query('SELECT * FROM photos WHERE id = ?', [id]);
      
      if (photo.length === 0) {
        return res.status(404).json({ error: 'Photo non trouvée' });
      }

      if (photo[0].employe_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Non autorisé' });
      }

      const photoPath = path.join(uploadDir, photo[0].chemin);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }

      await db.query('DELETE FROM photos WHERE id = ?', [id]);
      
      res.json({ success: true, message: 'Photo supprimée' });
    } catch (error) {
      console.error('Erreur delete photo:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
  },

  getPhotosByEmploye: async (req, res) => {
    try {
      const employeId = req.params.employeId;
      
      const [photos] = await db.query(
        'SELECT * FROM photos WHERE employe_id = ? ORDER BY created_at DESC',
        [employeId]
      );
      
      res.json({ photos });
    } catch (error) {
      console.error('Erreur get photos:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération' });
    }
  },

  getAllEmployePhotos: async (req, res) => {
    try {
      const [photos] = await db.query(
        'SELECT employe_id, id FROM photos WHERE type = ? ORDER BY created_at DESC',
        ['profil']
      );
      
      const photoMap = {};
      photos.forEach(p => {
        if (!photoMap[p.employe_id]) {
          photoMap[p.employe_id] = p.id;
        }
      });
      
      res.json({ photos: photoMap });
    } catch (error) {
      console.error('Erreur get all photos:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération' });
    }
  }
};

export default photoController;
