"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// 60000 milliseconds = 1 minute
const POPUP_DURATION_MS = 60000; 
// 30000 milliseconds = 30 seconds (Wait time before repeating the popup)
const REPEAT_INTERVAL_MS = 30000; 

export default function BigSubscriptionPopup() {
  const [show, setShow] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      const email = auth.user.email;

      // NOTE: Based on the previous solution, subscription status should ideally be checked
      // in the 'profiles' table or user metadata, not 'subscribers'. 
      // Using 'subscribers' for now to match the existing code.
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

  useEffect(() => {
    if (!isSubscribed) {
      // Initial show
      setShow(true);

      // Initial hide after 1 minute (60 seconds)
      const hideTimer = setTimeout(() => setShow(false), POPUP_DURATION_MS);

      // Repeat timer: show every 30 seconds, and hide after 1 minute each time
      const repeatTimer = setInterval(() => {
        setShow(true);
        setTimeout(() => setShow(false), POPUP_DURATION_MS);
      }, REPEAT_INTERVAL_MS);

      return () => {
        clearTimeout(hideTimer);
        clearInterval(repeatTimer);
      };
    }
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

            <h2 className="text-3xl font-bold mb-4 text-red-600">🎁 Upgrade to Blinkmaid Premium!</h2>
            <p className="text-lg text-gray-700 mb-6">
              Subscribe now and get <b>20% OFF</b> on all your bookings. Enjoy premium benefits, exclusive offers, and priority service.
            </p>

            <button
              onClick={() => setShow(false)} // Changed to just close the modal, link action should be separate
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