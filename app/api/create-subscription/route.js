// app/api/create-subscription/route.js
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  const { planName, amount, interval, customer } = await req.json();

  // Step 1: Create plan dynamically
  const plan = await razorpay.plans.create({
    period: interval, // e.g., "monthly", "yearly"
    interval: 1,
    item: {
      name: planName,
      amount: amount * 100, // in paise
      currency: "INR",
    },
  });

  // Step 2: Create subscription for this plan
  const subscription = await razorpay.subscriptions.create({
    plan_id: plan.id,
    customer_notify: 1,
    total_count: interval === "monthly" ? 1 : interval === "quarterly" ? 2 : 12,
    customer,
  });

  return new Response(JSON.stringify({ plan, subscription }), { status: 200 });
}
