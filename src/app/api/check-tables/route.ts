import { NextResponse } from "next/server";
import pool from "../../../lib/db";

export async function GET() {
    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        return NextResponse.json({
            success: true,
            tables: res.rows
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, error: errorMessage });
    }
}
