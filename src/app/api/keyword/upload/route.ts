import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, pdfUrl, fileName, uploadedByAdmin, downloadPermission, paymentId } = body;

    const result = await pool.query(
      `INSERT INTO keyword_reports (
        user_id, pdf_url, file_name, uploaded_by_admin, download_permission, payment_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [userId, pdfUrl, fileName, uploadedByAdmin, downloadPermission, paymentId]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
