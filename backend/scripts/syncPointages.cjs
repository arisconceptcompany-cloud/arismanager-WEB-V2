const Database = require('better-sqlite3');
const mysql = require('mysql2/promise');

const presenceArisDb = new Database('/home/tech-0002/Téléchargements/02 Analyse_Numérique M1-20260318T051547Z-1-001/PresenceAris1/PresenceAris/presence.db');

async function syncPointages() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0008',
    database: 'gestion_employes'
  });

  const employeeMap = {
    1: 'ARIS-0001',
    5: 'ARIS-0005',
    6: 'ARIS-0007',
    7: 'ARIS-0008',
    8: 'ARIS-0010',
    9: 'ARIS-0012'
  };

  const query = `
    SELECT 
      employee_id,
      DATE(scanned_at) as date,
      MAX(CASE WHEN type = 'entrer' THEN TIME(scanned_at) END) as heure_arrivee,
      MAX(CASE WHEN type = 'sortie' THEN TIME(scanned_at) END) as heure_depart
    FROM presence
    GROUP BY employee_id, DATE(scanned_at)
    ORDER BY date DESC
  `;
  const pointages = presenceArisDb.prepare(query).all();

  let synced = 0;

  for (const p of pointages) {
    const matricule = employeeMap[p.employee_id];
    if (!matricule) continue;

    try {
      const [employeRows] = await connection.query(
        'SELECT id FROM employes WHERE matricule = ?',
        [matricule]
      );

      if (employeRows.length === 0) continue;
      const employeId = employeRows[0].id;

      const [existing] = await connection.query(
        'SELECT id FROM pointages WHERE employe_id = ? AND date = ?',
        [employeId, p.date]
      );

      if (existing.length > 0) {
        await connection.query(
          'UPDATE pointages SET heure_arrivee = ?, heure_depart = ? WHERE employe_id = ? AND date = ?',
          [p.heure_arrivee, p.heure_depart, employeId, p.date]
        );
      } else {
        await connection.query(
          'INSERT INTO pointages (employe_id, date, heure_arrivee, heure_depart, statut) VALUES (?, ?, ?, ?, ?)',
          [employeId, p.date, p.heure_arrivee, p.heure_depart, 'present']
        );
      }
      synced++;
    } catch (error) {
      console.error(`Error: ${matricule}`, error.message);
    }
  }

  console.log(`Synced: ${synced} pointages`);
  await connection.end();
  presenceArisDb.close();
}

setInterval(syncPointages, 30000);
syncPointages();
