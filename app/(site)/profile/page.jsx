"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Home, Edit, Save, X, Bell,
  Calendar, CreditCard, CheckCircle, XCircle, RefreshCw,
  ShieldCheck, ArrowRight, Star
} from "lucide-react";

// Constants
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_RpvE2nM5XUTYN7";

const useRazorpayScript = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);
};

export default function ProfilePage() {
  useRazorpayScript();

  // State Management
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  
  // Modal & Payment States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newMaid, setNewMaid] = useState("");
  const [changeReason, setChangeReason] = useState("");
  const [updatingMaid, setUpdatingMaid] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const fetchBookings = useCallback(async (userId) => {
    setLoadingBookings(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) setBookings(data);
    setLoadingBookings(false);
  }, []);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("Please log in to view your profile.");
      setLoading(false);
      return;
    }

    const profileData = {
      id: user.id,
      name: user.user_metadata?.name || "Not Provided",
      phone: user.user_metadata?.phone || "Not Provided",
      address: user.user_metadata?.address || "Not Provided",
      location: user.user_metadata?.location || "Not Provided",
      email: user.email,
      avatar: user.user_metadata?.avatar_url || null,
      subscription: null,
    };

    const { data: subscriptions } = await supabase
      .from("subscribers")
      .select("*")
      .eq("email", profileData.email)
      .order("subscribed_at", { ascending: false });

    if (subscriptions?.length > 0) profileData.subscription = subscriptions[0];

    setUserData(profileData);
    setEditData(profileData);
    fetchBookings(user.id);
    setLoading(false);
  }, [fetchBookings]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        name: editData.name,
        phone: editData.phone,
        address: editData.address,
        location: editData.location,
      },
    });

    if (!error) {
      await fetchProfile();
      setIsEditing(false);
    } else {
      alert("Update failed. Please try again.");
    }
    setSaving(false);
  };

  const handleRazorpaySubscription = async (plan) => {
    if (paymentProcessing) return;
    setPaymentProcessing(true);

    try {
      const response = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.price,
          currency: "INR",
          plan_duration: plan.duration,
          user_email: userData.email,
        }),
      });

      const orderData = await response.json();
      
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "HomeService Premium",
        description: `${plan.duration} Plan`,
        order_id: orderData.id,
        handler: async (res) => {
          // 1. Verify payment via your API
          const verify = await fetch(`/api/verify-razorpay-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...res, user_email: userData.email, plan_duration: plan.duration, plan_price: plan.price }),
          });

          if (verify.ok) {
            // 2. Save to your public.subscribers table
            const { error: insertError } = await supabase
              .from("subscribers")
              .insert([{
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                subscribed_at: new Date().toISOString(),
                plan_duration: plan.duration,
                plan_price: plan.price,
                plan_benefits: "1 Free Replacement, 10% Discount, Priority Support",
                user_id: userData.id // Links to auth.users
              }]);

            if (insertError) {
              console.error("Error saving subscription:", insertError);
              alert("Payment successful, but failed to update profile. Please contact support.");
            } else {
              alert("Subscribed Successfully!");
              fetchProfile(); // Refresh UI to show "Gold Member" status
            }
          }
        },
        prefill: { name: userData.name, email: userData.email, contact: userData.phone },
        theme: { color: "#E11D48" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment initialization failed.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 pb-20 font-sans">
      {/* Hero Header */}
     {/* --- WELL-DESIGNED HEADER START --- */}
<div className="relative pb-32 overflow-hidden bg-slate-950">
  {/* Animated Background Gradients */}
  <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-rose-600/20 blur-[120px] rounded-full" />
    <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
  </div>

  <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
    <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
      
      {/* User Info Section */}
      <div className="flex flex-col md:flex-row items-center md:items-center gap-6 text-center md:text-left">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          {/* Avatar with Ring */}
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-rose-500 to-rose-400 p-1 shadow-2xl">
            <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-4xl font-bold text-white overflow-hidden border-4 border-slate-950">
              {userData?.avatar ? (
                <img src={userData.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                userData?.name?.charAt(0)
              )}
            </div>
          </div>
          {/* Verified Badge */}
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl border-4 border-slate-950 shadow-lg">
            <ShieldCheck size={20} />
          </div>
        </motion.div>

        <div>
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {userData?.name}
            </h1>
            {userData.subscription && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-xs font-bold uppercase tracking-widest">
                <Star size={12} fill="currentColor" /> Gold Member
              </span>
            )}
          </motion.div>
          <p className="text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
            <Mail size={16} className="text-rose-500" /> {userData.email}
          </p>
        </div>
      </div>

      {/* Quick Stats / Action */}
      <motion.div 
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="hidden lg:flex gap-4"
      >
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl min-w-[140px]">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Bookings</p>
          <p className="text-white text-2xl font-black">{bookings.length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl min-w-[140px]">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Account Status</p>
          <p className="text-emerald-400 text-2xl font-black">Active</p>
        </div>
      </motion.div>

    </div>
  </div>

  {/* Decorative Wave Bottom */}
  <div className="absolute bottom-0 left-0 w-full leading-[0] overflow-hidden">
    <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.23,115,123.67,105.74,182.88,88.74,242.09,71.74,271.86,67.23,321.39,56.44Z" className="fill-[#FDFDFD]"></path>
    </svg>
  </div>
</div>
{/* --- WELL-DESIGNED HEADER END --- */}

      {/* Navigation Tabs */}
      <div className="max-w-4xl mx-auto -mt-8 px-6">
        <nav className="flex p-1.5 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl">
          {["Profile", "My Bookings", "Subscriptions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {tab === "Profile" && <User size={18} />}
              {tab === "My Bookings" && <Calendar size={18} />}
              {tab === "Subscriptions" && <Bell size={18} />}
              <span className="hidden sm:inline">{tab}</span>
            </button>
          ))}
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "Profile" && renderProfileTab()}
            {activeTab === "My Bookings" && renderBookingsTab()}
            {activeTab === "Subscriptions" && renderSubscriptionsTab()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Maid Change Modal */}
      {isModalOpen && <MaidModal />}
    </div>
  );

  // --- SUB-COMPONENTS ---

  function renderProfileTab() {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Personal Information</h2>
            <p className="text-slate-500">Manage your contact details and address</p>
          </div>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-medium">
              <Edit size={16} /> Edit
            </button>
          )}
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProfileField label="Full Name" name="name" value={editData.name} icon={<User />} isEditing={isEditing} onChange={(e) => setEditData({...editData, name: e.target.value})} />
          <ProfileField label="Phone Number" name="phone" value={editData.phone} icon={<Phone />} isEditing={isEditing} onChange={(e) => setEditData({...editData, phone: e.target.value})} />
          <ProfileField label="Location" name="location" value={editData.location} icon={<MapPin />} isEditing={isEditing} onChange={(e) => setEditData({...editData, location: e.target.value})} />
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Mail size={14}/> Email Address
            </label>
            <div className="p-4 bg-slate-50 rounded-xl text-slate-400 border border-slate-100 italic">{userData.email} (Non-editable)</div>
          </div>
          <div className="md:col-span-2">
            <ProfileField label="Complete Address" name="address" value={editData.address} icon={<Home />} isEditing={isEditing} textarea onChange={(e) => setEditData({...editData, address: e.target.value})} />
          </div>
        </div>
        {isEditing && (
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4 justify-end">
            <button onClick={() => setIsEditing(false)} className="px-6 py-2 text-slate-600 font-medium">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-8 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 disabled:opacity-50 flex items-center gap-2">
              {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />} Save Changes
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderBookingsTab() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-3xl font-bold">Your Bookings</h2>
          <span className="text-slate-500 font-medium">{bookings.length} total services</span>
        </div>
        {loadingBookings ? <div className="py-20 text-center"><RefreshCw className="animate-spin mx-auto text-rose-500" size={40} /></div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((b) => (
              <motion.div key={b.id} whileHover={{ y: -5 }} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-rose-50 rounded-2xl text-rose-600"><Calendar size={24} /></div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest">Active</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800">{b.service_name}</h3>
                <p className="text-slate-500 text-sm mb-4">{b.sub_service_name}</p>
                <div className="space-y-2 mb-6 border-y border-slate-50 py-4">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Amount Paid</span> <span className="font-bold text-slate-900">₹{b.final_amount}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">City</span> <span className="font-medium text-slate-700">{b.city}</span></div>
                </div>
                <button 
                  onClick={() => { setSelectedBooking(b); setIsModalOpen(true); }}
                  className="w-full py-3 rounded-xl border border-rose-100 text-rose-600 font-bold hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} /> Manage Service
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderSubscriptionsTab() {
    const plans = [
      { duration: "3 Months", price: 5999, original: 6666, disc: "15%", color: "rose" },
      { duration: "6 Months", price: 11999, original: 13332, disc: "18%", color: "indigo", popular: true },
      { duration: "1 Year", price: 19999, original: 24999, disc: "20%", color: "slate" },
    ];

    return (
      <div className="space-y-8">
        {userData.subscription ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-10 text-center">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-3xl font-bold text-emerald-900">You are a Pro Member!</h2>
            <p className="text-emerald-700 mt-2">Current Plan: {userData.subscription.plan_duration} active until expired.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan.duration} className={`relative bg-white border ${plan.popular ? 'border-rose-500 ring-4 ring-rose-50' : 'border-slate-200'} rounded-3xl p-8 transition-transform hover:scale-105`}>
                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-rose-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Most Popular</div>}
                <h3 className="text-xl font-bold mb-1">{plan.duration}</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-black text-slate-900">₹{plan.price}</span>
                  <span className="text-slate-400 line-through text-sm">₹{plan.original}</span>
                </div>
                <ul className="space-y-4 mb-8 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> 1 Free Replacement</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> 10% Salary Discount</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Priority Support</li>
                </ul>
                <button 
                  onClick={() => handleRazorpaySubscription(plan)}
                  disabled={paymentProcessing}
                  className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                    plan.popular ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-slate-900 text-white'
                  }`}
                >
                  {paymentProcessing ? <RefreshCw className="animate-spin" /> : <CreditCard size={18} />} Get Started
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- INTERNAL COMPONENTS ---
  
  function ProfileField({ label, value, icon, isEditing, onChange, textarea }) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          {icon && <span className="text-rose-500">{icon}</span>} {label}
        </label>
        {isEditing ? (
          textarea ? (
            <textarea value={value} onChange={onChange} rows={3} className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all" />
          ) : (
            <input type="text" value={value} onChange={onChange} className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all" />
          )
        ) : (
          <p className="p-4 bg-slate-50 rounded-xl text-slate-700 border border-slate-100 font-medium">{value}</p>
        )}
      </div>
    );
  }

  function MaidModal() {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
          <div className="p-8 bg-rose-600 text-white">
            <h3 className="text-2xl font-bold">Manage Maid</h3>
            <p className="opacity-80">Update or replace your assigned professional</p>
          </div>
          <div className="p-8 space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-500 block mb-1">New Maid Name/ID</label>
              <input type="text" value={newMaid} onChange={(e) => setNewMaid(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500" placeholder="e.g. MH-102" />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-500 block mb-1">Reason for change</label>
              <textarea value={changeReason} onChange={(e) => setChangeReason(e.target.value)} rows={3} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500" placeholder="Briefly explain..." />
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-600 font-bold">Discard</button>
              <button className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-100 hover:bg-rose-700">Update Now</button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="relative">
        <div className="h-16 w-16 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 bg-rose-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}