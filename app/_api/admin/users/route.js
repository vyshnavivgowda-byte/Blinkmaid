import { createClient } from "@supabase/supabase-js";

// ❌ Do NOT use NEXT_PUBLIC inside server-side routes
// const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

// ✅ Use server environment variable instead
const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  throw new Error("❌ ENV ERROR: SUPABASE_URL is missing!");
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
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return Response.json({ users: 0, error: "Server error" }, { status: 500 });
  }
}
