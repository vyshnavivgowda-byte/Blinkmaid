import ServiceBookingFlow from './ServiceBookingFlow'; // Ensure this matches your filename

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function Page({ params }) {
  return <ServiceBookingFlow id={params.id} />;
}