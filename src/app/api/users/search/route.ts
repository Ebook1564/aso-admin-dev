import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ success: true, data: [] });
    }

    const result = await pool.query(
      `SELECT username, useremail, user_id, phonenumber, COUNT(*) as delivery_count
       FROM taskdeliverkeywordtable
       WHERE username ILIKE $1 OR useremail ILIKE $1 OR phonenumber ILIKE $1 OR transaction_id ILIKE $1
       GROUP BY username, useremail, user_id, phonenumber
       LIMIT 10`,
      [`%${query}%`]
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
