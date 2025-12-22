



import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json({ error: "Secret missing" }, { status: 500 });
    }

    const generated = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    const isSignatureValid = generated === razorpay_signature;

    if (!isSignatureValid) {
      return NextResponse.json(
        { success: false, message: "Signature mismatch" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Verification failed", details: err },
      { status: 500 }
    );
  }
}