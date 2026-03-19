// src/app/api/dashboard/metrics/route.ts
import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function GET() {
  try {
    // Get today's date range (start and end of today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // Get current month date range
    // currentMonthStart/End unused removed

    // 1. Today Login - Count all users as placeholder for now
    let todayLoginCount = 0;
    try {
      const allUsersQuery = `SELECT COUNT(*) as count FROM creatednewusertable`;
      const allUsersResult = await pool.query(allUsersQuery);
      todayLoginCount = parseInt(allUsersResult.rows[0]?.count || '0', 10);
    } catch (error) {
      console.error("Error fetching today login count:", error);
    }

    // 2. Total Login - Count all users in creatednewusertable
    const totalLoginQuery = `SELECT COUNT(*) as count FROM creatednewusertable`;
    const totalLoginResult = await pool.query(totalLoginQuery);
    const totalLoginCount = parseInt(totalLoginResult.rows[0]?.count || '0', 10);

    // 3. Monthly Revenue - Placeholder
    const monthlyRevenue = 0;

    // 4. Active Users - Same as Today Login
    const activeUsersCount = todayLoginCount;

    return NextResponse.json(
      {
        success: true,
        data: {
          todayLogin: todayLoginCount,
          totalLogin: totalLoginCount,
          monthlyRevenue: monthlyRevenue,
          activeUsers: activeUsersCount,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("API /api/dashboard/metrics GET error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch dashboard metrics";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}


