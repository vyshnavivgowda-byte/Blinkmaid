"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Mail, MapPin, Clock, Star, Loader2,
  X, CheckCircle, XCircle, ArrowRight, Shield, MessageSquare, Globe
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface RatingInputProps {
  rating: number;
  setRating: (rating: number) => void;
}
interface ToastProps {
  message: string;
  type: "success" | "error" | null;
  onClose: () => void;
}



/* -------------------- PREMIUM TOAST -------------------- */
const Toast = ({ message, type, onClose }: ToastProps) => {
  if (!message || !type) return null;

  const isSuccess = type === "success";
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed bottom-10 right-10 z-[1000]"
      >
        <div className={`flex items-center gap-5 backdrop-blur-md border ${isSuccess ? 'border-blinkred/20 bg-white/90' : 'border-black/10 bg-white/90'} p-6 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.12)] min-w-[350px]`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSuccess ? 'bg-blinkred text-white' : 'bg-black text-white'}`}>
            {isSuccess ? <CheckCircle size={24} /> : <XCircle size={24} />}
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{isSuccess ? 'Status: Confirmed' : 'Status: Interrupted'}</p>
            <p className="text-sm text-blinkblack font-bold leading-tight">{message}</p>
          </div>
          <button onClick={onClose} className="hover:bg-gray-100 p-2 rounded-full transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/* -------------------- RATING INPUT -------------------- */
const RatingInput = ({ rating, setRating }: RatingInputProps) => (
  <div className="flex gap-2 py-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        key={star}
        type="button"
        onClick={() => setRating(star)}
      >
        <Star
          className={`w-7 h-7 transition-all duration-300 ${rating >= star ? "text-blinkred fill-blinkred" : "text-gray-200 fill-transparent"
            }`}
        />
      </motion.button>
    ))}
  </div>
);

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [reviewData, setReviewData] = useState({ name: "", rating: 0, review: "" });
  const [contactLoading, setContactLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  type ToastType = "success" | "error" | null;

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  }>({
    message: "",
    type: null,
  });

  const showToast = (message: string, type: "success" | "error") =>
    setToast({ message, type });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      const { error } = await supabase.from("contacts").insert([formData]);
      if (error) throw error;
      showToast("Transmission received. We will contact you shortly.", "success");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch {
      showToast("Connection failed. Please check your network.", "error");
    } finally {
      setContactLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reviewData.rating) return showToast("A rating is required for submission.", "error");
    setReviewLoading(true);
    try {
      const { error } = await supabase.from("website_reviews").insert([reviewData]);
      if (error) throw error;
      showToast("Thank you. Your feedback is our priority.", "success");
      setReviewData({ name: "", rating: 0, review: "" });
    } catch {
      showToast("Review could not be submitted.", "error");
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="bg-white text-blinkblack min-h-screen selection:bg-blinkred selection:text-white overflow-x-hidden">
      <Toast {...toast} onClose={() => setToast({ message: "", type: null })} />

      {/* --- CINEMATIC HERO (Exactly as requested) --- */}
      <section className="relative w-full h-[85vh] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-black/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-[2px] bg-blinkred"></div>
                <span className="text-xs font-black uppercase tracking-[0.5em] text-blinkred drop-shadow-sm">Concierge Support</span>
              </div>
              <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.75] mb-0 drop-shadow-2xl">
                GET IN <br />
                <span className="text-blinkblack">TOUCH.</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="lg:pb-8"
            >
              <p className="text-xl text-blinkblack font-bold leading-relaxed max-w-md border-l-4 border-blinkred pl-6 bg-white/10 backdrop-blur-sm py-2">
                We believe your time is the ultimate luxury. Let us restore the soul of your environment.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- ENHANCED BENTO GRID: PROFESSIONAL TRANSITION (Refined Hover) --- */}
      <section className="px-6 mt-24 relative z-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Phone, label: "Concierge Line", val: "+91 93804 19755", tag: "Direct Call" },
            { icon: Mail, label: "Email Inquiry", val: "support@blinkmaid.com", tag: "Official Mail" },
            { icon: MapPin, label: "Studio Location", val: "Thanisandra, Bengaluru", tag: "Visit Us" },
            { icon: Clock, label: "Availability", val: "Mon–Sat, 8AM–8PM", tag: "Working Hours" }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-8 rounded-[2.5rem] bg-white border border-gray-100 hover:border-blinkred/20 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl"
            >
              {/* The Content Wrapper */}
              <div className="relative z-10">
                <span className="text-[10px] font-semibold text-red-600 uppercase tracking-[0.3em] mb-6 block opacity650">
                  {item.tag}
                </span>

                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blinkred transition-colors duration-500 shadow-sm">
                  <item.icon className="w-6 h-6 text-blinkblack group-hover:text-white transition-colors duration-500" />
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 group-hover:text-blinkblack/50 transition-colors">
                  {item.label}
                </p>

                <h3 className="text-base font-bold text-blinkblack tracking-tight leading-tight group-hover:text-blinkblack transition-colors">
                  {item.val}
                </h3>

                <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-transparent group-hover:text-blinkred transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  Connect <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* The Morphing Background Circle */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gray-50 rounded-full group-hover:scale-[6] transition-transform duration-700 ease-in-out z-0" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- SPLIT INTERACTIVE SECTION --- */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-20">

          {/* Left: Refined Message Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4 mb-16"
            >
              <h2 className="text-6xl font-black tracking-tighter uppercase leading-none">Drop a <br /><span className="text-blinkred">Message</span></h2>
              <div className="h-1.5 w-20 bg-blinkblack"></div>
              <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Typical response time: Under 1 hour</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="relative group">
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="peer w-full bg-transparent border-b-2 border-gray-200 py-4 focus:border-blinkred outline-none transition-all font-bold text-xl placeholder-transparent"
                    placeholder="Name" required id="f-name"
                  />
                  <label htmlFor="f-name" className="absolute left-0 top-4 text-sm font-black uppercase tracking-widest text-gray-400 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-blinkred peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]">Your Name</label>
                </div>

                <div className="relative group">
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="peer w-full bg-transparent border-b-2 border-gray-200 py-4 focus:border-blinkred outline-none transition-all font-bold text-xl placeholder-transparent"
                    placeholder="Phone" id="f-phone"
                  />
                  <label htmlFor="f-phone" className="absolute left-0 top-4 text-sm font-black uppercase tracking-widest text-gray-400 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-blinkred peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]">Phone Number</label>
                </div>
              </div>

              <div className="relative group">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="peer w-full bg-transparent border-b-2 border-gray-200 py-4 focus:border-blinkred outline-none transition-all font-bold text-xl placeholder-transparent"
                  placeholder="Email" required id="f-email"
                />
                <label htmlFor="f-email" className="absolute left-0 top-4 text-sm font-black uppercase tracking-widest text-gray-400 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-blinkred peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]">Correspondence Email</label>
              </div>

              <div className="relative group">
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="peer w-full bg-transparent border-b-2 border-gray-200 py-4 focus:border-blinkred outline-none resize-none transition-all font-bold text-xl placeholder-transparent"
                  placeholder="Message" required id="f-msg"
                />
                <label htmlFor="f-msg" className="absolute left-0 top-4 text-sm font-black uppercase tracking-widest text-gray-400 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-blinkred peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]">Inquiry Details</label>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={contactLoading}
                className="w-full py-6 bg-blinkblack text-white font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 group shadow-2xl hover:bg-blinkred transition-colors duration-500"
              >
                {contactLoading ? <Loader2 className="animate-spin" /> : (
                  <>
                    Submit Transmission
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* Right: The Review "Vault" */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-blinkblack text-white rounded-[2.5rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.2)] relative overflow-hidden border border-white/10"
              >
                <MessageSquare className="absolute -right-10 -top-10 w-48 h-48 text-white/[0.03]" />

                <h2 className="text-3xl font-black uppercase leading-none mb-10 relative z-10">
                  Leave a <br /><span className="text-blinkred italic text-5xl">Legacy.</span>
                </h2>

                <form onSubmit={handleReviewSubmit} className="space-y-8 relative z-10">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Identity</p>
                      <input
                        value={reviewData.name}
                        onChange={(e) => setReviewData({ ...reviewData, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-blinkred transition-all font-bold placeholder:text-white/20"
                        placeholder="Full Name" required
                      />
                    </div>

                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Service Rating</p>
                      <RatingInput rating={reviewData.rating} setRating={(r) => setReviewData({ ...reviewData, rating: r })} />
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Statement</p>
                      <textarea
                        rows={3}
                        value={reviewData.review}
                        onChange={(e) => setReviewData({ ...reviewData, review: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-blinkred transition-all font-bold resize-none placeholder:text-white/20"
                        placeholder="Share your thoughts..." required
                      />
                    </div>
                  </div>

                  <button
                    disabled={reviewLoading}
                    className="w-full py-5 bg-white text-blinkblack font-black uppercase tracking-widest rounded-xl hover:bg-blinkred hover:text-white transition-all duration-500 shadow-xl"
                  >
                    {reviewLoading ? <Loader2 className="animate-spin mx-auto" /> : "Post Review"}
                  </button>
                </form>
              </motion.div>

              {/* Trust Footer */}
              <div className="mt-12 flex items-center justify-between px-6 opacity-60 group">
                <div className="flex items-center gap-4">
                  <Shield className="w-8 h-8 text-blinkblack group-hover:text-blinkred transition-colors" />
                  <div>
                    <p className="font-black uppercase text-[10px] tracking-widest">Secure Portal</p>
                    <p className="text-[11px] font-bold">Encrypted Communication</p>
                  </div>
                </div>
                <Globe className="w-8 h-8 text-blinkblack animate-pulse" />
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}