"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Zap, Crown, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const POPUP_DURATION_MS = 90000;
const REPEAT_INTERVAL_MS = 90000;

export default function BigSubscriptionPopup() {
  const [show, setShow] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

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
      }
    };
    checkSubscription();
  }, []);

  useEffect(() => {
    if (isSubscribed) return;
    const initialTimer = setTimeout(() => setShow(true), 2000);

    const interval = setInterval(() => {
      setShow(true);
    }, REPEAT_INTERVAL_MS + POPUP_DURATION_MS);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isSubscribed]);

  if (isSubscribed) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="subscription-popup-main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-red-600/10 backdrop-blur-xl z-[9999] flex items-center justify-center p-4"
        >
          {/* Main White Premium Container */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(220,38,38,0.2)] max-w-xl w-full overflow-hidden border border-red-50"
          >
            {/* Soft Red Aura Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-60" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -ml-32 -mb-32 opacity-60" />

            <button
              onClick={() => setShow(false)}
              className="absolute top-8 right-8 text-gray-300 hover:text-red-600 transition-colors z-10"
            >
              <X size={24} strokeWidth={3} />
            </button>

            <div className="relative p-12 flex flex-col items-center text-center">
              {/* Badge Icon */}
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="bg-red-600 p-5 rounded-[2rem] shadow-xl shadow-red-200 mb-8"
              >
                <Crown size={42} className="text-white" />
              </motion.div>

              <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
                UPGRADE TO <br />
                <span className="text-red-600">BLINKMAID PREMIUM</span>
              </h2>

              <p className="text-gray-500 text-lg mb-10 font-medium">
                Subscribe now and unlock an exclusive <br />
                <span className="text-gray-900 font-bold decoration-red-500 decoration-4 underline underline-offset-4">10% DISCOUNT</span> on every booking.
              </p>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 gap-4 w-full mb-10">
                <div className="flex items-center gap-4 bg-red-50/50 p-4 rounded-2xl border border-red-100/50 group hover:bg-red-50 transition-colors">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Zap size={18} className="text-red-600" fill="currentColor" />
                  </div>
                  <p className="text-sm font-bold text-gray-800 uppercase tracking-wide text-left">Priority Service & Fast Booking</p>
                </div>
                <div className="flex items-center gap-4 bg-red-50/50 p-4 rounded-2xl border border-red-100/50 group hover:bg-red-50 transition-colors">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Sparkles size={18} className="text-red-600" fill="currentColor" />
                  </div>
                  <p className="text-sm font-bold text-gray-800 uppercase tracking-wide text-left">Exclusive Members-Only Offers</p>
                </div>
              </div>

              {/* Premium Button Action */}
              <motion.button
                whileHover={{ y: -4, shadow: "0 20px 25px -5px rgba(220, 38, 38, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShow(false)}
                className="group relative w-full bg-red-600 text-white py-6 rounded-2xl font-black text-xl tracking-tighter transition-all shadow-xl shadow-red-200 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  CLAIM PREMIUM STATUS <CheckCircle2 size={24} />
                </span>
                {/* Glossy Overlay Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              </motion.button>

              <p className="mt-8 text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                Elevate your home experience
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </AnimatePresence>
  );
}