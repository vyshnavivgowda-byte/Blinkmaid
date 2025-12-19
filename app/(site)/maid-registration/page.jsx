"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

import { 
  User,
  MapPin,
  Briefcase,
  DollarSign,
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
      work_types: formData.workTypes  // text[]
    }
  ]);

  if (error) {
    console.error(error);
    toast.error(error.message);
  } else {
    toast.success("Profile submitted for review.");
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
        icon: DollarSign,
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
  <section id="portal" className="py-24 px-6 bg-gray-50/50">
    <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                REGISTRATION <span className="text-blinkred italic">PORTAL.</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-4">Professional Application Phase 1</p>
        </div>

        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="bg-white rounded-[4rem] p-8 md:p-20 shadow-2xl border border-gray-100"
        >
          <form
  onSubmit={handleSubmit}
  className="max-w-6xl mx-auto px-4 md:px-0 relative grid lg:grid-cols-12 gap-16"
>
  {/* --- Left Column: Navigation Progress (Sticky) --- */}
 {/* --- Left Column: Dynamic Navigation Progress --- */}
<div className="hidden lg:block lg:col-span-3">
  <div className="sticky top-24 space-y-10">
    <div>
      <h3 className="text-2xl font-black tracking-tighter uppercase leading-tight">
        Professional <br /> <span className="text-blinkred italic">Onboarding</span>
      </h3>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
        Status: {activeStep === 3 ? "Ready to Submit" : "Phase In-Progress"}
      </p>
    </div>
    
    <div className="space-y-6 border-l-2 border-gray-100 ml-2">
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
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                isCompleted || isActive ? 'border-blinkred' : 'border-gray-200'
              }`}
            >
              {isCompleted && <CheckCircle size={10} className="text-white" />}
            </motion.div>
            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${
              isActive ? 'text-blinkblack translate-x-1' : isCompleted ? 'text-gray-500' : 'text-gray-300'
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative group"
    >
      <div className="absolute -left-4 top-0 w-1 h-full bg-blinkred rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-50">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-black text-white rounded-xl shadow-lg">
            <User size={20} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-blinkblack">
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
            className="premium-input"
          />
          <InputField
            label="WhatsApp Contact"
            name="number"
            value={formData.number}
            onChange={handleChange}
            placeholder="+91"
            error={errors.number}
          />
        </div>
      </div>
    </motion.div>

    {/* ================= LOCATION ================= */}
    <motion.div 
       initial={{ opacity: 0, y: 20 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true }}
       className="bg-gray-50/50 rounded-[3rem] p-8 md:p-12 border border-gray-100/50"
    >
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-100">
          <MapPin size={18} className="text-blinkred" />
        </div>
        <h4 className="text-xs font-black uppercase tracking-[0.35em] text-blinkblack">
          Primary Residency
        </h4>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10">
        {["house", "street", "area", "landmark", "city", "pincode"].map((field) => (
          <div key={field} className="relative group">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-focus-within:text-blinkred transition-colors ml-1">
              {field}
            </label>
            <input
              name={field}
              value={formData.address[field]}
              onChange={handleAddressChange}
              placeholder={field.toUpperCase()}
              className="w-full bg-transparent border-b-2 border-gray-200 py-3 px-1 text-sm font-bold text-blinkblack
                         focus:border-blinkred outline-none transition-all placeholder:text-gray-200"
            />
          </div>
        ))}
      </div>
    </motion.div>

    {/* ================= EXPERIENCE & SALARY ================= */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="grid md:grid-cols-2 gap-8"
    >
      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-50 flex flex-col justify-between">
        <label className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400 mb-6 block">
          Expertise Level
        </label>
        <div className="relative">
          <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <select
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            className="w-full bg-gray-50 rounded-2xl pl-16 pr-6 py-6 text-sm font-black text-blinkblack
                       focus:ring-2 focus:ring-blinkred outline-none appearance-none cursor-pointer transition-all"
          >
            <option value="">Select Tier</option>
            {[1, 2, 3, 5, 10].map((y) => (
              <option key={y} value={y}>{y}+ Years Experience</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-50">
        <InputField
          label="Expected Salary (₹ / Mo)"
          name="salary"
          type="number"
          value={formData.salary}
          onChange={handleChange}
          placeholder="0.00"
          labelClass="text-gray-400"
        />
      </div>
    </motion.div>

    {/* ================= SKILLS ================= */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-black text-white rounded-[3rem] p-10 md:p-16 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-blinkred/10 blur-[120px] rounded-full" />
      
      <div className="relative z-10">
        <div className="mb-12">
          <h4 className="text-xl font-black uppercase tracking-widest mb-2">Capabilities</h4>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Select your specialized domains</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {workOptions.map((work) => {
            const active = formData.workTypes.includes(work);
            return (
              <button
                key={work}
                type="button"
                onClick={() =>
                  handleChange({
                    target: { name: "workTypes", value: work, type: "checkbox", checked: !active },
                  })
                }
                className={`group relative py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]
                            transition-all duration-500 overflow-hidden border
                            ${active 
                              ? "bg-blinkred border-blinkred text-white shadow-[0_15px_30px_rgba(238,42,53,0.3)]" 
                              : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                            }`}
              >
                <span className="relative z-10">{work}</span>
                {active && (
                   <motion.div layoutId="skill-bg" className="absolute inset-0 bg-gradient-to-tr from-blinkred to-red-400 -z-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>

    {/* ================= SUBMIT ================= */}
    <div className="pt-10">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="w-full bg-blinkblack py-9 rounded-full
                   text-white font-black uppercase tracking-[0.6em] text-[11px]
                   hover:bg-blinkred transition-all duration-700 shadow-[0_30px_60px_rgba(0,0,0,0.1)]
                   flex items-center justify-center gap-6
                   disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-3"><Loader2 className="animate-spin" /> Verifying...</span>
        ) : (
          <>
            Finalize Submission
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </>
        )}
      </motion.button>
      <p className="text-center text-[9px] text-gray-400 font-black uppercase tracking-widest mt-8">
        By submitting, you agree to our <span className="text-blinkblack underline underline-offset-4">Professional Code of Conduct</span>
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