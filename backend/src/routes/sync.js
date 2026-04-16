import express from 'express';
import https from 'https';
import http from 'http';
import pool from '../config/db.js';

const router = express.Router();

const PRESENCE_ARIS_V2_URL = 'https://167.86.118.96/presencev2';
const PRESENCE_ARIS_PHOTOS_URL = `${PRESENCE_ARIS_V2_URL}/photos`;

const employeeMap = {
  1: 'ARIS-0001',
  5: 'ARIS-0005',
  6: 'ARIS-0007',
  7: 'ARIS-0008',
  8: 'ARIS-0010',
  9: 'ARIS-0012'
};

const fetchWithTimeout = (url, timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { rejectUnauthorized: false }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const dates = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    let synced = 0;
    let totalPointages = 0;

    for (const dateStr of dates) {
      try {
        const presences = await fetchWithTimeout(`${PRESENCE_ARIS_V2_URL}/api/presences/${dateStr}`);
        if (!Array.isArray(presences) || presences.length === 0) continue;

        const pointagesByEmployee = {};
        for (const p of presences) {
          const empId = p.employee_id;
          if (!pointagesByEmployee[empId]) {
            pointagesByEmployee[empId] = { entrer: null, sortie: null };
          }
          if (p.type === 'entrer' && !pointagesByEmployee[empId].entrer) {
            pointagesByEmployee[empId].entrer = p.scanned_at?.split(' ')[1]?.substring(0, 8);
          }
          if (p.type === 'sortie' && !pointagesByEmployee[empId].sortie) {
            pointagesByEmployee[empId].sortie = p.scanned_at?.split(' ')[1]?.substring(0, 8);
          }
        }

        for (const [employeeId, data] of Object.entries(pointagesByEmployee)) {
          const matricule = employeeMap[parseInt(employeeId)];
          if (!matricule) continue;

          const [employeRows] = await pool.query(
            'SELECT id FROM employes WHERE matricule = ?',
            [matricule]
          );

          if (employeRows.length === 0) continue;
          const employeIdMySQL = employeRows[0].id;

          const [existing] = await pool.query(
            'SELECT id FROM pointages WHERE employe_id = ? AND DATE(date) = ?',
            [employeIdMySQL, dateStr]
          );

          if (existing.length > 0) {
            await pool.query(
              'UPDATE pointages SET heure_arrivee = COALESCE(?, heure_arrivee), heure_depart = COALESCE(?, heure_depart) WHERE employe_id = ? AND DATE(date) = ?',
              [data.entrer, data.sortie, employeIdMySQL, dateStr]
            );
            synced++;
          } else {
            await pool.query(
              'INSERT INTO pointages (employe_id, date, heure_arrivee, heure_depart, statut) VALUES (?, ?, ?, ?, ?)',
              [employeIdMySQL, dateStr, data.entrer, data.sortie, 'present']
            );
            synced++;
          }
          totalPointages++;
        }
      } catch (e) {
        console.error(`Error syncing ${dateStr}:`, e.message);
      }
    }

    res.json({ success: true, synced, total: totalPointages });
  } catch (error) {
    console.error('Erreur sync:', error);
    res.status(500).json({ error: 'Erreur de synchronisation: ' + error.message });
  }
});

router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const presences = await fetchWithTimeout(`${PRESENCE_ARIS_V2_URL}/api/presences/${today}`);
    res.json(presences);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/last-scan', async (req, res) => {
  try {
    const presences = await fetchWithTimeout(`${PRESENCE_ARIS_V2_URL}/api/today-presences`);
    res.json(Array.isArray(presences) ? presences.slice(0, 10) : []);
  } catch (error) {
    console.error('Erreur last scan:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/employees', async (req, res) => {
  try {
    const stats = await fetchWithTimeout(`${PRESENCE_ARIS_V2_URL}/api/dashboard/stats`);
    res.json(stats);
  } catch (error) {
    console.error('Erreur employees:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/photos-url', (req, res) => {
  res.json({ url: PRESENCE_ARIS_PHOTOS_URL });
});

export default router;
