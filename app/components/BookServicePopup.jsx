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
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      const userId = auth.user.id;

      // Check subscription
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!sub) return;

      // Check bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!bookings || bookings.length === 0) return;

      const lastBooking = bookings[0];

      if (lastBooking.maid_changed === true) {
        setShouldShow(true);
      }
    };

    checkStatus();
  }, []);

  useEffect(() => {
    if (!shouldShow) return;

    setShow(true);

    const hideTimer = setTimeout(() => setShow(false), 8000);

    const repeatTimer = setInterval(() => {
      setShow(true);
      setTimeout(() => setShow(false), 8000);
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

            <h2 className="text-3xl font-bold mb-4 text-black">✨ Book Your Next Service</h2>
            <p className="text-lg text-gray-700 mb-6">
              Your subscription is active. Book your next service now and enjoy a seamless experience!
            </p>

            <button
              onClick={() => (window.location.href = "/services")}
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-blue-700 transition"
            >
              Book Now
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
