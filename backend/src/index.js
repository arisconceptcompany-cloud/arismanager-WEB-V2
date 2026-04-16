import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import https from 'https';
import initDB from './config/initDb.js';
import authRoutes from './routes/auth.js';
import employeRoutes from './routes/employe.js';
import pointageRoutes from './routes/pointage.js';
import congeRoutes from './routes/conge.js';
import projetRoutes from './routes/projet.js';
import salaireRoutes from './routes/salaire.js';
import rapportRoutes from './routes/rapport.js';
import messageRoutes from './routes/message.js';
import adminRoutes from './routes/admin.js';
import photoRoutes from './routes/photo.js';
import badgeRoutes from './routes/badge.js';
import syncRoutes from './routes/sync.js';
import notificationRoutes from './routes/notification.js';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:3002', 'http://167.86.118.96:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const PRESENCE_ARIS_PHOTOS = 'https://167.86.118.96/presencev2/photos';

app.get('/photos/:filename', async (req, res) => {
  try {
    const url = `${PRESENCE_ARIS_PHOTOS}/${req.params.filename}`;
    https.get(url, { rejectUnauthorized: false }, (response) => {
      if (response.statusCode !== 200) {
        console.log('Photo not found:', url, response.statusCode);
        return res.status(404).send('Photo non trouvée');
      }
      res.set('Content-Type', response.headers['content-type'] || 'image/jpeg');
      response.pipe(res);
    }).on('error', (err) => {
      console.error('Error loading photo:', err.message);
      res.status(500).send('Erreur chargement photo');
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Erreur chargement photo');
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/employe', employeRoutes);
app.use('/api/pointages', pointageRoutes);
app.use('/api/conges', congeRoutes);
app.use('/api/projets', projetRoutes);
app.use('/api/salaires', salaireRoutes);
app.use('/api/rapports', rapportRoutes);
app.use('/api/chat', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

const startServer = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur http://localhost:${PORT}`);
      startAutoSync();
    });
  } catch (error) {
    console.error('Erreur de démarrage:', error);
    process.exit(1);
  }
};

const startAutoSync = () => {
  const syncInterval = parseInt(process.env.SYNC_INTERVAL) || 60000;
  
  const performSync = async () => {
    try {
      const response = await fetch(`http://localhost:${PORT}/api/sync`);
      const data = await response.json();
      if (data.synced > 0) {
        console.log(`[Sync] ${data.synced} pointages synchronisés`);
      }
    } catch (error) {
      console.error('[Sync] Erreur:', error.message);
    }
  };

  performSync();
  setInterval(performSync, syncInterval);
  console.log(`[Sync] Auto-sync activé (toutes les ${syncInterval/1000}s)`);
};

startServer();
