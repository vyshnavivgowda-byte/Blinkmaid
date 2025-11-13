import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error("❌ Error fetching users:", error.message);
      return Response.json({ users: 0, error: error.message }, { status: 500 });
    }

    return Response.json({ users: data?.users?.length || 0 });
  } catch (err) {
    console.error("❌ Unexpected error:", err.message);
    return Response.json({ users: 0, error: "Server error" }, { status: 500 });
  }
}
    