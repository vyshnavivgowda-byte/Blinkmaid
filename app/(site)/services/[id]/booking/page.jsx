export const dynamic = 'force-static';

export async function generateStaticParams() {
  // Returning a placeholder fixes the "missing generateStaticParams" build error
  return [{ id: 'placeholder' }]; 
}

export default function Page({ params }) {
  // Optional: Handle the placeholder case if needed
  return (
    <div>
      {/* Your booking page content */}
    </div>
  );
}