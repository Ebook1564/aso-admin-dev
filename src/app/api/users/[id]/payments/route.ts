import { NextResponse } from "next/server";
import pool from "../../../../../lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const result = await pool.query(
      `SELECT id, payment_id, amount, plan, payment_date, status
       FROM payments
       WHERE user_id = $1
       ORDER BY payment_date DESC`,
      [userId]
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
