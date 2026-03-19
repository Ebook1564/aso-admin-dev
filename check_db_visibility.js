const { Pool } = require('pg');
const pool = new Pool({
  host: 'aso-web-project.c3uoyku4eh6f.ap-south-1.rds.amazonaws.com',
  port: 5432,
  database: 'asowebdev',
  user: 'postgres',
  password: 'Amansaxena1',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    console.log("Checking taskdeliverkeywordtable...");
    const k = await pool.query('SELECT id, useremail, payment_id, transaction_id, left(keyword_upload, 20) as preview FROM taskdeliverkeywordtable ORDER BY id DESC LIMIT 5');
    console.log("KEYWORDS:", JSON.stringify(k.rows, null, 2));

    console.log("\nChecking asopayments...");
    const p = await pool.query('SELECT id, email, item_id, transactionid FROM asopayments ORDER BY id DESC LIMIT 5');
    console.log("PAYMENTS:", JSON.stringify(p.rows, null, 2));

    console.log("\nChecking formfilledtable...");
    const f = await pool.query('SELECT * FROM formfilledtable LIMIT 10');
    console.log("FORM_FILLED_STATUS:", JSON.stringify(f.rows, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
