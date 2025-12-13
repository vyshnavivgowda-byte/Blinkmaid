"use client";

import { motion } from "framer-motion";
import React from "react"; // Added React import for standard practice
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from "react-icons/hi";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  // Utility for hover effect
  const linkClass = "hover:text-red-400 transition hover:translate-x-1 duration-300 block";

  return (
    // Updated background to ensure a slightly smoother, richer dark tone
    <footer className="bg-gradient-to-r from-gray-900 to-red-950 text-white py-12 mt-0">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }} // Ensure animation only runs once
        >
          {/* Brand */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-red-400">Blinkmaid</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Professional home and office cleaning services you can trust.
              Experience hassle-free bookings and spotless results with our expert team.
            </p>
          </div>

          {/* Quick Links (Updated) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b-2 border-red-500 pb-1 inline-block">Quick Links</h3>
            <ul className="space-y-3 text-sm font-medium">
              <li><a href="/" className={linkClass}>Home</a></li>
              <li><a href="/services" className={linkClass}>Services</a></li>
              <li><a href="/about" className={linkClass}>About Us</a></li>
              {/* NEW LINKS ADDED */}
              <li><a href="/terms" className={linkClass}>Terms & Conditions</a></li>
              <li><a href="/privacy" className={linkClass}>Privacy Policy</a></li>
              <li><a href="/contact" className={linkClass}>Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b-2 border-red-500 pb-1 inline-block">Get In Touch</h3>
            <ul className="text-sm space-y-4">
              <li className="flex items-start space-x-3">
                <HiOutlineLocationMarker size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">NO. 33, SHOP NO.01, TELECOM LAYOUT MAIN ROAD, ASHWATHNAGAR, THANISANDRA, BENGALURU-560077</span>
              </li>
              <li className="flex items-center space-x-3">
                <HiOutlinePhone size={20} className="text-red-400 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <HiOutlineMail size={20} className="text-red-400 flex-shrink-0" />
                <span>support@blinkmaid.com</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b-2 border-red-500 pb-1 inline-block">Follow Us</h3>
            <div className="flex space-x-3 pt-1">
              {[
                { icon: <FaFacebookF size={18} />, label: "Facebook" },
                { icon: <FaInstagram size={18} />, label: "Instagram" },
                { icon: <FaTwitter size={18} />, label: "Twitter" },
                { icon: <FaLinkedin size={18} />, label: "LinkedIn" },
              ].map((social, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-3 bg-white/10 rounded-full hover:bg-red-600 transition duration-300 transform hover:scale-110"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            
            {/* Newsletter CTA (Added as a common footer feature) */}
            <div className="pt-4">
                <p className="text-sm font-medium text-gray-300 mb-2">Get our latest offers:</p>
                <div className="flex">
                    <input 
                        type="email" 
                        placeholder="Your email" 
                        className="p-2 w-full text-sm rounded-l-md border-none bg-gray-700 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
                    />
                    <button className="p-2 text-sm font-semibold bg-red-600 rounded-r-md hover:bg-red-700 transition">
                        Subscribe
                    </button>
                </div>
            </div>

          </div>
        </motion.div>

        {/* Footer Bottom */}
        <motion.div
          className="border-t border-gray-700 mt-12 pt-6 text-center text-sm text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <p>&copy; {new Date().getFullYear()} **Blinkmaid**. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
}