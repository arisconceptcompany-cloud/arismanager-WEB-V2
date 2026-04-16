import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'ariscco_sarobidy',
  password: 'Saroobidy10289#',
  database: 'ariscco_employe_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
