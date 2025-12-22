export const dynamic = 'force-static';

export async function generateStaticParams() {
  // Returning 'placeholder' gives Next.js a physical file to create
  // Your client-side code will then take over and fetch the real ID
  return [{ id: 'placeholder' }];
}

export default function Page({ params }) {
  // Pass the ID to your client component
  return <ServiceBookingFlow id={params.id} />;
}