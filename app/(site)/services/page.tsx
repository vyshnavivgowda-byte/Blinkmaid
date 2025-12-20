"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Crown } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function getData() {
      const { data: sData } = await supabase.from("services").select("*");
      if (sData) setServices(sData);
    }
    getData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#111] font-sans">

      {/* --- SECTION 1: HERO --- */}
      <section className="relative h-[70vh] flex items-center px-6 overflow-hidden bg-black">
        {/* Background Image - Removed Grayscale */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://5.imimg.com/data5/SELLER/Default/2021/3/FZ/GL/YD/8248982/placement-services-for-babysitter-500x500.jpg"
            className="w-full h-full object-cover opacity-60"
            alt="Luxury Interior"
          />
          {/* Subtle Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-rose-500 font-black text-xs uppercase tracking-[0.5em] block mb-4">Premium Selection</span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6 uppercase text-white">
              The <span className="text-rose-600">Services.</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-md font-medium tracking-tight">
              Select a tier of care designed specifically for your residence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 2: COMPACT IMAGE CARDS --- */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <motion.div
                key={service.id}
                whileHover={{ y: -10 }}
                onClick={() => router.push(`/services/${service.id}`)}
                className="group cursor-pointer"
              >
                {/* Image Container - Removed Grayscale */}
                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-6 shadow-sm group-hover:shadow-2xl group-hover:shadow-rose-100 transition-all duration-500 bg-slate-100">
                  <img
                    src={service.image_url || `https://images.unsplash.com/photo-1581578731548-c64695cc6954?q=80&w=1000&auto=format&fit=crop`}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Floating Price Tag */}
                  <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-xl">
                    <span className="text-xs font-black uppercase tracking-wider text-black">
                      View Plans
                    </span>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Hover Arrow */}
                  <div className="absolute bottom-8 right-8 w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 shadow-xl">
                    <ArrowUpRight size={24} />
                  </div>
                </div>

                {/* Text Content */}
                <div className="px-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600">Service 0{idx + 1}</span>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-1 group-hover:text-rose-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 3: SUBSCRIPTION BAR --- */}
      <section className="py-12 bg-white border-y border-slate-100 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-rose-500">
              <Crown size={28} />
            </div>
            <div>
              <h4 className="font-black uppercase tracking-tight text-lg">Elite Membership</h4>
              <p className="text-slate-400 text-sm font-medium">Fixed monthly rates for total peace of mind.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}