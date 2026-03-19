import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { payment_id, keyword_pdf } = body;

        if (!payment_id || !keyword_pdf) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // 1. Fetch payment details from asopayments
        const paymentResult = await pool.query(
            "SELECT id, name, email, phonenumber, country, amount, transactionid, payment_status FROM asopayments WHERE id = $1",
            [payment_id]
        );

        if (paymentResult.rows.length === 0) {
            return NextResponse.json({ success: false, error: "Payment record not found" }, { status: 404 });
        }

        const payment = paymentResult.rows[0];

        // 1.5 Check if the user has filled the form
        const formResult = await pool.query(
            "SELECT status FROM formfilledtable WHERE email = $1",
            [payment.email]
        );
        const formStatus = formResult.rows[0]?.status;

        if (formStatus !== 1) {
            return NextResponse.json({ 
                success: false, 
                error: "User has not filled the required form. Delivery blocked." 
            }, { status: 403 });
        }

        // 2. Extract user_id if possible
        const userResult = await pool.query(
            "SELECT id FROM creatednewusertable WHERE email = $1 LIMIT 1",
            [payment.email]
        );
        const userId = userResult.rows[0]?.id || payment.email || "GUEST_USER";

        // 3. Insert into taskdeliverkeywordtable
        const insertQuery = `
            INSERT INTO taskdeliverkeywordtable (
                user_id, username, useremail, transaction_id, 
                payment_id, payment_amount, payment_status, keyword_upload
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id;
        `;

        const insertValues = [
            userId,
            payment.name,
            payment.email,
            payment.transactionid,
            payment.id,
            payment.amount,
            payment.payment_status,
            keyword_pdf // Base64 PDF data
        ];

        const result = await pool.query(insertQuery, insertValues);

        return NextResponse.json({ 
            success: true, 
            data: { id: result.rows[0].id },
            message: "Keywords delivered successfully" 
        });

    } catch (error: unknown) {
        console.error("API /api/deliver-keywords POST error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to deliver keywords";
        return NextResponse.json({ 
            success: false, 
            error: errorMessage 
        }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const paymentId = searchParams.get("payment_id");
        const userEmail = searchParams.get("user_email");

        if (paymentId) {
            const result = await pool.query(
                "SELECT * FROM taskdeliverkeywordtable WHERE payment_id = $1 ORDER BY created_at DESC",
                [paymentId]
            );
            return NextResponse.json({ success: true, data: result.rows });
        }

        if (userEmail) {
            const result = await pool.query(
                "SELECT * FROM taskdeliverkeywordtable WHERE useremail = $1 ORDER BY created_at DESC",
                [userEmail]
            );
            return NextResponse.json({ success: true, data: result.rows });
        }

        const result = await pool.query("SELECT * FROM taskdeliverkeywordtable ORDER BY created_at DESC");
        return NextResponse.json({ success: true, data: result.rows });

    } catch (error: unknown) {
        console.error("API /api/deliver-keywords GET error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch delivery records" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const deliveryId = searchParams.get("id");

        if (!deliveryId) {
            return NextResponse.json({ success: false, error: "Missing delivery ID" }, { status: 400 });
        }

        const deleteQuery = "DELETE FROM taskdeliverkeywordtable WHERE id = $1 RETURNING id";
        const result = await pool.query(deleteQuery, [deliveryId]);

        if (result.rowCount === 0) {
            return NextResponse.json({ success: false, error: "Delivery record not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Delivery record deleted successfully" });
    } catch (error: unknown) {
        console.error("API /api/deliver-keywords DELETE error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete delivery record" }, { status: 500 });
    }
}
