export const dynamic = 'force-static';

export async function generateStaticParams() {
  // We return a 'placeholder' so Next.js has a physical file to export
  return [{ id: 'placeholder' }];
}

export default function Page({ params }) {
  // Your existing component code here
  return <ServiceBookingFlow id={params.id} />; 
}