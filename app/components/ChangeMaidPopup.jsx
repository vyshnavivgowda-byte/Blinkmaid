"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function BigChangeMaidPopup() {
  const [show, setShow] = useState(false);
  const [shouldShowPopup, setShouldShowPopup] = useState(false);

  // Step 1 — Check if user booked service & hasn't changed maid
  useEffect(() => {
    const checkBookingStatus = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      const userId = auth.user.id;

      const { data: booking } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (!booking) return;
      if (booking.maid_changed === true) return;

      setShouldShowPopup(true);
    };

    checkBookingStatus();
  }, []);

  // Step 2 — Popup animation time logic
 useEffect(() => {
  if (shouldShowPopup) {
    setShow(true);

    // Show popup for 1 minute 30 seconds
    const hideTimer = setTimeout(() => setShow(false), 90000);

    const repeatTimer = setInterval(() => {
      setShow(true);
      setTimeout(() => setShow(false), 90000);
    }, 90000); // repeat after popup finishes

    return () => {
      clearTimeout(hideTimer);
      clearInterval(repeatTimer);
    };
  }
}, [shouldShowPopup]);

  if (!shouldShowPopup) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-10 relative text-center">
            <button
              onClick={() => setShow(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-bold mb-4 text-black">🧹 Need a Maid Replacement?</h2>
            <p className="text-lg text-gray-700 mb-6">
              You recently booked a service. Request a maid change anytime to ensure the best experience!
            </p>

            <button
              onClick={() => (window.location.href = "/change-maid")}
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-blue-700 transition"
            >
              Change Maid
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
