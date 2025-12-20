"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function BigBookNewServicePopup() {
  const [show, setShow] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const { data: auth, error: authError } =
        await supabase.auth.getUser();

      console.log("AUTH:", auth, authError);

      if (!auth?.user) return;

      const userId = auth.user.id;

      // ✅ Check ACTIVE subscription
      const { data: subscriptions, error: subError } = await supabase
        .from("subscriptions")
        .select("id, status")
        .eq("user_id", userId)
        .eq("status", "active"); // 🔥 IMPORTANT

      console.log("SUBSCRIPTIONS:", subscriptions, subError);

      if (!subscriptions || subscriptions.length === 0) return;

      // ✅ Check REAL bookings only
      const { data: bookings, error: bookingError } = await supabase
        .from("bookings")
        .select("id, status")
        .eq("user_id", userId)
        .in("status", ["confirmed", "completed"]); // 🔥 IMPORTANT

      console.log("BOOKINGS:", bookings, bookingError);

      // ✅ SHOW POPUP ONLY IF NO BOOKINGS
      if (!bookings || bookings.length === 0) {
        console.log("SHOW POPUP ✅");
        setShouldShow(true);
      }
    };

    checkStatus();
  }, []);

  useEffect(() => {
    if (!shouldShow) return;

    setShow(true);

    const hideTimer = setTimeout(() => setShow(false), 90000);

    const repeatTimer = setInterval(() => {
      setShow(true);
      setTimeout(() => setShow(false), 90000);
    }, 30000);

    return () => {
      clearTimeout(hideTimer);
      clearInterval(repeatTimer);
    };
  }, [shouldShow]);

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-10 relative text-center">
            <button
              onClick={() => setShow(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-bold mb-4 text-black">
              🎉 Subscription Active!
            </h2>

            <p className="text-lg text-gray-700 mb-6">
              You haven’t booked any service yet.  
              Book your first service now and get started!
            </p>

            <button
              onClick={() => (window.location.href = "/services")}
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-blue-700 transition"
            >
              Book Your First Service
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
