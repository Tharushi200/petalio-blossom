const mysql = require('mysql2/promise');

// MySQL Connection Pool with automatic reconnection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petalio_blossom',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Test connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✓ Connected to MySQL database 'petalio_blossom' (localhost:3306)");
    connection.release();
  } catch (err) {
    console.error("✗ Failed to connect to MySQL database 'petalio_blossom':", err.message);
  }
})();

module.exports = pool;

