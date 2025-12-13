"use client";

import { motion } from "framer-motion";
import React from "react";
import { CheckCircle, Clock, Users, CreditCard, Shield, MapPin, AlertTriangle, FileText } from "lucide-react";

// Define an interface for the term object to ensure type safety
interface Term {
  title: string;
  description: string;
  icon: React.ReactNode;
  // New optional property to highlight critical terms
  isCritical?: boolean;
}

const TermsConditions: React.FC = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  };

  const termsList: Term[] = [
    {
      title: "Service Commitment",
      description:
        "Blink Maid provides trained manpower and household/office assistance services based on the selected plan or service request.",
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
    },
    {
      title: "Working Hours",
      description:
        "Standard support hours are 24 HRS, Monday to Saturday. Any emergency support after these hours is subject to availability.",
      icon: <Clock className="w-6 h-6 text-blue-500" />,
    },
    {
      title: "Service Usage",
      description:
        "The service hired from Blink Maid is strictly for the purpose agreed at the time of booking (e.g., Cleaning, cooking, baby care, japa etc.).",
      icon: <Users className="w-6 h-6 text-purple-500" />,
    },
    {
      title: "Replacement Policy",
      description:
        "If the assigned staff member is not suitable or unavailable for a valid reason, Blink Maid will provide free replacement within 72 hours with emergency backup being provided. Additional services may involve service charges.",
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
    },
    {
      title: "Client Responsibilities",
      description:
        "The client must treat Blink Maid staff respectfully and provide a safe work environment. Any illegal, abusive, or unsafe behaviour will result in immediate termination of service.",
      icon: <Shield className="w-6 h-6 text-red-600" />, // Changed color for emphasis
      isCritical: true, // Mark as critical
    },
    {
      title: "Payment Terms",
      description:
        "Full or advance payment must be made before service commencement or as per agreed billing cycle.",
      icon: <CreditCard className="w-6 h-6 text-yellow-500" />,
    },
    {
      title: "No Refund Policy",
      description:
        "Payments made to Blink Maid are non-refundable under any circumstances. In case of dissatisfaction, Blink Maid will provide support, adjustment, or replacement as applicable — but refunds will not be issued.",
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />, // Changed color to match header
      isCritical: true, // Mark as critical
    },
    {
      title: "Confidentiality & Professional Conduct",
      description:
        "Blink Maid staff are instructed to keep all client information private. If any misconduct is observed, the client must report it immediately. Late reporting will not be considered.",
      icon: <Shield className="w-6 h-6 text-red-600" />,
    },
    {
      title: "Termination of Service",
      description:
        "Blink Maid reserves the right to terminate service anytime if the client violates terms, mistreats staff, or engages in unethical/illegal activity.",
      icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
      isCritical: true, // Mark as critical
    },
    {
      title: "Liability",
      description:
        "Blink Maid is not responsible for any personal agreements, direct hiring, or dealings made privately between client and staff outside Blink Maid records. Any such act voids service and support.",
      icon: <FileText className="w-6 h-6 text-indigo-500" />,
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-red-50 text-gray-900 w-full px-6 md:px-20 py-20 min-h-screen">
      <motion.div
        className="max-w-6xl mx-auto"
        initial="initial"
        whileInView="animate"
        variants={fadeInUp}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold text-red-700 mb-4 tracking-tight"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
          >
            Blink Maid – Terms & Conditions
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl font-bold bg-red-700 text-white px-8 py-4 rounded-lg inline-block shadow-2xl transform scale-105"
            variants={fadeInUp}
            transition={{ delay: 0.4 }}
          >
            **ATTENTION:** NO REFUND AT ALL FOR ANY CIRCUMSTANCES
          </motion.p>
        </div>

        {/* Terms List in Cards - CHANGED TO 2 COLUMNS ALWAYS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {termsList.map((term, index) => (
            <motion.div
              key={index}
              className={`p-6 rounded-2xl shadow-xl transition-all duration-300 border border-gray-200 
                ${term.isCritical 
                    ? 'bg-red-50 hover:bg-red-100 border-red-300 hover:ring-2 hover:ring-red-400' // Highlight critical terms
                    : 'bg-white hover:bg-gray-50 hover:ring-2 hover:ring-red-300' // Subtle highlight for standard terms
                }`}
              variants={fadeInUp}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 mt-1">{term.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 ml-3 leading-snug">{term.title}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-base">{term.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.div
          className="text-center mt-12 p-6 bg-white rounded-xl shadow-lg border border-red-100" // Added a container for the note
          variants={fadeInUp}
          transition={{ delay: termsList.length * 0.1 + 0.5 }}
        >
          <p className="text-gray-700 text-md font-medium">
            **Agreement:** By using Blink Maid services, you agree to these terms and conditions. For any queries, contact us at the provided address.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TermsConditions;