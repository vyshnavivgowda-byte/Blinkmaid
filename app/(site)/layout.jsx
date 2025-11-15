import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SubscriptionPopup from "../components/SubscriptionPopup";  // ✅ added

export default function SiteLayout({ children }) {
  return (
    <div className="bg-gray-50 text-gray-900 flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-20">{children}</main>
      <Footer />

      {/* ✅ Global subscription popup */}
      <SubscriptionPopup />
    </div>
  );
}
