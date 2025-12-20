"use client";

import {
  Target,
  Eye,
  Handshake,
  CheckCircle,
  Shield,
  Star,
  Quote
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function About() {
  const [reviews, setReviews] = useState([]);
  const containerRef = useRef(null);
  const router = useRouter();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

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
      tag: "Vetted"
    },
    {
      icon: CheckCircle,
      title: "Unyielding Quality",
      desc: "High standards of cleanliness, consistency, and professionalism.",
      tag: "Standard"
    },
    {
      icon: Shield,
      title: "Verified & Secure",
      desc: "Background-checked staff ensuring safety and peace of mind.",
      tag: "Security"
    },
  ];

  return (
    <div ref={containerRef} className="bg-[#FCFCFC] text-blinkblack min-h-screen selection:bg-blinkred selection:text-white">
      
      {/* ---------------- PREMIUM HERO SECTION ---------------- */}

<section className="relative w-full h-[85vh] flex items-end overflow-hidden">
  {/* 🔹 BACKGROUND IMAGE WITH HOVER EFFECT */}
  <div
    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
    style={{
      backgroundImage: "url('https://t3.ftcdn.net/jpg/14/86/25/86/240_F_1486258647_sIR9w4l4NrqyGFpQShL8Dcvzd7oWIgEk.jpg')"
    }}
  >
    {/* Refined gradient for better text legibility */}
    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-black/20" />
  </div>

  {/* 🔹 CONTENT */}
  <div className="relative z-10 max-w-7xl mx-auto w-full px-6 pb-20 md:pb-5">
    <div className="flex flex-col items-start max-w-5xl">
      
      {/* HEADER SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-[2px] bg-blinkred"></div>
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-blinkred drop-shadow-sm">
            Since 2024 • Elite Standards
          </span>
        </div>

        <h1 className="text-7xl md:text-[10rem] lg:text-[12rem] font-black tracking-tighter leading-[0.75] mb-12 drop-shadow-2xl">
          PURE <br />
          <span className="text-blinkblack">LEGACY.</span>
        </h1>

        {/* 🔹 BUTTON NOW PLACED DIRECTLY BELOW TEXT */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex flex-col md:flex-row items-start md:items-center gap-8"
        >


          <div className="flex flex-col">
             <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-1">
               Specialized Divisions
             </p>
             <p className="text-[10px] font-bold uppercase tracking-widest text-blinkblack/60">
               Baby Sitting • Patient Care • Verified Staff
             </p>
          </div>
        </motion.div>
      </motion.div>

    </div>
  </div>
</section>


      {/* ---------------- BENTO GRID COMMITMENTS ---------------- */}
      <section className="py-32 px-6 max-w-7xl mx-auto mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {commitments.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="group relative p-10 rounded-[2.5rem] bg-white border border-gray-100 hover:border-blinkred/20 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl"
            >
              <div className="relative z-10">
                <span className="text-[10px] font-semibold text-red-700 uppercase tracking-[0.3em] mb-6 block opacity-50">{item.tag}</span>
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blinkred transition-colors duration-500">
                  <item.icon className="w-6 h-6 text-blinkblack group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {item.desc}
                </p>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest group-hover:text-blinkred transition-colors cursor-pointer">
                    Learn More <ArrowRight className="w-3 h-3" />
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gray-50 rounded-full group-hover:scale-[6] transition-transform duration-700 z-0" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------- MISSION & VISION (ASYMMETRIC) ---------------- */}
      <section className="py-32 bg-blinkblack text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-10 left-10 w-96 h-96 bg-blinkred blur-[120px] rounded-full" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7">
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-5xl md:text-8xl font-black tracking-tighter uppercase mb-16 leading-none"
            >
              OUR CARE <br/>
              <span className="text-blinkred italic font-serif lowercase">spectrum.</span>
            </motion.h2>
            
            <div className="grid sm:grid-cols-2 gap-12">
              <div className="space-y-6">
                <Target className="w-10 h-10 text-blinkred" />
                <h4 className="text-lg font-bold uppercase tracking-widest">Our Mission</h4>
                <p className="text-gray-400 text-base leading-relaxed">
                  To provide families with peace of mind by connecting them with thoroughly vetted and compassionate domestic professionals.
                </p>
              </div>
              <div className="space-y-6">
                <Eye className="w-10 h-10 text-blinkred" />
                <h4 className="text-lg font-bold uppercase tracking-widest">Our Vision</h4>
                <p className="text-gray-400 text-base leading-relaxed">
                  To become the undisputed gold standard for trusted home staff management and compassionate patient care.
                </p>
              </div>
            </div>
          </div>

          <motion.div 
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <div className="aspect-[3/4] rounded-3xl overflow-hidden border-[12px] border-white/5">
              <img 
                src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=2031&auto=format&fit=crop" 
                alt="Professional Care"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-8 rounded-2xl shadow-2xl">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-blinkred rounded-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-none">Safety Rating</p>
                    <p className="text-3xl font-black text-blinkblack">A+ Verified</p>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------- TESTIMONIALS (EDITORIAL STYLE) ---------------- */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">
                VOICES OF <br/> <span className="text-blinkred">TRUST.</span>
            </h2>
            <p className="text-gray-400 max-w-xs font-medium text-sm border-l-2 border-gray-100 pl-6 uppercase tracking-widest">
                What our clients say about our dedicated professionals
            </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="p-10 rounded-3xl bg-white border border-gray-100 flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all group"
            >
              <div>
                <Quote className="w-8 h-8 text-blinkred/20 mb-6 group-hover:text-blinkred transition-colors" />
                <p className="text-blinkblack font-medium text-lg leading-relaxed mb-8">
                  “{r.review}”
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blinkblack text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold uppercase tracking-tighter text-sm">{r.name}</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-blinkred text-blinkred" />)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------- HIGH-IMPACT FINAL CTA ---------------- */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto bg-blinkblack rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blinkred/20 to-transparent pointer-events-none" />
          
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             className="relative z-10"
          >
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-8">
              READY TO RESTORE <br/> <span className="text-blinkred">YOUR HARMONY?</span>
            </h2>
            <p className="text-gray-400 mb-12 max-w-lg mx-auto font-medium">
                Experience the standard of care your home deserves. Vetted, professional, and compassionate.
            </p>
        <motion.button
  whileHover={{ scale: 1.05, backgroundColor: "#E63946" }}
  onClick={() => router.push(`/services`)}
  className="bg-white text-blinkblack px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] flex items-center gap-3 mx-auto transition-all shadow-2xl text-sm"
>
  Book Your Service
  <ArrowRight className="w-4 h-4" />
</motion.button>

          </motion.div>
        </div>
      </section>
    </div>
  );
}