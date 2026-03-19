const { Pool } = require('pg');

const pool = new Pool({
  host: 'aso-web-project.c3uoyku4eh6f.ap-south-1.rds.amazonaws.com',
  port: 5432,
  database: 'asowebdev',
  user: 'postgres',
  password: 'Amansaxena1',
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  try {
    console.log("Fetching payments from asopayments...");
    const paymentsRes = await pool.query("SELECT id, name, email, phonenumber, amount, transactionid, payment_status FROM asopayments");
    const payments = paymentsRes.rows;
    console.log(`Found ${payments.length} transactions to migrate.`);

    for (const p of payments) {
      // Check if this specific payment record already exists in taskdeliverkeywordtable
      // Note: We use payment_id as the unique key for transaction mappings
      const checkRes = await pool.query(
        "SELECT id FROM taskdeliverkeywordtable WHERE payment_id = $1 LIMIT 1",
        [p.id]
      );

      if (checkRes.rows.length === 0) {
        console.log(`Migrating transaction: ${p.transactionid} ($${p.amount}) for ${p.name}`);
        await pool.query(
          `INSERT INTO taskdeliverkeywordtable (
            username, useremail, phonenumber, 
            transaction_id, payment_id, payment_amount, payment_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [p.name, p.email, p.phonenumber, p.transactionid, p.id, p.amount, p.payment_status]
        );
      } else {
        // Update existing record with latest payment info
        await pool.query(
          `UPDATE taskdeliverkeywordtable 
           SET username = $1, useremail = $2, phonenumber = $3, 
               transaction_id = $4, payment_amount = $5, payment_status = $6
           WHERE payment_id = $7`,
          [p.name, p.email, p.phonenumber, p.transactionid, p.amount, p.payment_status, p.id]
        );
      }
    }

    console.log("Payment migration completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Payment migration error:", err);
    process.exit(1);
  }
}

migrate();
