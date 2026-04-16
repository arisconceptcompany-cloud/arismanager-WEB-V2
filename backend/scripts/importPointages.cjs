const Database = require('better-sqlite3');
const mysql = require('mysql2/promise');

const presenceArisDb = new Database('/home/tech-0002/Téléchargements/02 Analyse_Numérique M1-20260318T051547Z-1-001/PresenceAris1/PresenceAris/presence.db');

async function importPointages() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0008',
    database: 'gestion_employes'
  });

  // Mapping entre employee_id PresenceAris et matricule
  const employeeMap = {
    1: 'ARIS-0001',
    5: 'ARIS-0005',
    6: 'ARIS-0007',
    7: 'ARIS-0008',
    8: 'ARIS-0010',
    9: 'ARIS-0012'
  };

  // Obtenir tous les pointages groupés par employée et par jour
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

  let imported = 0;
  let skipped = 0;

  for (const p of pointages) {
    const matricule = employeeMap[p.employee_id];
    if (!matricule) {
      console.log(`Skipped: Unknown employee_id ${p.employee_id}`);
      skipped++;
      continue;
    }

    try {
      // Obtenir l'ID de l'employé dans GestionEmploye
      const [employeRows] = await connection.query(
        'SELECT id FROM employes WHERE matricule = ?',
        [matricule]
      );

      if (employeRows.length === 0) {
        console.log(`Skipped: Employé ${matricule} non trouvé`);
        skipped++;
        continue;
      }

      const employeId = employeRows[0].id;

      // Vérifier si le pointage existe déjà
      const [existing] = await connection.query(
        'SELECT id FROM pointages WHERE employe_id = ? AND date = ?',
        [employeId, p.date]
      );

      if (existing.length > 0) {
        await connection.query(
          'UPDATE pointages SET heure_arrivee = ?, heure_depart = ? WHERE employe_id = ? AND date = ?',
          [p.heure_arrivee, p.heure_depart, employeId, p.date]
        );
        console.log(`Updated: ${matricule} - ${p.date}`);
      } else {
        await connection.query(
          'INSERT INTO pointages (employe_id, date, heure_arrivee, heure_depart, statut) VALUES (?, ?, ?, ?, ?)',
          [employeId, p.date, p.heure_arrivee, p.heure_depart, 'present']
        );
        console.log(`Imported: ${matricule} - ${p.date}`);
      }
      imported++;
    } catch (error) {
      console.error(`Error for ${matricule}:`, error.message);
      skipped++;
    }
  }

  console.log(`\nImport complete!`);
  console.log(`Imported/Updated: ${imported}`);
  console.log(`Skipped: ${skipped}`);

  await connection.end();
  presenceArisDb.close();
}

importPointages().catch(console.error);
