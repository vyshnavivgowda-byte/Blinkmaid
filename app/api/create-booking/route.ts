import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { amount, currency = "INR" } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Number(amount), // amount in paise
      currency,
      receipt: "receipt_" + Date.now(),
      payment_capture: 1, // automatic capture
    });

    console.log("Razorpay Order Created:", order);

    return NextResponse.json(order);
  } catch (err) {
    console.error("RAZORPAY ERROR:", err);
    return NextResponse.json(
      { error: "Razorpay order failed", details: err.message || String(err) },
      { status: 500 }
    );
  }
}