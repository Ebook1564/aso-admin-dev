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
    console.log("Fetching users from asousertable...");
    const usersRes = await pool.query("SELECT id, name, email, phonenumber FROM asousertable");
    const users = usersRes.rows;
    console.log(`Found ${users.length} users to migrate.`);

    for (const user of users) {
      // Check if user already exists in taskdeliverkeywordtable to avoid duplicate search entries
      // Note: We use user_id as the link back to asousertable.id
      const checkRes = await pool.query(
        "SELECT id FROM taskdeliverkeywordtable WHERE user_id = $1 LIMIT 1",
        [user.id.toString()]
      );

      if (checkRes.rows.length === 0) {
        console.log(`Migrating user: ${user.name} (${user.email})`);
        await pool.query(
          `INSERT INTO taskdeliverkeywordtable (user_id, username, useremail, phonenumber) 
           VALUES ($1, $2, $3, $4)`,
          [user.id.toString(), user.name, user.email, user.phonenumber]
        );
      } else {
        // Option: Update the data if it changed
        await pool.query(
          `UPDATE taskdeliverkeywordtable 
           SET username = $1, useremail = $2, phonenumber = $3 
           WHERE user_id = $4`,
          [user.name, user.email, user.phonenumber, user.id.toString()]
        );
      }
    }

    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrate();
