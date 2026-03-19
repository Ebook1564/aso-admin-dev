import { NextResponse } from "next/server";
import pool from "../../../lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        // Handle Single Record Fetch (including screenshot)
        if (id) {
            const result = await pool.query(`
                SELECT p.*, f.status as form_status
                FROM asopayments p
                LEFT JOIN formfilledtable f ON p.email = f.email
                WHERE p.id = $1
            `, [id]);
            
            if (result.rows.length === 0) {
                return NextResponse.json({ success: false, error: "Record not found" }, { status: 404 });
            }
            
            return NextResponse.json({ success: true, data: result.rows[0] });
        }

        // Handle Paginated List Fetch (excluding screenshot for speed)
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const offset = (page - 1) * limit;

        let query = `
            SELECT 
                p.id, p.name, p.email, p.phonenumber, p.country, p.amount, 
                p.transactionid, p.timestamp, p.payment_status,
                f.status as form_status
            FROM asopayments p
            LEFT JOIN formfilledtable f ON p.email = f.email
        `;
        let countQuery = `SELECT COUNT(*) FROM asopayments`;
        const values: (string | number)[] = [];

        if (search) {
            const searchPattern = `%${search}%`;
            const filter = `
                WHERE p.name ILIKE $1 
                OR p.email ILIKE $1 
                OR p.transactionid ILIKE $1 
                OR p.phonenumber ILIKE $1
            `;
            query += filter;
            countQuery += filter;
            values.push(searchPattern);
        }

        query += ` ORDER BY timestamp DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
        const pagedValues = [...values, limit, offset];

        const [dataResult, countResult] = await Promise.all([
            pool.query(query, pagedValues),
            pool.query(countQuery, values)
        ]);

        return NextResponse.json({
            success: true,
            data: dataResult.rows,
            total: parseInt(countResult.rows[0].count),
            page,
            limit
        });
    } catch (error: unknown) {
        console.error("API /api/payments-history GET error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch payment history";
        return NextResponse.json({ 
            success: false, 
            error: errorMessage 
        }, { status: 500 });
    }
}
