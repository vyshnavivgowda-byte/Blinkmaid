"use client";

import { motion } from "framer-motion";
import React from "react";
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from "react-icons/hi";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa6";

export default function Footer() {
  const linkClass = "relative text-gray-400 hover:text-blinkwhite transition-colors duration-300 group flex items-center";

  return (
    <footer className="relative bg-blinkblack pt-24 pb-12 overflow-hidden border-t border-white/5">
      
      {/* --- BRANDED BACKGROUND GLOWS --- */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blinkred/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blinkred/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* --- BRAND IDENTITY --- */}
          <motion.div 
            className="lg:col-span-4 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="text-4xl font-black tracking-tighter text-blinkwhite mb-2 uppercase">
                BLINK<span className="text-blinkred">MAID.</span>
              </h2>
              <div className="w-12 h-1 bg-blinkred"></div>
            </div>
            
            <p className="text-lg text-gray-400 leading-relaxed font-medium">
              Redefining the gold standard of professional cleaning. We don't just clean spaces; 
              we curate environments for peak living.
            </p>

            <div className="flex gap-4">
              {[
                { icon: <FaFacebookF />, href: "#" },
                { icon: <FaInstagram />, href: "#" },
                { icon: <FaTwitter />, href: "#" },
                { icon: <FaLinkedinIn />, href: "#" },
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  whileHover={{ y: -5, backgroundColor: "#E63946", borderColor: "#E63946" }}
                  className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blinkwhite transition-all duration-300"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* --- NAVIGATION --- */}
          <motion.div 
            className="lg:col-span-2 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blinkred">Navigation</h3>
            <ul className="space-y-4 font-bold">
              {['Home', 'Services', 'About Us', 'Contact'].map((item) => (
                <li key={item}>
                  <a href={`/${item.toLowerCase().replace(' ', '')}`} className={linkClass}>
                    <span className="w-0 group-hover:w-4 h-[2px] bg-blinkred mr-0 group-hover:mr-3 transition-all duration-300"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* --- LEGAL --- */}
          <motion.div 
            className="lg:col-span-2 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blinkred">Legal</h3>
            <ul className="space-y-4 font-bold">
              {['Privacy Policy', 'Terms & Conditions', 'Cookie Policy'].map((item) => (
                <li key={item}>
                  <a href="#" className={linkClass}>
                    <span className="w-0 group-hover:w-4 h-[2px] bg-blinkred mr-0 group-hover:mr-3 transition-all duration-300"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* --- NEWSLETTER & CONTACT --- */}
          <motion.div 
            className="lg:col-span-4 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blinkred">Stay Updated</h3>
            <p className="text-gray-400 font-medium leading-relaxed">
              Join 500+ premium homeowners receiving our luxury maintenance tips and exclusive offers.
            </p>
            
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-blinkwhite outline-none focus:ring-1 focus:ring-blinkred transition-all duration-300 placeholder:text-gray-600"
              />
              <button className="absolute right-2 top-2 bottom-2 px-6 bg-blinkred hover:bg-[#d62d39] text-blinkwhite font-bold rounded-xl transition-all duration-300">
                Join
              </button>
            </div>

            <div className="pt-4 space-y-4">
               <div className="flex items-center gap-4 text-gray-400 group cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-blinkred/10 flex items-center justify-center text-blinkred group-hover:bg-blinkred group-hover:text-blinkwhite transition-all">
                    <HiOutlinePhone size={20} />
                  </div>
                  <span className="font-bold group-hover:text-blinkwhite transition-colors tracking-tight">+91 93804 19755</span>
               </div>
               
               <div className="flex items-center gap-4 text-gray-400 group cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-blinkred/10 flex items-center justify-center text-blinkred group-hover:bg-blinkred group-hover:text-blinkwhite transition-all">
                    <HiOutlineMail size={20} />
                  </div>
                  <span className="font-bold group-hover:text-blinkwhite transition-colors tracking-tight">support@blinkmaid.com</span>
               </div>
            </div>
          </motion.div>
        </div>

        {/* --- FOOTER BOTTOM --- */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} <span className="text-blinkwhite">Blinkmaid</span>. Crafted for Excellence.
          </p>

        </div>

      </div>
    </footer>
  );
}