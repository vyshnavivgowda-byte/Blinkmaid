"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { 
  User, MapPin, Briefcase, 
  DollarSign, CheckCircle, Star, ArrowRight, ShieldCheck, Zap 
} from "lucide-react";
import toast from "react-hot-toast";

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
    const { error } = await supabase.from("maids").insert([{ 
        ...formData, 
        experience: parseInt(formData.experience), 
        salary: parseFloat(formData.salary),
        work_types: formData.workTypes 
    }]);

    if (error) toast.error("Registration failed.");
    else {
      toast.success("Profile submitted for review.");
      setFormData({ name: "", number: "", address: { house: "", street: "", area: "", landmark: "", city: "", pincode: "" }, experience: "", salary: "", workTypes: [] });
    }
    setLoading(false);
  };

  const workOptions = ["Cooking", "Cleaning", "Baby Care", "Elderly Care", "Washing", "Ironing"];

  return (
    <div className="bg-white text-blinkblack min-h-screen selection:bg-blinkred selection:text-white">
      
      {/* ---------------- SECTION 1: CINEMATIC IMAGE HEADER ---------------- */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        {/* The Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1584622781564-1d9876a13d00?q=80&w=2070&auto=format&fit=crop" 
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
      <section className="py-24 px-6 max-w-7xl mx-auto -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "PREMIUM EARNINGS", value: "25% Higher", desc: "Our partners earn significantly more than market average." },
            { title: "SECURE IDENTITY", value: "Fully Vetted", desc: "Every professional undergoes a gold-standard background check." },
            { title: "RAPID DEPLOYMENT", value: "48 Hours", desc: "Get matched with high-profile clients within two business days." },
          ].map((card, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 group hover:border-blinkred transition-all"
            >
              <h3 className="text-[10px] font-black tracking-[0.2em] text-gray-400 mb-4">{card.title}</h3>
              <p className="text-3xl font-black mb-2">{card.value}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
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
            <form onSubmit={handleSubmit} className="space-y-16">
                {/* Identification */}
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Note: Ensure your InputField component uses the "text-black" class for its label */}
                    <InputField label="Professional Name" name="name" value={formData.name} onChange={handleChange} placeholder="As per Govt ID" error={errors.name} labelClass="text-black" />
                    <InputField label="WhatsApp Contact" name="number" value={formData.number} onChange={handleChange} placeholder="+91" error={errors.number} labelClass="text-black" />
                </div>

                {/* Geography */}
                <div className="space-y-8">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-black flex items-center gap-3">
                        <MapPin size={12} className="text-blinkred" /> Work Location Context
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {["house", "street", "area", "landmark", "city", "pincode"].map(field => (
                            <div key={field} className="relative group space-y-2">
                                {/* Added dark sub-labels for address fields */}
                                <label className="text-[9px] font-black text-black/80 uppercase tracking-widest ml-1">{field}</label>
                                <input 
                                    name={field} placeholder={field.toUpperCase()} 
                                    value={formData.address[field]} onChange={handleAddressChange} 
                                    className="w-full bg-gray-50 border-b-2 border-gray-200 py-4 px-2 outline-none focus:border-blinkred transition-all font-bold text-xs tracking-wider text-black"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Expertise */}
                <div className="grid md:grid-cols-2 gap-12 pt-10 border-t border-gray-100">
                    <div className="space-y-4">
                        {/* Changed text-gray-400 to text-black */}
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Experience Tier</label>
                        <div className="relative">
                            <select 
                                name="experience" value={formData.experience} onChange={handleChange}
                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 focus:ring-2 focus:ring-blinkred font-bold appearance-none text-sm text-black"
                            >
                                <option value="">Select Level</option>
                                {[1,2,3,5,10].map(y => <option key={y} value={y}>{y}+ Years Experience</option>)}
                            </select>
                        </div>
                    </div>
                    <InputField label="Expected Salary (₹/mo)" name="salary" type="number" value={formData.salary} onChange={handleChange} placeholder="Target earnings" labelClass="text-black" />
                </div>

                {/* Specialization Selection */}
                <div className="space-y-8">
                    {/* Changed text-gray-400 to text-black */}
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black text-center block">Core Specializations</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {workOptions.map(work => (
                            <button
                                key={work} type="button"
                                onClick={() => {
                                    const checked = !formData.workTypes.includes(work);
                                    handleChange({ target: { name: 'workTypes', value: work, type: 'checkbox', checked } });
                                }}
                                className={`py-6 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${formData.workTypes.includes(work) ? 'bg-blinkred border-blinkred text-white' : 'bg-white border-gray-200 text-black hover:border-blinkred'}`}
                            >
                                {work}
                            </button>
                        ))}
                    </div>
                </div>

                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading}
                    className="w-full bg-black py-8 rounded-[2.5rem] text-white font-black uppercase tracking-[0.5em] text-xs hover:bg-blinkred transition-all shadow-2xl flex items-center justify-center gap-4"
                >
                    {loading ? "Processing Profile..." : "Submit to Network"} <ArrowRight size={18} />
                </motion.button>
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