const { Pool } = require('pg');

const pool = new Pool({
  host: 'aso-web-project.c3uoyku4eh6f.ap-south-1.rds.amazonaws.com',
  port: 5432,
  database: 'asowebdev',
  user: 'postgres',
  password: 'Amansaxena1',
  ssl: { rejectUnauthorized: false },
});

async function getSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'asopayments'
      ORDER BY ordinal_position;
    `);
    console.log("SCHEMA_START");
    console.log(JSON.stringify(res.rows));
    console.log("SCHEMA_END");

    const sample = await pool.query(`SELECT * FROM asopayments LIMIT 1`);
    console.log("SAMPLE_START");
    console.log(JSON.stringify(sample.rows));
    console.log("SAMPLE_END");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

getSchema();
