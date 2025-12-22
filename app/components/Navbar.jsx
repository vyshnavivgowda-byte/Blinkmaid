"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { Eye, EyeOff, X, Loader2, User, LogOut, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/public/header_img.png";
import { supabase } from "../../lib/supabaseClient";
import { useToast } from "@/app/components/toast/ToastContext";

const menuItems = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Maid Registration", path: "/maid-registration" },
  { label: "About Us", path: "/about" },
  { label: "Contact Us", path: "/contact" },
];

const plans = [
  {
    duration: "3 Months",
    price: "5,999",
    tagline: "Quarterly Plan",
    features: [
      "1 Free Replacement",
      "10% Monthly Salary Discount",
      "24/7 Support",
    ],
  },
  {
    duration: "6 Months",
    price: "11,999",
    tagline: "Best Value Plan",
    popular: true,
    features: [
      "1 Free Replacement",
      "10% Monthly Salary Discount",
      "24/7 Support",
    ],
  },
  {
    duration: "12 Months",
    price: "19,999",
    tagline: "Annual Plan",
    features: [
      "1 Free Replacement",
      "10% Monthly Salary Discount",
      "24/7 Support",
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSubscribePopup, setShowSubscribePopup] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [subscribers, setSubscribers] = useState([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  const modalRef = useRef(null);
  const { showToast } = useToast();
  const subscribeModalRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "", phone: "",
  });
  const isExpired = (subscriber) => {
    const subscribedAt = new Date(subscriber.subscribed_at);
    const now = new Date();
    const durationMatch = subscriber.plan_duration.match(/(\d+)\s*(Months?|Years?)/i);
    if (!durationMatch) return false; // If can't parse, assume not expired
    const value = parseInt(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    let expiryDate = new Date(subscribedAt);
    if (unit.includes('month')) {
      expiryDate.setMonth(expiryDate.getMonth() + value);
    } else if (unit.includes('year')) {
      expiryDate.setFullYear(expiryDate.getFullYear() + value);
    }
    return now > expiryDate;
  };
  const resetForm = useCallback(() => {
    setFormData({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
    setFormErrors({});
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};
    if (isRegister) {
      if (!formData.name.trim()) errors.name = "Name required";
      if (!/^\d{10}$/.test(formData.phone)) errors.phone = "10-digit phone required";
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords mismatch";
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email";
    if (formData.password.length < 6) errors.password = "Min 6 characters";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, isRegister]);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setUser(data.session.user);
        fetchSubscribers(data.session.user.id);
      }
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) fetchSubscribers(session.user.id);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  const fetchSubscribers = async (userId) => {
    setLoadingSubscribers(true);
    const { data } = await supabase.from("subscribers").select("*").eq("user_id", userId);
    setSubscribers(data || []);
    setLoadingSubscribers(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
    setLoading(false);
    if (error) showToast(error.message, "error");
    else { showToast("Welcome Back!", "success"); setModalOpen(false); resetForm(); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    // 🔍 Check email via API
    const res = await fetch("/api/check-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.email }),
    });

    const result = await res.json();

    if (result.exists) {
      setFormErrors((prev) => ({
        ...prev,
        email: "Email already exists. Please log in instead.",
      }));
      setLoading(false);
      return;
    }

    // ✅ Proceed with signup
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          phone: formData.phone,
        },
      },
    });

    if (error) {
      showToast(error.message, "error");
      setLoading(false);
      return;
    }

    showToast("Account created! Please verify your email.", "success");
    setModalOpen(false);
    setLoading(false);
    resetForm();
  };







  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    showToast("Logged out", "success");
  };

  const handlePayment = (plan) => {
    const amountInPaise = Math.round(Number(plan.price.replace(/,/g, '')) * 100);

    const options = {
      key: "rzp_test_RpvE2nM5XUTYN7",
      amount: amountInPaise, // now correct
      currency: "INR",
      name: "Blinkmaid",
      handler: async function (response) {
        const { error } = await supabase.from("subscribers").insert([{
          name: user.user_metadata?.name,
          email: user.email,
          phone: user.user_metadata?.phone,
          plan_duration: plan.duration,
          plan_price: plan.price,
          plan_benefits: JSON.stringify(plan.features),
          user_id: user.id,
          subscribed_at: new Date(),
        }]);
        if (!error) {
          showToast("Subscription Activated!", "success");
          fetchSubscribers(user.id);
          setShowSubscribePopup(false);
        }
      },
      prefill: { email: user.email },
      theme: { color: "#E63946" },
    };
    new window.Razorpay(options).open();
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md fixed top-0 left-0 w-full z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <Link href="/" className="relative group">
            <Image src={logo} alt="Logo" width={160} height={50} className="transition-transform duration-500 group-hover:scale-105" />
          </Link>

          <nav className="hidden md:flex items-center space-x-2">
            {menuItems.map(({ label, path }) => (
              <Link
                key={path}
                href={path}
                className={`px-5 py-2 text-[13px] font-black uppercase tracking-tighter transition-all relative group ${pathname === path ? "text-blinkred" : "text-blinkblack/60 hover:text-blinkblack"
                  }`}
              >
                {label}
                {pathname === path && (
                  <motion.div layoutId="underline" className="absolute bottom-0 left-5 right-5 h-0.5 bg-blinkred" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSubscribePopup(true)}
                  className="hidden md:block text-[11px] font-black uppercase tracking-[0.2em] px-6 py-3 bg-blinkred text-white rounded-full hover:bg-black transition-all shadow-xl shadow-red-500/20"
                >
                  Membership
                </button>

                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-all border border-gray-100"
                  >
                    <User size={20} className="text-blinkblack" />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-4 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 overflow-hidden z-[60]"
                      >
                        <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50 rounded-t-2xl">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logged In As</p>
                          <p className="text-xs font-bold truncate text-blinkblack">{user.user_metadata?.name || user.email}</p>
                        </div>

                        <div className="p-1 space-y-1">
                          <Link
                            href="/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-blinkred transition-all rounded-xl"
                          >
                            <User size={16} /> View My Profile
                          </Link>

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all rounded-xl"
                          >
                            <LogOut size={16} /> Secure Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="text-[12px] font-black uppercase tracking-[0.2em] px-8 py-4 bg-blinkblack text-white rounded-full hover:bg-blinkred transition-all shadow-2xl shadow-black/20"
              >
                Get Started
              </button>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-blinkblack">
              {menuOpen ? <HiX size={28} /> : <HiMenu size={28} />}
            </button>
          </div>
        </div>
      </header>

      {/* Subscription Status Banner */}
      {user && (
        <div className="fixed top-24 left-0 w-full z-40">
          <div className={`${subscribers.length > 0 && !isExpired(subscribers[0])
            ? 'bg-blinkblack'
            : subscribers.length > 0 && isExpired(subscribers[0])
              ? 'bg-red-600'
              : 'bg-blinkred'
            } text-white py-2 overflow-hidden shadow-lg`}>
            <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.3em]">
              {loadingSubscribers ? (
                <Loader2 className="animate-spin" size={14} />
              ) : subscribers.length > 0 ? (
                isExpired(subscribers[0]) ? (
                  <>
                    <X size={14} className="text-red-300" />
                    {subscribers[0].plan_duration} Plan Expired
                    <button onClick={() => setShowSubscribePopup(true)} className="underline decoration-2 underline-offset-4 ml-4">Renew Now</button>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={14} className="text-green-400" />
                    Active {subscribers[0].plan_duration} Member
                  </>
                )
              ) : (
                <>
                  Unprotected Account <ArrowRight size={14} />
                  <button onClick={() => setShowSubscribePopup(true)} className="underline decoration-2 underline-offset-4">Upgrade Now</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-center z-[100] p-4"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] w-full max-w-md p-10 relative shadow-[0_0_50px_rgba(230,57,70,0.2)]"
            >
              <button onClick={() => setModalOpen(false)} className="absolute right-8 top-8 text-gray-400 hover:text-blinkred"><X size={24} /></button>
              <div className="text-center mb-10">
                <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">
                  {isRegister ? "Join" : "Enter"} <span className="text-blinkred italic">Blink.</span>
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Premium Domestic Solutions</p>
              </div>
              <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
                {isRegister && (
                  <div className="grid grid-cols-1 gap-4">
                    <input type="text" name="name" placeholder="FULL NAME" onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blinkred font-bold text-xs uppercase" required />
                    <input type="tel" name="phone" placeholder="PHONE" onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blinkred font-bold text-xs uppercase" required />
                  </div>
                )}
                <input type="email" name="email" placeholder="EMAIL ADDRESS" onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blinkred font-bold text-xs uppercase" required />
                {formErrors.email && (
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1">
                    {formErrors.email}
                  </p>
                )}

                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="PASSWORD" onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blinkred font-bold text-xs uppercase" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-gray-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                {isRegister && (
                  <input type="password" name="confirmPassword" placeholder="CONFIRM PASSWORD" onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blinkred font-bold text-xs uppercase" required />
                )}
                <button type="submit" disabled={loading} className="w-full bg-blinkblack py-5 rounded-2xl text-white font-black uppercase tracking-[0.3em] text-[10px] hover:bg-blinkred transition-all flex items-center justify-center gap-3 shadow-xl">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : isRegister ? "Create Profile" : "Access Network"} <ArrowRight size={16} />
                </button>
              </form>
              <button onClick={() => setIsRegister(!isRegister)} className="w-full text-center mt-8 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blinkred transition-colors">
                {isRegister ? "I already have access →" : "New to the network? Request access →"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bento Subscription Modal */}
      <AnimatePresence>
        {showSubscribePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/10 backdrop-blur-2xl flex justify-center items-center z-[200] p-4"
          >
            <motion.div
              ref={subscribeModalRef}
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              whileHover={{ y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-6xl relative bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden"
            >
              <button
                onClick={() => setShowSubscribePopup(false)}
                className="absolute top-6 right-6 w-12 h-12 bg-gray-100 hover:bg-blinkred text-gray-600 hover:text-white rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl z-10"
              >
                <X size={20} />
              </button>
              {subscribers.length > 0 ? (
                <div className="text-center p-20">
                  <ShieldCheck size={64} className="text-blinkred mx-auto mb-6 animate-pulse" />
                  <h2 className="text-4xl font-black text-black uppercase tracking-tighter mb-4">Already Subscribed</h2>
                  <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">You have an active {subscribers[0].plan_duration} plan.</p>
                  <button
                    onClick={() => setShowSubscribePopup(false)}
                    className="mt-8 px-8 py-4 bg-blinkred text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-lg hover:shadow-xl"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-12 p-8">
                    <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                      SELECT YOUR <span className="text-blinkred italic">TIER.</span>
                    </h2>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-[10px] mt-4">Professional Maintenance Plans</p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6 p-8">
                    {plans.map((plan, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05, y: -10 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={`relative p-10 rounded-[3rem] transition-all duration-500 border-2 shadow-lg hover:shadow-2xl ${plan.popular
                          ? 'bg-gradient-to-br from-white to-gray-50 border-blinkred scale-105 z-10'
                          : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 hover:border-blinkred'
                          }`}
                      >
                        {plan.popular && (
                          <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blinkred text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg">
                            Recommended
                          </span>
                        )}
                        <h3 className={`text-3xl font-black uppercase tracking-tighter ${plan.popular ? 'text-black' : 'text-gray-800'}`}>
                          {plan.duration}
                        </h3>
                        <p className="text-blinkred font-black text-[10px] uppercase tracking-widest mt-2">{plan.tagline}</p>
                        <div className="my-10">
                          <span className={`text-6xl font-black tracking-tighter ${plan.popular ? 'text-black' : 'text-gray-800'}`}>
                            ₹{plan.price.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <ul className="space-y-4 mb-10">
                          {plan.features.map((f, i) => (
                            <li key={i} className={`flex items-center gap-3 text-xs font-bold ${plan.popular ? 'text-gray-600' : 'text-gray-500'}`}>
                              <CheckCircle size={16} className="text-blinkred" /> {f}
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => handlePayment(plan)}
                          className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-md hover:shadow-lg ${plan.popular
                            ? 'bg-blinkred text-white hover:bg-black'
                            : 'bg-white text-black hover:bg-blinkred hover:text-white border border-gray-300'
                            }`}
                        >
                          Initialize Membership
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}