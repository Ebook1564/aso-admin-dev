import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ success: false, error: "Missing id or status" }, { status: 400 });
        }

        const result = await pool.query(
            `UPDATE asopayments 
             SET payment_status = $1 
             WHERE id = $2 
             RETURNING *`,
            [status, id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ success: false, error: "Payment record not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error: any) {
        console.error("API /api/payments-history/update-status POST error:", error);
        return NextResponse.json({ 
            success: false, 
            error: error?.message || "Failed to update payment status" 
        }, { status: 500 });
    }
}
