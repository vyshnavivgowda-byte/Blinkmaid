import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
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
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: Number(amount),
      currency,
      receipt: "receipt_" + Date.now(),
    });


    return NextResponse.json(order);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown Razorpay error";

    return NextResponse.json(
      { error: "Razorpay order failed", details: message },
      { status: 500 }
    );
  }
}
