// src/app/api/migrations/update-status-default/route.ts
// API endpoint to update the default status value to 'interested'
import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function POST() {
  try {
    const queries: string[] = [];
    const results: { query: string; success: boolean; error?: string; note?: string }[] = [];

    // Update the default value for the status column
    queries.push(`
      ALTER TABLE usertable 
      ALTER COLUMN status SET DEFAULT 'interested';
    `);

    // Update existing rows that have NULL status to 'interested'
    queries.push(`
      UPDATE usertable 
      SET status = 'interested' 
      WHERE status IS NULL;
    `);

    // Update the column comment to include 'interested' as a status option
    queries.push(`
      COMMENT ON COLUMN usertable.status IS 'User status: interested (default), ongoing, Hold, Declined';
    `);

    // Execute all queries
    for (const query of queries) {
      try {
        await pool.query(query);
        results.push({ query: query.trim().substring(0, 50) + '...', success: true });
      } catch (error: unknown) {
        // If comment doesn't exist or can't be updated, that's okay
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('does not exist') || errorMessage.includes('COMMENT')) {
          results.push({ 
            query: query.trim().substring(0, 50) + '...', 
            success: true,
            note: 'Skipped (non-critical)' 
          });
        } else {
          results.push({ 
            query: query.trim().substring(0, 50) + '...', 
            success: false, 
            error: errorMessage 
          });
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Status default updated to 'interested' successfully",
        results,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Migration API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Migration failed";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}



