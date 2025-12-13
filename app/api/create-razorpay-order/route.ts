import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency } = body;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,      // <-- MUST be defined
      key_secret: process.env.RAZORPAY_KEY_SECRET, 
    });

    const order = await razorpay.orders.create({
      amount: Number(amount) * 100,
      currency,
      receipt: "receipt_" + Date.now(),
    });

    return NextResponse.json(order);
  } catch (err: any) {
    console.error("RAZORPAY ERROR:", err);
    return NextResponse.json(
      {
        error: "Razorpay order failed",
        details: err.message || String(err),
      },
      { status: 500 }
    );
  }
}