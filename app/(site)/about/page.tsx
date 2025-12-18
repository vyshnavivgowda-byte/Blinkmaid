"use client";

import {
  Target,
  Eye,
  Handshake,
  CheckCircle,
  Shield,
  Star,
  ArrowRight,
  Quote
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function About() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("website_reviews")
        .select("*")
        .eq("status", "active")
        .order("id", { ascending: false });
      if (data) setReviews(data);
    };
    fetchReviews();
  }, []);

  const commitments = [
    {
      icon: Handshake,
      title: "Trusted Service",
      desc: "Carefully vetted professionals delivering spotless, reliable home services.",
    },
    {
      icon: CheckCircle,
      title: "Unyielding Quality",
      desc: "High standards of cleanliness, consistency, and professionalism.",
    },
    {
      icon: Shield,
      title: "Verified & Secure",
      desc: "Background-checked staff ensuring safety and peace of mind.",
    },
  ];

  return (
    <div className="bg-white text-blinkblack min-h-screen selection:bg-blinkred selection:text-white">
      
      {/* ---------------- CINEMATIC HEADER WITH BACKGROUND IMAGE ---------------- */}
      <section className="relative w-full h-[85vh] flex items-end overflow-hidden">
        {/* Background Image Container */}
        <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105"
            style={{ 
              // Changed to a Warm Home Care / Professional Domestic background
              backgroundImage: "url('https://images.unsplash.com/photo-1581578731548-c64695cc6954?q=80&w=2070&auto=format&fit=crop')",
              filter: "brightness(0.9)"
            }}
        >
            {/* Multi-stage Overlay for depth */}
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="h-[2px] w-16 bg-blinkred"></span>
              <span className="text-xs font-black uppercase tracking-[0.6em] text-blinkred">EST. 2024</span>
            </div>
            
            <h1 className="text-7xl md:text-[11rem] font-black tracking-tighter leading-[0.75] mb-10 drop-shadow-sm">
              PURE <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-blinkblack to-gray-500">LEGACY.</span>
            </h1>

            <div className="grid md:grid-cols-2 gap-12 items-start">
              <p className="text-xl md:text-2xl text-blinkblack font-bold leading-tight max-w-lg">
                We don't just provide help. We restore the harmony and safety of your personal sanctuary.
              </p>
              <div className="hidden md:block">
                <div className="h-px w-full bg-gray-200 mb-6"></div>
                <p className="text-sm font-black uppercase tracking-widest text-gray-400">Baby Sitting • Patient Care • Verified Staff</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------- THE BENTO COMMITMENTS ---------------- */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {commitments.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-12 rounded-[3.5rem] bg-gray-50 border border-gray-100 hover:bg-blinkred transition-all duration-700 cursor-default"
            >
              <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center mb-8 shadow-sm group-hover:rotate-6 transition-transform">
                <item.icon className="w-8 h-8 text-blinkred transition-colors" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 group-hover:text-white transition-colors">{item.title}</h3>
              <p className="text-gray-500 group-hover:text-white/80 transition-colors font-medium leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------- MISSION & VISION (DARK MODE BREAK) ---------------- */}
      <section className="py-32 bg-blinkblack text-white relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blinkred/20 blur-[150px] rounded-full" />
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-16 leading-none">
              OUR CARE <span className="text-blinkred italic text-5xl md:text-7xl">SPECTRUM.</span>
            </h2>
            <div className="space-y-16">
              <div className="flex gap-10">
                <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                    <Target className="w-6 h-6 text-blinkred" />
                </div>
                <div>
                  <h4 className="text-xl font-black uppercase tracking-widest mb-4">Our Mission</h4>
                  <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-md">
                    To provide families with peace of mind by connecting them with thoroughly vetted and compassionate domestic professionals.
                  </p>
                </div>
              </div>
              <div className="flex gap-10">
                <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                    <Eye className="w-6 h-6 text-blinkred" />
                </div>
                <div>
                  <h4 className="text-xl font-black uppercase tracking-widest mb-4">Our Vision</h4>
                  <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-md">
                    To become the undisputed gold standard for trusted home staff management and compassionate patient care.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden">
              <img 
                // Changed to a Patient Care / Nursing image to suit your services
                src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=2031&auto=format&fit=crop" 
                alt="Professional Care"
                className="w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-1000"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-blinkred p-12 rounded-[3rem] shadow-2xl">
               <Shield className="w-12 h-12 text-white mb-4" />
               <p className="text-xs font-black uppercase tracking-widest text-white/80">Safety Rating</p>
               <p className="text-4xl font-black text-white">A+</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="mb-24 text-center">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase mb-6">VOICES OF <span className="text-blinkred">TRUST.</span></h2>
            <div className="w-24 h-2 bg-blinkblack mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {reviews.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-12 rounded-[3rem] bg-gray-50 border border-gray-100 flex flex-col justify-between hover:shadow-2xl transition-all"
            >
              <Quote className="w-12 h-12 text-gray-200 mb-8 group-hover:text-blinkred transition-colors" />
              <div>
                <p className="text-blinkblack font-bold text-xl leading-relaxed mb-10 italic">
                  “{r.review}”
                </p>
              </div>
              <div className="flex items-center gap-4 border-t border-gray-200 pt-8">
                <div className="w-10 h-10 bg-blinkred rounded-full flex items-center justify-center text-white font-black">
                    {r.name.charAt(0)}
                </div>
                <p className="font-black uppercase tracking-widest text-xs">
                  {r.name}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto bg-blinkred rounded-[4rem] p-20 md:p-32 text-center text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase mb-12">
            JOIN THE <br/> REVOLUTION.
          </h2>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-blinkblack px-16 py-6 rounded-2xl font-black uppercase tracking-[0.3em] flex items-center gap-4 mx-auto hover:bg-blinkblack hover:text-white transition-all shadow-xl"
          >
            Book Now <ArrowRight />
          </motion.button>
        </div>
      </section>
    </div>
  );
}