const { Pool } = require('pg');

const pool = new Pool({
  host: 'aso-web-project.c3uoyku4eh6f.ap-south-1.rds.amazonaws.com',
  port: 5432,
  database: 'asowebdev',
  user: 'postgres',
  password: 'Amansaxena1',
  ssl: { rejectUnauthorized: false }
});

async function createTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS taskdeliverkeywordtable (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        username VARCHAR(255),
        useremail VARCHAR(255),
        transaction_id VARCHAR(255),
        payment_id INTEGER,
        payment_amount DECIMAL(10,2),
        payment_status VARCHAR(50),
        keyword_upload TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
    console.log("Table 'taskdeliverkeywordtable' created successfully or already exists.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    await pool.end();
  }
}

createTable();
