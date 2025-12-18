"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// ⏱️ 90 seconds timing
const POPUP_DURATION_MS = 90000; // 1 min 30 sec
const REPEAT_INTERVAL_MS = 90000; // repeat after popup hides

export default function BigSubscriptionPopup() {
  const [show, setShow] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // 🔍 Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      const email = auth.user.email;

      const { data: sub } = await supabase
        .from("subscribers")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (sub) {
        setIsSubscribed(true);
        setShow(false);
      } else {
        setIsSubscribed(false);
      }
    };

    checkSubscription();
  }, []);

  // ⏱️ Popup timing logic
  useEffect(() => {
    if (isSubscribed) return;

    setShow(true);

    const hideTimer = setTimeout(() => {
      setShow(false);
    }, POPUP_DURATION_MS);

    const repeatTimer = setInterval(() => {
      setShow(true);
      setTimeout(() => setShow(false), POPUP_DURATION_MS);
    }, REPEAT_INTERVAL_MS);

    return () => {
      clearTimeout(hideTimer);
      clearInterval(repeatTimer);
    };
  }, [isSubscribed]);

  if (isSubscribed) return null;

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

            <h2 className="text-3xl font-bold mb-4 text-red-600">
              🎁 Upgrade to Blinkmaid Premium!
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Subscribe now and get <b>20% OFF</b> on all bookings.
              Enjoy premium benefits, exclusive offers, and priority service.
            </p>

            <button
              onClick={() => setShow(false)}
              className="bg-red-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-red-700 transition"
            >
              Subscribe Now
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
