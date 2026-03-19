import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT kr.id, kr.pdf_url, kr.file_name, kr.uploaded_by_admin, kr.created_at, kr.payment_id,
              p.amount as payment_amount, p.plan as payment_plan, p.payment_date
       FROM keyword_reports kr
       LEFT JOIN payments p ON kr.payment_id = p.payment_id
       WHERE kr.user_id = $1 AND kr.download_permission = TRUE
       ORDER BY kr.created_at DESC`,
      [userId]
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
