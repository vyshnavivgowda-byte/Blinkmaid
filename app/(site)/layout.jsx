import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookServicePopup from "../components/BookServicePopup";
import ChangeMaidPopup from "../components/ChangeMaidPopup";
import SubscriptionPopup from "../components/SubscriptionPopup";
import { Toaster } from "react-hot-toast";

export default function SiteLayout({ children }) {
  return (
    <div>
      <Navbar />
      <main className="pt-20">{children}</main>
      <Footer />

      {/* Popups */}
      <SubscriptionPopup />
      <BookServicePopup />
      <ChangeMaidPopup />

      {/* Toasts (placed at the bottom to avoid overlap) */}
      <Toaster position="bottom-center" />
    </div>
  );
}
