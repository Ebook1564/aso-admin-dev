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
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

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
    let monthlyRevenue = 0;

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
  } catch (error: any) {
    console.error("API /api/dashboard/metrics GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch dashboard metrics",
      },
      { status: 500 }
    );
  }
}


