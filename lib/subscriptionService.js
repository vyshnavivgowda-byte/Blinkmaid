import { supabase } from "@/lib/supabaseClient";

export async function getSubscriptionByEmail(email) {
  if (!email) return null;

  try {
    const { data, error } = await supabase
      .from("subscribers")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Subscription fetch error:", error);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error("Subscription error:", err);
    return null;
  }
}
