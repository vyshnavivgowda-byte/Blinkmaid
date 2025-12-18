"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, Mail, MapPin, Clock, Star, Loader2, 
  X, CheckCircle, XCircle, ArrowRight, Shield
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

/* -------------------- PREMIUM TOAST -------------------- */
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
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
const RatingInput = ({ rating, setRating }) => (
  <div className="flex gap-3 py-3">
    {[1, 2, 3, 4, 5].map((star) => (
      <motion.button
        whileHover={{ scale: 1.2, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        key={star}
        type="button"
        onClick={() => setRating(star)}
      >
        <Star
          className={`w-9 h-9 transition-all duration-300 ${
            rating >= star ? "text-blinkred fill-blinkred" : "text-gray-100 fill-gray-50"
          }`}
        />
      </motion.button>
    ))}
  </div>
);

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [reviewData, setReviewData] = useState({ name: "", rating: 0, review: "" });
  const [toast, setToast] = useState({ message: "", type: "" });
  const [contactLoading, setContactLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const showToast = (message, type) => setToast({ message, type });

  const handleSubmit = async (e) => {
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

  const handleReviewSubmit = async (e) => {
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
    <div className="bg-white text-blinkblack min-h-screen selection:bg-blinkred selection:text-white">
      <Toast {...toast} onClose={() => setToast({ message: "", type: "" })} />

      {/* --- CINEMATIC HERO WITH BACKGROUND IMAGE --- */}
      <section className="relative w-full h-[70vh] flex items-end overflow-hidden">
        {/* Background Image with Parallax-like effect */}
        <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop')" }}
        >
            {/* Dark/White Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-black/20" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 pb-12">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-[2px] bg-blinkred"></div>
                <span className="text-xs font-black uppercase tracking-[0.5em] text-blinkred">Concierge Support</span>
              </div>
              <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.75] mb-0">
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
              <p className="text-xl text-blinkblack font-bold leading-relaxed max-w-md border-l-4 border-blinkred pl-6">
                We believe your time is the ultimate luxury. Let us restore the soul of your environment.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- INFO BENTO TILES --- */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Phone, label: "Direct Line", val: "+91 93804 19755" },
              { icon: Mail, label: "Digital Mail", val: "support@blinkmaid.com" },
              { icon: MapPin, label: "Studio", val: "Thanisandra, Bengaluru" },
              { icon: Clock, label: "Operating", val: "Mon-Sat, 8AM-8PM" }
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ backgroundColor: "#000", color: "#fff" }}
                className="p-10 rounded-[2rem] bg-gray-50 border border-gray-100 group transition-all duration-500"
              >
                <item.icon className="w-6 h-6 mb-6 text-blinkred group-hover:text-white transition-colors" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{item.label}</p>
                <p className="font-bold text-lg tracking-tight">{item.val}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            whileHover={{ scale: 0.98 }}
            className="bg-blinkred rounded-[2rem] p-10 text-white flex flex-col justify-between overflow-hidden relative min-h-[400px]"
          >
             <Shield className="absolute -right-10 -top-10 w-64 h-64 text-white/10 rotate-12" />
             <h3 className="text-4xl font-black leading-none uppercase tracking-tighter relative z-10">Trusted by <br/> Premium <br/> Estates.</h3>
             <div className="relative z-10">
                <p className="text-sm font-bold opacity-80 mb-4 tracking-wide uppercase">Member of Global Quality Alliance</p>
                <div className="h-1 w-20 bg-white"></div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* --- FORM SECTION --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-24 items-start">
          
          {/* Main Form */}
          <div className="lg:col-span-7">
            <div className="mb-16">
               <h2 className="text-4xl font-black tracking-tighter uppercase mb-4">Send a <span className="text-blinkred">Message</span></h2>
               <div className="h-2 w-24 bg-blinkblack"></div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="relative">
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="peer w-full bg-transparent border-b-2 border-gray-100 py-4 focus:border-blinkred outline-none transition-all font-bold text-xl placeholder-transparent"
                    placeholder="Name" required id="name"
                  />
                  <label htmlFor="name" className="absolute left-0 top-0 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-blinkred">Your Identity</label>
                </div>

                <div className="relative">
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="peer w-full bg-transparent border-b-2 border-gray-100 py-4 focus:border-blinkred outline-none transition-all font-bold text-xl placeholder-transparent"
                    placeholder="Phone" id="phone"
                  />
                  <label htmlFor="phone" className="absolute left-0 top-0 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-blinkred">Phone Number</label>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="peer w-full bg-transparent border-b-2 border-gray-100 py-4 focus:border-blinkred outline-none transition-all font-bold text-xl placeholder-transparent"
                  placeholder="Email" required id="email"
                />
                <label htmlFor="email" className="absolute left-0 top-0 text-[10px) font-black uppercase tracking-widest text-gray-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-blinkred">Email Correspondence</label>
              </div>

              <div className="relative">
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="peer w-full bg-transparent border-b-2 border-gray-100 py-4 focus:border-blinkred outline-none resize-none transition-all font-bold text-xl placeholder-transparent"
                  placeholder="Message" required id="msg"
                />
                <label htmlFor="msg" className="absolute left-0 top-0 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-blinkred">Inquiry Details</label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={contactLoading}
                className="w-full py-6 bg-blinkblack text-white font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 group"
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

          {/* Review Column */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border-2 border-blinkblack rounded-[3rem] p-12 shadow-[20px_20px_0px_#000]"
            >
              <h2 className="text-3xl font-black tracking-tighter uppercase mb-6 text-blinkblack leading-none">Leave a <br/> <span className="text-blinkred italic text-5xl">Legacy.</span></h2>
              
              <form onSubmit={handleReviewSubmit} className="space-y-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Identity</p>
                  <input
                    value={reviewData.name}
                    onChange={(e) => setReviewData({ ...reviewData, name: e.target.value })}
                    className="w-full bg-gray-50 rounded-xl px-6 py-4 outline-none border border-transparent focus:border-blinkblack transition-all font-bold"
                    placeholder="Enter Name" required
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Performance Rating</p>
                  <RatingInput rating={reviewData.rating} setRating={(r) => setReviewData({ ...reviewData, rating: r })} />
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Statement</p>
                  <textarea
                    rows={4}
                    value={reviewData.review}
                    onChange={(e) => setReviewData({ ...reviewData, review: e.target.value })}
                    className="w-full bg-gray-50 rounded-xl px-6 py-4 outline-none border border-transparent focus:border-blinkblack transition-all font-bold resize-none"
                    placeholder="Share your thoughts..." required
                  />
                </div>

                <button
                  disabled={reviewLoading}
                  className="w-full py-5 border-2 border-blinkblack text-blinkblack font-black uppercase tracking-widest hover:bg-blinkblack hover:text-white transition-all"
                >
                  {reviewLoading ? <Loader2 className="animate-spin mx-auto" /> : "Post Review"}
                </button>
              </form>
            </motion.div>
          </div>

        </div>
      </section>
    </div>
  );
}