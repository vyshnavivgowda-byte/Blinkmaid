"use client";

import { motion } from "framer-motion";
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from "react-icons/hi";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-black to-red-900 text-white py-12 mt-0">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Brand */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-red-400">Blinkmaid</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Professional home and office cleaning services you can trust.
              Experience hassle-free bookings and spotless results with our expert team.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-red-400 transition">Home</a></li>
              <li><a href="/services" className="hover:text-red-400 transition">Services</a></li>
              <li><a href="/about" className="hover:text-red-400 transition">About Us</a></li>
              <li><a href="/contact" className="hover:text-red-400 transition">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <ul className="text-sm space-y-3">
              <li className="flex items-center space-x-2">
                <HiOutlineLocationMarker size={18} className="text-red-400" />
                <span>Bengaluru, India</span>
              </li>
              <li className="flex items-center space-x-2">
                <HiOutlinePhone size={18} className="text-red-400" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2">
                <HiOutlineMail size={18} className="text-red-400" />
                <span>support@blinkmaid.com</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Follow Us</h3>
            <div className="flex space-x-4">
              {[
                { icon: <FaFacebookF size={18} />, label: "Facebook" },
                { icon: <FaInstagram size={18} />, label: "Instagram" },
                { icon: <FaTwitter size={18} />, label: "Twitter" },
                { icon: <FaLinkedin size={18} />, label: "LinkedIn" },
              ].map((social, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 bg-white/10 rounded-full hover:bg-red-600 transition"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="border-t border-gray-600 mt-10 pt-6 text-center text-sm text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <p>&copy; {new Date().getFullYear()} Blinkmaid. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
}
