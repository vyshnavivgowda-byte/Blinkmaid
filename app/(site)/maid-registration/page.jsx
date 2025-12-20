"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";


import {
  User,
  MapPin,
  Briefcase,
  IndianRupee,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Loader2
} from "lucide-react";


export default function MaidRegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    address: { house: "", street: "", area: "", landmark: "", city: "", pincode: "" },
    experience: "",
    salary: "",
    workTypes: [],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [photoBase64, setPhotoBase64] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Add this near your other useState hooks
  const [activeStep, setActiveStep] = useState(0);

  // Logic to determine active step based on form progress
  const getActiveStep = () => {
    if (formData.workTypes.length > 0) return 3; // Specialization done
    if (formData.experience && formData.salary) return 2; // Expertise done
    if (Object.values(formData.address).some(val => val !== "")) return 1; // Geography started
    return 0; // Identity/Start
  };


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({
        ...prev,
        workTypes: checked
          ? [...prev.workTypes, value]
          : prev.workTypes.filter(item => item !== value),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional size guard (recommended)
    if (file.size > 2 * 1024 * 1024) {
      alert("Photo must be under 2MB");
      return;
    }



    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result); // base64 string
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  const handleRemovePhoto = () => {
    setPhotoBase64(null);
    setPhotoPreview(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name required.";
    if (!/^[6-9]\d{9}$/.test(formData.number.trim())) newErrors.number = "Invalid contact.";
    if (formData.workTypes.length === 0) newErrors.workTypes = "Select services.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const phone = formData.number.replace(/\D/g, "").slice(-10);

    const { error } = await supabase.from("maids").insert([
      {
        name: formData.name,
        number: phone,
        address: formData.address,      // jsonb
        experience: Number(formData.experience),
        salary: Number(formData.salary),
        work_types: formData.workTypes,
        photo_base64: photoBase64  // text[]
      }
    ]);

    if (error) {
      console.error(error);
      toast.error(error.message);
    } else {
      toast.success("Profile submitted for review.");
      setPhotoBase64(null);
      setPhotoPreview(null);

      setFormData({
        name: "",
        number: "",
        address: { house: "", street: "", area: "", landmark: "", city: "", pincode: "" },
        experience: "",
        salary: "",
        workTypes: [],
      });
    }

    setLoading(false);
  };

  // Update activeStep whenever formData changes
  useEffect(() => {
    setActiveStep(getActiveStep());
  }, [formData]);

  const workOptions = ["Cooking", "Cleaning", "Baby Care", "Elderly Care", "Washing", "Ironing"];

  return (
    <div className="bg-white text-blinkblack min-h-screen selection:bg-blinkred selection:text-white">

      {/* ---------------- SECTION 1: CINEMATIC IMAGE HEADER ---------------- */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        {/* The Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://as1.ftcdn.net/v2/jpg/07/89/20/88/1000_F_789208828_dbryx91mavLaoIHAKncu6FChHkfnMbmM.jpg"
            alt="Elite Service"
            className="w-full h-full object-cover scale-105"
          />
          {/* Gradients to blend the image into the content */}
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20" />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-[2px] bg-blinkred"></span>
              <span className="text-xs font-black uppercase tracking-[0.4em] text-white">Join the Elite</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight uppercase tracking-tighter mb-6">
              EXCELLENCE <br /> IS A <span className="text-blinkred italic">STANDARD.</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-xl font-medium mb-10">
              Your professional journey deserves a premium platform. Apply today to serve our exclusive network of homes.
            </p>
            <motion.a
              href="#portal"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-white text-blinkblack px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blinkred hover:text-white transition-all shadow-2xl"
            >
              Start Application <ArrowRight size={16} />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* ---------------- SECTION 2: BENTO STATS / INFO ---------------- */}
      <section className="py-32 px-6 max-w-7xl mx-auto mt-20 relative z-20 mt-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              tag: "EARNINGS",
              title: "Premium Earnings",
              value: "25% Higher",
              desc: "Our partners earn significantly more than the market average.",
              icon: IndianRupee,
            },
            {
              tag: "SECURITY",
              title: "Secure Identity",
              value: "Fully Vetted",
              desc: "Every professional undergoes a gold-standard background verification.",
              icon: ShieldCheck,
            },
            {
              tag: "SPEED",
              title: "Rapid Deployment",
              value: "48 Hours",
              desc: "Get matched with high-profile clients within two business days.",
              icon: Zap,
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="group relative p-10 rounded-[2.5rem] bg-white
                   border border-gray-100 hover:border-blinkred/20
                   transition-all duration-500 overflow-hidden
                   shadow-sm hover:shadow-xl"
            >
              {/* CONTENT */}
              <div className="relative z-10">
                {/* TAG */}
                <span className="text-[10px] font-semibold text-red-600 uppercase tracking-[0.3em] mb-6 block opacity-90">
                  {card.tag}
                </span>

                {/* ICON */}
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6
                          group-hover:bg-blinkred transition-colors duration-500">
                  <card.icon className="w-6 h-6 text-blinkblack group-hover:text-white transition-colors duration-500" />
                </div>

                {/* TITLE */}
                <h3 className="text-xl font-black uppercase tracking-tight mb-1">
                  {card.title}
                </h3>

                {/* VALUE */}
                <p className="text-2xl font-black text-slate-900 mb-3">
                  {card.value}
                </p>

                {/* DESCRIPTION */}
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {card.desc}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest
                          text-slate-400 group-hover:text-blinkred
                          transition-colors cursor-pointer">
                  Learn More <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* HOVER BLOOM */}
              <div
                className="absolute -right-6 -bottom-6 w-24 h-24 bg-gray-50 rounded-full
                     group-hover:scale-[6]
                     transition-transform duration-700 z-0"
              />
            </motion.div>
          ))}
        </div>
      </section>


      {/* ---------------- SECTION 3: THE FORM PORTAL ---------------- */}
      <section id="portal" className="py-24 px-6 bg-gray-50/50 font-sans">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none text-black">
              REGISTRATION <span className="text-blinkred italic">PORTAL.</span>
            </h2>
            <p className="text-zinc-900 font-black uppercase tracking-[0.2em] text-xs mt-4 opacity-90">
              Professional Application Phase 1
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="bg-white rounded-[4rem] p-8 md:p-20 shadow-2xl border border-gray-200"
          >
            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 md:px-0 relative grid lg:grid-cols-12 gap-16">

              {/* --- Left Column: Dynamic Navigation Progress --- */}
              <div className="hidden lg:block lg:col-span-3">
                <div className="sticky top-24 space-y-10">
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter uppercase leading-tight text-black">
                      Professional <br /> <span className="text-blinkred italic">Onboarding</span>
                    </h3>
                    <p className="text-xs text-zinc-900 font-black uppercase tracking-widest mt-2 opacity-70">
                      Status: {activeStep === 3 ? "Ready to Submit" : "Phase In-Progress"}
                    </p>
                  </div>

                  <div className="space-y-6 border-l-2 border-gray-200 ml-2">
                    {[
                      { label: "Identity", id: 0 },
                      { label: "Geography", id: 1 },
                      { label: "Expertise", id: 2 },
                      { label: "Specialization", id: 3 }
                    ].map((step) => {
                      const isCompleted = activeStep > step.id;
                      const isActive = activeStep === step.id;

                      return (
                        <div key={step.id} className="flex items-center gap-4 -ml-[9px] transition-all duration-500">
                          <motion.div
                            animate={{
                              scale: isActive ? 1.2 : 1,
                              backgroundColor: isCompleted || isActive ? "#EE2A35" : "#FFFFFF"
                            }}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isCompleted || isActive ? 'border-blinkred' : 'border-gray-300'
                              }`}
                          >
                            {isCompleted && <CheckCircle size={12} className="text-white" />}
                          </motion.div>
                          <span className={`text-xs font-black uppercase tracking-widest transition-colors duration-500 ${isActive ? 'text-black translate-x-1' : isCompleted ? 'text-zinc-900' : 'text-zinc-400'
                            }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* --- Right Column: Form Sections --- */}
              <div className="lg:col-span-9 space-y-20">

                {/* ================= IDENTIFICATION ================= */}
                <motion.div className="relative group">
                  <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-200">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-3 bg-black text-white rounded-xl">
                        <User size={20} />
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-[0.4em] text-black">
                        Personal Identity
                      </h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                      <InputField
                        label="Full Legal Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="As per Government ID"
                        error={errors.name}
                        labelClass="text-zinc-900 font-black uppercase tracking-widest text-xs mb-3 block"
                        className="text-base font-bold text-black border-zinc-300"
                      />
                      <InputField
                        label="WhatsApp Contact"
                        name="number"
                        value={formData.number}
                        onChange={handleChange}
                        placeholder="+91"
                        error={errors.number}
                        labelClass="text-zinc-900 font-black uppercase tracking-widest text-xs mb-3 block"
                        className="text-base font-bold text-black border-zinc-300"
                      />
                      <div className="md:col-span-2">
                        <label className="text-zinc-900 font-black uppercase tracking-widest text-xs mb-3 block">
                          Profile Photograph
                        </label>

                        <div className="flex items-center gap-6">
                          {photoPreview ? (
                            <div className="relative">
                              <img
                                src={photoPreview}
                                alt="Preview"
                                className="w-28 h-28 rounded-2xl object-cover border border-zinc-300"
                              />

                              {/* REMOVE IMAGE */}
                              <button
                                type="button"
                                onClick={handleRemovePhoto}
                                className="absolute -top-3 -right-3 w-8 h-8 rounded-full
                   bg-black text-white font-black flex items-center justify-center
                   hover:bg-blinkred transition"
                                aria-label="Remove photo"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="w-28 h-28 rounded-2xl bg-zinc-100 flex items-center justify-center
                    text-xs font-black text-zinc-400 uppercase">
                              No Photo
                            </div>
                          )}

                          <label className="cursor-pointer bg-black text-white px-6 py-4 rounded-xl
                    font-black uppercase text-xs tracking-widest
                    hover:bg-blinkred transition">
                            {photoPreview ? "Change Photo" : "Upload Photo"}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoChange}
                              className="hidden"
                            />
                          </label>
                        </div>

                      </div>

                    </div>
                  </div>
                </motion.div>

                {/* ================= LOCATION ================= */}
                <motion.div className="bg-zinc-50 rounded-[3rem] p-8 md:p-12 border border-zinc-200">
                  <div className="flex items-center gap-4 mb-12">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-zinc-200">
                      <MapPin size={20} className="text-blinkred" />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-[0.35em] text-black">
                      Primary Residency
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10">
                    {["house", "street", "area", "landmark", "city", "pincode"].map((field) => (
                      <div key={field} className="relative group">
                        <label className="text-[11px] font-black uppercase tracking-widest text-zinc-900 group-focus-within:text-blinkred transition-colors ml-1 mb-1 block">
                          {field}
                        </label>
                        <input
                          name={field}
                          value={formData.address[field]}
                          onChange={handleAddressChange}
                          placeholder={field.toUpperCase()}
                          className="w-full bg-transparent border-b-2 border-zinc-300 py-3 px-1 text-base font-bold text-black
                                     focus:border-blinkred outline-none transition-all placeholder:text-zinc-300"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* ================= EXPERIENCE & SALARY ================= */}
                <motion.div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-zinc-200">
                    <label className="text-xs font-black uppercase tracking-[0.35em] text-zinc-900 mb-6 block">
                      Expertise Level
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-black" size={20} />
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="w-full bg-zinc-50 rounded-2xl pl-16 pr-6 py-6 text-base font-bold text-black
                                   focus:ring-2 focus:ring-blinkred outline-none appearance-none border border-zinc-200"
                      >
                        <option value="">Select Tier</option>
                        {[1, 2, 3, 5, 10].map((y) => (
                          <option key={y} value={y}>{y}+ Years Experience</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-zinc-200">
                    <InputField
                      label="Expected Salary (₹ / Mo)"
                      name="salary"
                      type="number"
                      value={formData.salary}
                      onChange={handleChange}
                      placeholder="0.00"
                      labelClass="text-zinc-900 font-black uppercase tracking-widest text-xs mb-4 block"
                    />
                  </div>
                </motion.div>
                {/* ================= SPECIALIZATION ================= */}
                <motion.div className="bg-white rounded-[3rem] p-10 shadow-xl border border-zinc-200">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                      <CheckCircle size={20} className="text-white" />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-[0.35em] text-black">
                      Service Specialization
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {workOptions.map((option) => (
                      <label
                        key={option}
                        className={`cursor-pointer rounded-2xl border-2 px-6 py-5 text-center
        font-black uppercase tracking-widest text-xs transition-all
        ${formData.workTypes.includes(option)
                            ? "border-blinkred bg-blinkred text-white"
                            : "border-zinc-200 bg-white text-black hover:border-blinkred"
                          }`}
                      >
                        <input
                          type="checkbox"
                          value={option}
                          checked={formData.workTypes.includes(option)}
                          onChange={handleChange}
                          className="hidden"
                        />
                        {option}
                      </label>
                    ))}
                  </div>

                  {errors.workTypes && (
                    <p className="text-blinkred text-[10px] font-black uppercase tracking-widest mt-6">
                      {errors.workTypes}
                    </p>
                  )}
                </motion.div>


                {/* ================= SUBMIT ================= */}
                <div className="pt-10">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black py-9 rounded-full
                               text-white font-black uppercase tracking-[0.6em] text-xs
                               hover:bg-blinkred transition-all duration-700 shadow-2xl
                               flex items-center justify-center gap-6"
                  >
                    {loading ? "Verifying..." : "Finalize Submission"}
                    <ArrowRight size={22} />
                  </motion.button>
                  <p className="text-center text-[11px] text-zinc-900 font-black uppercase tracking-widest mt-8">
                    By submitting, you agree to our <span className="text-black underline decoration-blinkred decoration-2">Professional Code of Conduct</span>
                  </p>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

const InputField = ({ label, error, labelClass = "text-gray-400", ...props }) => (
  <div className="space-y-4">
    {/* labelClass is used here, and won't be passed to the input below */}
    <label className={`text-[10px] font-black uppercase tracking-[0.3em] ${labelClass}`}>
      {label}
    </label>
    <input
      {...props}
      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 focus:ring-2 focus:ring-blinkred outline-none font-bold placeholder:text-gray-200 text-sm transition-all text-black"
    />
    {error && <p className="text-blinkred text-[10px] font-black uppercase tracking-widest">{error}</p>}
  </div>
);