"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, CheckCircle2, ChevronRight, MapPin ,
  CreditCard, ShieldCheck, Sparkles 
} from "lucide-react";

export default function HorizontalLuxeFlow() {
  const { id } = useParams(); // This is the service_id from the URL
  const router = useRouter();

  // State Management
  const [step, setStep] = useState(1);
  const [service, setService] = useState(null);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [subServices, setSubServices] = useState([]);
  const [selectedSubService, setSelectedSubService] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  const [userAnswers, setUserAnswers] = useState({});
  const [questionPrices, setQuestionPrices] = useState({});
  const [bookingData, setBookingData] = useState({ startDate: "", workTime: "" });
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const steps = ["Location", "Plan", "Config", "Pay"];

  // 1. Initial Data Fetch
  useEffect(() => {
    async function init() {
      // Fetch Main Service
      const { data: s } = await supabase.from("services").select("*").eq("id", id).single();
      setService(s);

      // Fetch Cities
      const { data: c } = await supabase.from("cities").select("*");
      setCities(c || []);

      // FETCH SUB-SERVICES (PLANS) IMMEDIATELY
      const { data: subs, error: subError } = await supabase
        .from("sub_services")
        .select("*")
        .eq("service_id", id);
      
      if (subs) setSubServices(subs);
      if (subError) console.error("Error fetching plans:", subError);
      
      // Check Subscription
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).eq("status", "active").maybeSingle();
        if (sub) setIsSubscribed(true);
      }
    }
    if (id) init();
  }, [id]);

  // 2. Fetch Questions when a Plan is selected
  const handleSubSelect = async (sub) => {
    setSelectedSubService(sub);
    const { data: qData } = await supabase
      .from("sub_service_questions")
      .select("*")
      .eq("sub_service_id", sub.id);
    
    setQuestions(qData || []);
    setStep(3);
  };

  // 3. Price Calculation
  useEffect(() => {
    const base = parseFloat(service?.price || 0);
    const sub = parseFloat(selectedSubService?.price || 0);
    const addons = Object.values(questionPrices).reduce((a, b) => a + b, 0);
    setTotalPrice(base + sub + addons);
  }, [service, selectedSubService, questionPrices]);

  const finalAmount = isSubscribed ? Math.round(totalPrice * 0.8) : totalPrice;

  if (!service) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-rose-500 font-black tracking-[0.5em]">LOADING LUXE...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans selection:bg-rose-500/20">
      
      {/* --- TOP NAV: HIGH VISIBILITY DARK BAR --- */}
      <header className="sticky top-0 w-full bg-[#000000] text-white z-50 shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-700 via-rose-500 to-rose-700" />
        
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button onClick={() => router.back()} className="p-2.5 bg-white/10 hover:bg-rose-600 rounded-lg transition-all">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">
              {service.name} <span className="text-rose-500 text-sm">Luxe</span>
            </h1>
          </div>

          <nav className="flex items-center bg-white/5 p-1.5 rounded-2xl border border-white/10">
            {steps.map((s, i) => {
              const isActive = step === i + 1;
              const isCompleted = step > i + 1;
              return (
                <div key={i} className="flex items-center">
                  <div className={`flex items-center gap-3 px-5 py-2.5 rounded-xl transition-all ${isActive ? 'bg-rose-600' : ''}`}>
                    <span className={`flex items-center justify-center w-6 h-6 rounded-md text-[12px] font-black border ${isActive ? 'bg-white text-rose-600 border-white' : 'border-white/20 text-white/40'}`}>
                      {isCompleted ? <CheckCircle2 size={14} /> : i + 1}
                    </span>
                    <span className={`text-[12px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-400'}`}>
                      {s}
                    </span>
                  </div>
                  {i !== steps.length - 1 && <ChevronRight size={14} className="mx-1 text-white/10" />}
                </div>
              );
            })}
          </nav>

          <div className="bg-rose-600/10 border border-rose-600/30 px-5 py-2 rounded-xl text-right">
            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Est. Total</p>
            <p className="text-xl font-black text-white italic">₹{finalAmount.toLocaleString()}</p>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-16">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: CITY */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12 text-center">
              <h2 className="text-6xl font-black text-black tracking-tighter uppercase italic">Select <span className="text-rose-600">City.</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {cities.map((city) => (
                  <button key={city.id} onClick={() => { setSelectedCity(city); setStep(2); }} className="group bg-white rounded-[3rem] p-4 shadow-xl border border-slate-50 overflow-hidden text-left hover:shadow-rose-100 transition-all">
                    <div className="h-64 rounded-[2.5rem] overflow-hidden mb-6"><img src={city.image} className="w-full h-full object-cover" /></div>
                    <div className="px-4"><span className="text-2xl font-black uppercase italic tracking-tighter">{city.name}</span></div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: PLANS (THE SUB_SERVICES) */}
        {/* STEP 2: PLANS (THE SUB_SERVICES) */}
{step === 2 && (
  <motion.div 
    key="s2" 
    initial={{ opacity: 0, x: 40 }} 
    animate={{ opacity: 1, x: 0 }} 
    className="space-y-16"
  >
    {/* Header Section */}
    <div className="relative">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <span className="text-rose-600 font-black text-[10px] uppercase tracking-[0.5em] block animate-pulse">
            Step 02 — Tier Selection
          </span>
          <h2 className="text-7xl font-black text-black tracking-tighter uppercase italic leading-none">
            The <span className="text-rose-600">Plans.</span>
          </h2>
        </div>
        <button 
          onClick={() => setStep(1)} 
          className="group flex items-center gap-3 bg-black text-white px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all"
        >
          <MapPin size={12} className="text-rose-400" />
          {selectedCity?.name || "Location"}
          <span className="opacity-30 group-hover:opacity-100 transition-opacity">— Change</span>
        </button>
      </div>
      <div className="h-1 w-full bg-slate-100 mt-8 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: "50%" }} 
          className="h-full bg-black" 
        />
      </div>
    </div>

    {/* Plans Grid */}
    <div className="grid gap-8">
      {subServices.length > 0 ? subServices.map((sub, index) => (
        <motion.button 
          key={sub.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => handleSubSelect(sub)} 
          className="group relative w-full text-left transition-all duration-500"
        >
          {/* Background Layer with Shadow */}
          <div className="absolute inset-0 bg-white rounded-[4rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] group-hover:shadow-[0_40px_80px_rgba(225,29,72,0.12)] group-hover:-translate-y-2 transition-all duration-500" />
          
          {/* Content Layer */}
          <div className="relative p-10 lg:p-14 flex flex-col lg:flex-row justify-between items-center gap-10">
            
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <span className="w-12 h-[2px] bg-rose-600" />
                <span className="text-[11px] font-black text-rose-600 uppercase tracking-[0.3em]">
                  {sub.working_hours || "Exclusive Tier"}
                </span>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-5xl font-black text-black uppercase tracking-tighter leading-none group-hover:text-rose-600 transition-colors">
                  {sub.name}
                </h3>
                <p className="text-slate-400 text-lg font-medium max-w-lg leading-relaxed">
                  Tailored precision for those who demand the finest attention to detail and service excellence.
                </p>
              </div>

              {/* Feature Tags */}
              <div className="flex gap-3">
                {['Premium Care', 'Insured', 'Expert Staff'].map((tag) => (
                  <span key={tag} className="text-[9px] font-bold text-slate-300 border border-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Price & Action Section */}
            <div className="flex flex-col items-center lg:items-end gap-6 min-w-[200px]">
              <div className="relative group-hover:scale-110 transition-transform duration-500">
                <p className="text-7xl font-black text-black italic tracking-tighter leading-none">
                  <span className="text-2xl align-top mr-1">₹</span>
                  {parseFloat(sub.price).toLocaleString()}
                </p>
                <div className="absolute -right-4 -top-4 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-rose-200">
                  <Sparkles size={14} className="text-white" />
                </div>
              </div>

              <div className="w-full h-14 bg-black text-white rounded-2xl flex items-center justify-center gap-3 overflow-hidden relative group-hover:bg-rose-600 transition-colors duration-300">
                 <span className="text-[11px] font-black uppercase tracking-[0.4em] relative z-10">Select This Plan</span>
                 <ChevronRight size={16} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              </div>
            </div>

          </div>
        </motion.button>
      )) : (
        /* Empty State */
        <div className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
          <div className="mb-6 opacity-20 flex justify-center"><ShieldCheck size={64} /></div>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm">No curated plans available currently.</p>
        </div>
      )}
    </div>
  </motion.div>
)}

          {/* STEP 3: CONFIGURATION */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
               <h2 className="text-6xl font-black text-black tracking-tighter uppercase italic">Config<span className="text-rose-600">.</span></h2>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 space-y-6">
                    {questions.map((q) => (
                      <div key={q.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50">
                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8 block">{q.question}</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {q.options?.map((opt, i) => (
                            <button key={i} onClick={() => { setUserAnswers({...userAnswers, [q.id]: opt.option}); setQuestionPrices({...questionPrices, [q.id]: parseFloat(opt.price || 0)}); }}
                              className={`p-6 rounded-2xl border-2 text-[12px] font-black uppercase tracking-widest transition-all flex justify-between items-center
                              ${userAnswers[q.id] === opt.option ? 'border-rose-600 bg-rose-50 text-rose-600 shadow-lg' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                              {opt.option}
                              {opt.price > 0 && <span className="opacity-60">+₹{opt.price}</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-6">
                    <div className="bg-rose-600 p-10 rounded-[3.5rem] shadow-2xl text-white sticky top-32">
                      <h4 className="text-[11px] font-black uppercase tracking-widest mb-8 opacity-70">The Schedule</h4>
                      <div className="space-y-6">
                        <input type="date" value={bookingData.startDate} onChange={e => setBookingData({...bookingData, startDate: e.target.value})} className="w-full bg-white/10 border-none rounded-2xl p-5 font-black text-white" />
                        <input type="time" value={bookingData.workTime} onChange={e => setBookingData({...bookingData, workTime: e.target.value})} className="w-full bg-white/10 border-none rounded-2xl p-5 font-black text-white" />
                        <button onClick={() => setStep(4)} className="w-full py-6 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black hover:text-white transition-all">Review Order</button>
                      </div>
                    </div>
                  </div>
               </div>
            </motion.div>
          )}

          {/* STEP 4: PAY */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center space-y-12">
               <div className="w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl"><CheckCircle2 size={40} /></div>
               <h2 className="text-6xl font-black text-black tracking-tighter uppercase italic">Confirm<span className="text-rose-600">.</span></h2>
               <div className="bg-white border border-slate-100 rounded-[4rem] p-12 shadow-2xl">
                  <div className="flex justify-between items-center mb-8 pb-8 border-b-2 border-slate-50">
                    <div className="text-left"><p className="text-rose-600 font-black text-[10px] uppercase">{selectedSubService?.name}</p><h3 className="text-3xl font-black uppercase italic">{service.name}</h3></div>
                    <p className="text-5xl font-black italic tracking-tighter">₹{finalAmount}</p>
                  </div>
                  <button className="w-full py-8 bg-black text-white rounded-full font-black uppercase tracking-[0.4em] text-[12px] hover:bg-rose-600 shadow-2xl transition-all flex items-center justify-center gap-4">
                    <CreditCard size={20} /> Secure Checkout
                  </button>
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}