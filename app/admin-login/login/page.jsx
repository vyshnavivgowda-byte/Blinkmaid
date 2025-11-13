"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

    const adminEmail = "support@blinkmaid.com";
    const adminPassword = "support@blinkmaid.com";

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
        {/* Glow circle in background */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-400/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-pink-300/30 rounded-full blur-3xl"></div>

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <motion.div
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-red-500 w-16 h-16 mx-auto rounded-full flex items-center justify-center shadow-lg"
          >
            <Lock size={28} className="text-white" />
          </motion.div>
          <h2 className="mt-5 text-3xl font-bold text-gray-900 tracking-wide">
            Admin Login
          </h2>
          <p className="text-gray-600 mt-1 text-sm font-medium">
            BlinkMaid Control Panel
          </p>
        </div>

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-center mb-4 font-semibold bg-red-50 py-2 rounded-lg border border-red-200"
          >
            {error}
          </motion.p>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div className="relative">
            <User
              className="absolute left-3 top-3 text-gray-500"
              size={20}
            />
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/80 text-black border border-gray-300 rounded-xl pl-10 py-3 focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none placeholder-gray-600"
              required
            />
          </div>

          <div className="relative">
            <Lock
              className="absolute left-3 top-3 text-gray-500"
              size={20}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/80 text-black border border-gray-300 rounded-xl pl-10 py-3 focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none placeholder-gray-600"
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

        <p className="text-center text-gray-600 text-sm mt-6 relative z-10">
          © {new Date().getFullYear()} <span className="font-semibold">BlinkMaid</span>. All Rights Reserved.
        </p>
      </motion.div>
    </div>
  );
}
