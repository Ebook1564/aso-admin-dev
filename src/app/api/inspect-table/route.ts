import { NextResponse } from "next/server";
import pool from "../../../lib/db";

export async function GET() {
    try {
        const columns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'creatednewusertable'
            ORDER BY ordinal_position;
        `);

        if (columns.rows.length === 0) {
            return NextResponse.json({
                success: false,
                error: "Table 'creatednewusertable' not found."
            });
        }

        const sample = await pool.query(`SELECT * FROM creatednewusertable LIMIT 5`);

        return NextResponse.json({
            success: true,
            columns: columns.rows,
            sampleData: sample.rows
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ success: false, error: errorMessage });
    }
}
