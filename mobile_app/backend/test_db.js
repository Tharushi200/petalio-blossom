const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log("Connecting to MySQL...");
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'petalio_blossom'
    });

    console.log("Connected successfully to MySQL database 'petalio_blossom'!");
    
    const [tables] = await connection.query("SHOW TABLES;");
    console.log("Tables in petalio_blossom:");
    console.log(JSON.stringify(tables, null, 2));

    for (const row of tables) {
      const tableName = Object.values(row)[0];
      const [columns] = await connection.query(`DESCRIBE \`${tableName}\`;`);
      console.log(`\nStructure of table '${tableName}':`);
      console.log(columns.map(c => ` - ${c.Field} (${c.Type}, Null: ${c.Null}, Key: ${c.Key}, Default: ${c.Default})`).join('\n'));
    }

    await connection.end();
  } catch (error) {
    console.error("Connection or Query Error:", error.message);
  }
}

testConnection();

