"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, User } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const adminEmail = "admin@blinkmaid.com";
    const adminPassword = "BlinkMaid@2025";


    if (email === adminEmail && password === adminPassword) {
      localStorage.setItem("isAdminLoggedIn", "true");
      router.push("/admin/dashboard");
    } else {
      setError("❌ Invalid admin credentials. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-200 via-white to-red-300 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-white/30 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-10 w-full max-w-md"
      >
        {/* Glow Effects */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-400/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-pink-300/30 rounded-full blur-3xl"></div>

        {/* Header with Logo */}
        <div className="text-center mb-8 relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-4"
          >
            <Image
              src="/logosite.png"
              alt="BlinkMaid Logo"
              width={190}
              height={190}
              className="rounded-2xl shadow-xl"
              priority
            />

          </motion.div>

          <h2 className="text-3xl font-bold text-gray-900 tracking-wide">
            Admin Login
          </h2>
          <p className="text-gray-600 mt-1 text-sm font-medium">
            BlinkMaid Control Panel
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-center mb-4 font-semibold bg-red-50 py-2 rounded-lg border border-red-200"
          >
            {error}
          </motion.p>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/80 text-black border border-gray-300 rounded-xl pl-10 py-3 focus:ring-2 focus:ring-red-400 outline-none"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/80 text-black border border-gray-300 rounded-xl pl-10 py-3 focus:ring-2 focus:ring-red-400 outline-none"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>

        {/* Admin Credentials Display */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 relative z-10">
          <p className="font-semibold text-gray-900 mb-1">
            Admin Credentials
          </p>
          <p>
            <span className="font-medium">Email:</span>{" "}
            admin@blinkmaid.com          </p>
          <p>
            <span className="font-medium">Password:</span>{" "}
            BlinkMaid@2025
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6 relative z-10">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold">BlinkMaid</span>. All Rights Reserved.
        </p>
      </motion.div>
    </div>
  );
}
