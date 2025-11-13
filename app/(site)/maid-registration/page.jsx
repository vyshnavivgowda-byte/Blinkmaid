"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { User, Phone, MapPin, Briefcase, DollarSign, CheckCircle, Clock, UserCheck, Star } from "lucide-react";

export default function MaidRegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    address: "",
    experience: "",
    salary: "",
    workTypes: [],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        workTypes: checked
          ? [...prev.workTypes, value]
          : prev.workTypes.filter((item) => item !== value),
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
    // Clear error on change
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required.";
    if (!formData.number.trim()) newErrors.number = "Contact number is required.";
    if (!formData.address.trim()) newErrors.address = "Address is required.";
    if (!formData.experience) newErrors.experience = "Experience is required.";
    if (!formData.salary || parseFloat(formData.salary) <= 0) newErrors.salary = "Valid salary is required.";
    if (formData.workTypes.length === 0) newErrors.workTypes = "At least one work type must be selected.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const { name, number, address, experience, salary, workTypes } = formData;

    const { error } = await supabase.from("maids").insert([
      {
        name,
        number,
        address,
        experience: parseInt(experience),
        salary: parseFloat(salary),
        work_types: workTypes,
      },
    ]);

    if (error) {
      alert("❌ Failed to register maid: " + error.message);
    } else {
      alert("✅ Maid registered successfully!");
      setFormData({
        name: "",
        number: "",
        address: "",
        experience: "",
        salary: "",
        workTypes: [],
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 w-full overflow-x-hidden">
      {/* Header Section - Similar to Pricing */}
      <section className="bg-gradient-to-r from-red-700 via-black to-red-700 text-white pt-40 pb-28 px-6 md:px-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-md">
            Become a <span className="text-red-300">Maid</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-3xl mx-auto">
            Join our trusted network of professional maids. Register today to start your rewarding career with flexible opportunities and competitive earnings.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-10">
            How <span className="text-red-600">Maid Registration</span> Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: <User className="w-10 h-10 text-red-600" />,
                title: "Fill Details",
                desc: "Provide your personal and professional information accurately.",
              },
              {
                icon: <UserCheck className="w-10 h-10 text-red-600" />,
                title: "Get Verified",
                desc: "Our team reviews and verifies your profile for quality assurance.",
              },
              {
                icon: <Star className="w-10 h-10 text-red-600" />,
                title: "Start Earning",
                desc: "Get matched with clients and begin your rewarding career.",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="p-6 bg-gradient-to-b from-white to-red-50 rounded-3xl shadow-md border border-red-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="text-5xl mb-4">{step.icon}</div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <div className="flex items-center justify-center px-4 py-10">
        <motion.div
          className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-4xl border border-gray-200"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="text-center mb-8"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
              Maid <span className="text-red-600">Registration</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our network of trusted professionals. Fill in your details to get started.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Phone Number in one row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                  <User className="w-5 h-5 mr-2 text-red-600" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                  placeholder="Enter maid's full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-red-600" />
                  Contact Number
                </label>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                  placeholder="Enter mobile number"
                />
                {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
              </motion.div>
            </div>

            {/* Address */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-red-600" />
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="3"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all duration-300 shadow-sm hover:shadow-md resize-none"
                placeholder="Enter full address"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </motion.div>

            {/* Experience and Salary in one row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-red-600" />
                  Experience (in years)
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <option value="">Select experience</option>
                  {Array.from({ length: 21 }, (_, i) => (
                    <option key={i} value={i}>{i} year{i !== 1 ? 's' : ''}</option>
                  ))}
                </select>
                {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-red-600" />
                  Expected Salary (₹)
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                  placeholder="e.g. 15000"
                />
                {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
              </motion.div>
            </div>

            {/* Work Types - Well-designed */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <label className="block text-gray-700 font-semibold mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-red-600" />
                Type of Work
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {["Cooking", "Cleaning", "Baby Care", "Elderly Care", "Washing", "Ironing"].map(
                  (work, index) => (
                    <motion.label
                      key={work}
                      className={`flex items-center justify-center space-x-2 p-4 bg-gray-50 rounded-xl hover:bg-red-50 hover:shadow-md transition-all duration-300 cursor-pointer border-2 ${
                        formData.workTypes.includes(work) ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <input
                        type="checkbox"
                        value={work}
                        checked={formData.workTypes.includes(work)}
                        onChange={handleChange}
                        className="accent-red-600 w-5 h-5"
                      />
                      <span className="text-gray-700 font-medium">{work}</span>
                    </motion.label>
                  )
                )}
              </div>
              {errors.workTypes && <p className="text-red-500 text-sm mt-2">{errors.workTypes}</p>}
            </motion.div>

            {/* Submit */}
            <motion.div
              className="pt-6 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  "Register Maid"
                )}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
