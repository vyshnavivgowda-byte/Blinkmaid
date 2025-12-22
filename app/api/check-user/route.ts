import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (typeof email !== "string") {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    const { data, error } =
      await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const exists = data.users.some(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );

    return NextResponse.json({ exists });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
