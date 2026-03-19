// src/app/api/created-users/route.ts
import { NextResponse } from "next/server";
import pool from "../../../lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT *
       FROM asousertable
       ORDER BY id DESC`
    );

    return NextResponse.json(
      { success: true, data: result.rows },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API /api/created-users GET error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Database query failed" },
      { status: 500 }
    );
  }
}
