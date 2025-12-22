import ServiceBookingFlow from './ServiceBookingFlow'; // Check if the path is correct

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function Page({ params }) {
  return <ServiceBookingFlow id={params.id} />;
}