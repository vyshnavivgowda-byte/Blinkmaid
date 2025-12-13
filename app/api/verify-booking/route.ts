import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing parameters" },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, message: "RAZORPAY_KEY_SECRET missing" },
        { status: 500 }
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Signature mismatch" },
        { status: 400 }
      );
    }

    // ✅ Payment verified successfully
    return NextResponse.json({ success: true, payment_status: "paid" });
  } catch (err) {
    console.error("Payment verification failed:", err);
    return NextResponse.json(
      { success: false, error: "Verification failed", details: err.message || err },
      { status: 500 }
    );
  }
}