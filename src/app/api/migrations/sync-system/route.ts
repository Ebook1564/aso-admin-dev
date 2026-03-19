import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function POST() {
  try {
    const queries = [
      // 1. Update usertable with role column
      `ALTER TABLE usertable ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';`,
      
      // 2. Create logins table
      `CREATE TABLE IF NOT EXISTS logins (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES usertable(id) ON DELETE CASCADE,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        location VARCHAR(255),
        status VARCHAR(50) DEFAULT 'success',
        ip_address VARCHAR(45)
      );`,

      // 3. Create payments table
      `CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES usertable(id) ON DELETE CASCADE,
        payment_id VARCHAR(100) UNIQUE NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        plan VARCHAR(100),
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'completed'
      );`,

      // 4. Create keyword_reports table
      `CREATE TABLE IF NOT EXISTS keyword_reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES usertable(id) ON DELETE CASCADE,
        pdf_url TEXT NOT NULL,
        file_name VARCHAR(255),
        uploaded_by_admin VARCHAR(100),
        download_permission BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        payment_id VARCHAR(100) REFERENCES payments(payment_id) ON DELETE SET NULL
      );`,

      // 4b. Ensure payment_id exists if table was already created
      `ALTER TABLE keyword_reports ADD COLUMN IF NOT EXISTS payment_id VARCHAR(100) REFERENCES payments(payment_id) ON DELETE SET NULL;`,

      // 5. Seed some data for testing (optional/safe)
      `UPDATE usertable SET role = 'admin' WHERE useremail = 'admin@aso.com' OR useremail = 'steve@example.com';`
    ];

    const results = [];
    for (const statement of queries) {
      try {
        await pool.query(statement);
        results.push({ statement: statement.substring(0, 50) + "...", status: "success" });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        results.push({ statement: statement.substring(0, 50) + "...", status: "error", message: errorMessage });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "System synchronization failed";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
