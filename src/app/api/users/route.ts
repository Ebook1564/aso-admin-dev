// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import pool from "../../../lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id,
              useremail,
              today_revenue,
              yesterday_revenue,
              last_7d_revenue,
              this_month_revenue,
              last_28d_revenue,
              created_at
       FROM userdatatable
       ORDER BY id DESC`
    );

    return NextResponse.json(
      { success: true, data: result.rows },
      { status: 200 }
    );
    } catch (error: unknown) {
        console.error("API /api/users GET error:", error);
        const errorMessage = error instanceof Error ? error.message : "Database query failed";
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      useremail,
      today_revenue,
      yesterday_revenue,
      last_7d_revenue,
      this_month_revenue,
      last_28d_revenue
    } = body;

    const result = await pool.query(
      `INSERT INTO userdatatable (
        useremail, today_revenue, yesterday_revenue, last_7d_revenue, this_month_revenue, last_28d_revenue
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        useremail,
        today_revenue || 0,
        yesterday_revenue || 0,
        last_7d_revenue || 0,
        this_month_revenue || 0,
        last_28d_revenue || 0
      ]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
    } catch (error: unknown) {
        console.error("API /api/users POST error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to create user data entry";
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
