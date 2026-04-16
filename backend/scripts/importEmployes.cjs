const Database = require('better-sqlite3');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const presenceArisDb = new Database('/home/tech-0002/Téléchargements/02 Analyse_Numérique M1-20260318T051547Z-1-001/PresenceAris1/PresenceAris/presence.db');

async function importEmployes() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0008',
    database: 'gestion_employes'
  });

  const employees = presenceArisDb.prepare('SELECT * FROM employees').all();
  console.log(`Found ${employees.length} employees in PresenceAris`);

  const hashedPassword = await bcrypt.hash('aris2026', 10);

  let imported = 0;
  let skipped = 0;

  for (const emp of employees) {
    try {
      const [existing] = await connection.query(
        'SELECT id FROM employes WHERE matricule = ?',
        [emp.badge_id]
      );

      if (existing.length > 0) {
        await connection.query(
          `UPDATE employes SET nom = ?, prenom = ?, email = ?, poste = ?, 
           departement = ?, telephone = ?, adresse = ?, date_embauche = ?, photo = ? 
           WHERE matricule = ?`,
          [
            emp.nom,
            emp.prenom,
            emp.email,
            emp.poste,
            emp.departement,
            emp.telephone,
            emp.adresse,
            emp.date_embauche ? new Date(emp.date_embauche.split('/').reverse().join('-')) : null,
            emp.photo,
            emp.badge_id
          ]
        );
        console.log(`Updated: ${emp.badge_id} - ${emp.prenom} ${emp.nom}`);
      } else {
        await connection.query(
          `INSERT INTO employes (matricule, nom, prenom, email, mot_de_passe, poste, 
           departement, telephone, adresse, date_embauche, role, photo) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            emp.badge_id,
            emp.nom,
            emp.prenom,
            emp.email,
            hashedPassword,
            emp.poste,
            emp.departement,
            emp.telephone,
            emp.adresse,
            emp.date_embauche ? new Date(emp.date_embauche.split('/').reverse().join('-')) : null,
            'employe',
            emp.photo
          ]
        );
        console.log(`Imported: ${emp.badge_id} - ${emp.prenom} ${emp.nom}`);
      }
      imported++;
    } catch (error) {
      console.error(`Error for ${emp.badge_id}:`, error.message);
      skipped++;
    }
  }

  console.log(`\nImport complete!`);
  console.log(`Imported/Updated: ${imported}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Default password for all accounts: aris2026`);

  await connection.end();
  presenceArisDb.close();
}

importEmployes().catch(console.error);
