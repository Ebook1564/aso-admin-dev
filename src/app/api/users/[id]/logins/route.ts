import { NextResponse } from "next/server";
import pool from "../../../../../lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const result = await pool.query(
      `SELECT l.id, l.login_time, l.location, l.status, u.useremail
       FROM logins l
       JOIN usertable u ON l.user_id = u.id
       WHERE l.user_id = $1
       ORDER BY l.login_time DESC
       LIMIT 10`,
      [userId]
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
