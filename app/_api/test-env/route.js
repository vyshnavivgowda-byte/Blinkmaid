export async function GET() {
  return Response.json({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "missing",
    anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "missing"
  });
}
