import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/auth.js';
import photoController from '../controllers/photoController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type || 'profil';
    const dir = type === 'profil' ? 'profil' : 'documents';
    cb(null, `uploads/${dir}`);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${req.user?.id || 'file'}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/upload', authenticateToken, upload.single('photo'), photoController.uploadPhoto);
router.get('/:id', photoController.getPhoto);
router.get('/employe/:employeId', photoController.getEmployePhoto);
router.get('/employe/:employeId/all', authenticateToken, photoController.getPhotosByEmploye);
router.get('/all/profil', authenticateToken, photoController.getAllEmployePhotos);
router.delete('/:id', authenticateToken, photoController.deletePhoto);

export default router;
