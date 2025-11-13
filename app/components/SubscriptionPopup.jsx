"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function SubscriptionPopup({ isSubscribed, onSubscribe }) {
  const [show, setShow] = useState(false);

  // Popup logic: shows for 5s, repeats every 20s
  useEffect(() => {
    if (!isSubscribed) {
      // show immediately once page loads
      setShow(true);

      // hide after 5 seconds
      const hideTimer = setTimeout(() => setShow(false), 5000);

      // show again every 20 seconds
      const repeatTimer = setInterval(() => {
        setShow(true);
        setTimeout(() => setShow(false), 5000);
      }, 20000);

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
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-5 rounded-2xl shadow-xl z-50 flex items-center justify-between gap-4 w-[350px]"
        >
          <div className="flex-1">
            <h3 className="font-semibold text-lg">🎁 Blinkmaid Premium</h3>
            <p className="text-sm text-red-100">
              Subscribe now and get <b>20% OFF</b> on all your bookings!
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onSubscribe}
              className="bg-white text-red-600 px-3 py-1 rounded-full font-medium hover:bg-red-50 transition"
            >
              Subscribe
            </button>
            <button
              onClick={() => setShow(false)}
              className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
