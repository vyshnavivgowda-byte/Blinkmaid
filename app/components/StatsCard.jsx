"use client";
import { motion } from "framer-motion";

export default function StatsCard({ icon: Icon, title, value, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-br ${gradient} rounded-xl p-6 flex items-center gap-4 shadow-lg border border-gray-800`}
    >
      <div className="p-4 bg-black/40 rounded-full">
        <Icon size={32} className="text-red-500" />
      </div>
      <div>
        <h3 className="text-gray-300 text-sm uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
    </motion.div>
  );
}
