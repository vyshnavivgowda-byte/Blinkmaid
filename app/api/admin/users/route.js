import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  throw new Error("❌ ENV ERROR: NEXT_PUBLIC_SUPABASE_URL is missing!");
}

if (!serviceRoleKey) {
  throw new Error("❌ ENV ERROR: SUPABASE_SERVICE_ROLE_KEY is missing!");
}

const supabaseAdmin = createClient(url, serviceRoleKey);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error("❌ Supabase error:", error.message);
      return Response.json({ users: 0, error: error.message }, { status: 500 });
    }

    return Response.json({ users: data?.users?.length || 0 });
  } catch (err: any) {
    console.error("❌ Unexpected error:", err);
    return Response.json({ users: 0, error: "Server error" }, { status: 500 });
  }
}
