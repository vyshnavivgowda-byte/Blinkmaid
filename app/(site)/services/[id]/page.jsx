import { supabase } from "@/lib/supabaseClient";
import ServiceBookingFlow from "./ServiceBookingFlow";

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const { data: services } = await supabase
    .from("services")
    .select("id");

  // Map the IDs to the format Next.js expects
  return services?.map((service) => ({
    id: service.id.toString(),
  })) || [];
}

export default function Page({ params }) {
  return <ServiceBookingFlow id={params.id} />;
}