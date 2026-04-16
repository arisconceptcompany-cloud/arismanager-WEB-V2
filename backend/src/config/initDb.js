import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const initDB = async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'ariscco_sarobidy',
    password: 'Saroobidy10289#',
    database: 'ariscco_employe_management'
  });

  console.log('Connexion à la base de données établie');
  await connection.end();
};

export default initDB;
