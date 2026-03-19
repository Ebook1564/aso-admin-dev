import pg from 'pg';
import { config } from 'dotenv';
import path from 'path';

// Try to load from both .env and .env.local
config({ path: path.resolve(process.cwd(), '.env') });
config({ path: path.resolve(process.cwd(), '.env.local') });

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
});

async function listTables() {
    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        console.log('Tables in public schema:');
        console.table(res.rows);
        
        // Search for tables matching the user's description
        const filtered = res.rows.filter(row => 
            row.table_name.toLowerCase().includes('user') || 
            row.table_name.toLowerCase().includes('created')
        );
        if (filtered.length > 0) {
            console.log('\nPotential matches:');
            console.table(filtered);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error listing tables:', err.message);
        process.exit(1);
    }
}

listTables();
