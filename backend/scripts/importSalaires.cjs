const Database = require('better-sqlite3');
const mysql = require('mysql2/promise');

const presenceArisDb = new Database('/home/tech-0002/Téléchargements/02 Analyse_Numérique M1-20260318T051547Z-1-001/PresenceAris1/PresenceAris/presence.db');

async function importSalaires() {
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

  const salaries = presenceArisDb.prepare('SELECT * FROM salaries').all();
  let imported = 0;
  let skipped = 0;

  for (const s of salaries) {
    const matricule = employeeMap[s.employee_id];
    if (!matricule) {
      skipped++;
      continue;
    }

    try {
      const [employeRows] = await connection.query(
        'SELECT id FROM employes WHERE matricule = ?',
        [matricule]
      );

      if (employeRows.length === 0) {
        skipped++;
        continue;
      }

      const employeId = employeRows[0].id;

      const [existing] = await connection.query(
        'SELECT id FROM salaries WHERE employe_id = ? AND mois = ? AND annee = ?',
        [employeId, s.mois, s.annee]
      );

      const salaireNet = s.salaire_base + s.primes - s.autres_retenues;

      if (existing.length > 0) {
        await connection.query(
          'UPDATE salaries SET salaire_base = ?, primes = ?, deductions = ?, salaire_net = ?, statut_paiement = ? WHERE employe_id = ? AND mois = ? AND annee = ?',
          [s.salaire_base, s.primes, s.autres_retenues, salaireNet, s.statut === 'valide' ? 'paye' : 'en_attente', employeId, s.mois, s.annee]
        );
      } else {
        await connection.query(
          'INSERT INTO salaries (employe_id, mois, annee, salaire_base, primes, deductions, salaire_net, statut_paiement) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [employeId, s.mois, s.annee, s.salaire_base, s.primes, s.autres_retenues, salaireNet, s.statut === 'valide' ? 'paye' : 'en_attente']
        );
      }
      console.log(`Imported: ${matricule} - ${s.mois}/${s.annee}`);
      imported++;
    } catch (error) {
      console.error(`Error:`, error.message);
      skipped++;
    }
  }

  console.log(`\nImport complete!`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped: ${skipped}`);

  await connection.end();
  presenceArisDb.close();
}

importSalaires().catch(console.error);
