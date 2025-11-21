import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  // 1️⃣ Fetch users
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  console.log("AUTH USERS =>", data.users); // 👈 DEBUG

  // 2️⃣ Fetch subscribers
  const { data: subscribers } = await supabaseAdmin
    .from("subscribers")
    .select("email");

  console.log("SUBSCRIBERS =>", subscribers); // 👈 DEBUG

  if (!subscribers) {
    console.log("❌ No subscribers found in table");
  }

  const subscribedEmails = new Set(
    subscribers?.map((s) => s.email?.trim().toLowerCase())
  );

  console.log("SUBSCRIBED EMAILS SET =>", subscribedEmails); // 👈 DEBUG

  // 3️⃣ Attach subscription flag
  const usersWithSubscription = data.users.map((u) => ({
    ...u,
    subscribed: subscribedEmails.has(u.email?.trim().toLowerCase()),
  }));

  console.log("FINAL USERS =>", usersWithSubscription); // 👈 DEBUG

  return NextResponse.json({ users: usersWithSubscription });
}
