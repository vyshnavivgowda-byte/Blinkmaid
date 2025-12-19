"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, MapPin } from "lucide-react";

/* ------------------------------
   Animation Presets
------------------------------ */
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export default function ServiceBookingFlow() {
  const { id } = useParams();
  const router = useRouter();
  const reviewBtnRef = useRef(null);
  const dateTimeRef = useRef(null);

  const [step, setStep] = useState(1);
  const [service, setService] = useState(null);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [subServices, setSubServices] = useState([]);
  const [selectedSubService, setSelectedSubService] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [questionPrices, setQuestionPrices] = useState({});

  const [bookingData, setBookingData] = useState({ startDate: "", workTime: "" });
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const steps = ["Location", "Plan", "Configuration", "Payment"];



  /* ------------------------------
     Initial Load
  ------------------------------ */
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      const { data: service } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .single();

      const { data: cities } = await supabase.from("cities").select("*");

      const { data: subs } = await supabase
        .from("sub_services")
        .select("*")
        .eq("service_id", id);

      setService(service);
      setCities(cities || []);
      setSubServices(subs || []);

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();

        if (sub) setIsSubscribed(true);
      }
    };

    load();
  }, [id]);

  /* ------------------------------
     Pricing
  ------------------------------ */
  useEffect(() => {
    const base = Number(service?.price || 0);
    const plan = Number(selectedSubService?.price || 0);
    const addons = Object.values(questionPrices).reduce((a, b) => a + b, 0);
    setTotalPrice(base + plan + addons);
  }, [service, selectedSubService, questionPrices]);

  const finalAmount = isSubscribed ? Math.round(totalPrice * 0.8) : totalPrice;

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading service details…
      </div>
    );
  }

  const handleBookingSubmit = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          user_id: (await supabase.auth.getUser()).data.user?.id,
          service_name: service.name,
          sub_service_name: selectedSubService?.name,
          city: selectedCity?.name,
          service_price: Number(service.price || 0),
          sub_service_price: Number(selectedSubService?.price || 0),
          total_price: totalPrice,
          final_amount: finalAmount,
          booking_date: bookingData.startDate,
          work_time: bookingData.workTime,
          notes: bookingData.notes,
          payment_status: "pending",
        },
      ])
      .select();

    if (error) {
      console.error("Booking error:", error.message);
      return;
    }
    console.log("Booking saved:", data);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 rounded-lg border hover:bg-slate-100">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl font-semibold text-slate-900">{service.name}</h1>
          </div>

          <div className="flex items-center gap-2 text-sm">
            {steps.map((label, i) => {
              const active = step === i + 1;
              return (
                <div key={`step-${i}`} className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
                      ${active ? "bg-rose-600 text-white" : "bg-slate-200 text-slate-600"}`}
                  >
                    {i + 1}
                  </span>
                  <span className={`hidden sm:block ${active ? "text-slate-900 font-medium" : "text-slate-400"}`}>
                    {label}
                  </span>
                  {i < steps.length - 1 && <ChevronRight key={`chevron-${i}`} size={14} className="text-slate-300" />}
                </div>
              );
            })}
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400">Estimated total</p>
            <p className="text-lg font-semibold text-slate-900">₹{finalAmount.toLocaleString()}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-14">
        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div {...fadeUp} key="city">
              <h2 className="text-3xl font-semibold mb-10">Choose your city</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      setSelectedCity(city);
                      setStep(2);
                    }}
                    className="bg-white border rounded-xl overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    <img
                      src={city.image}
                      className="h-44 w-full object-cover transition-transform duration-300 hover:scale-110"
                      alt={city.name}
                    />
                    <div className="p-4 text-left">
                      <p className="font-medium text-slate-900">{city.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}


          {/* STEP 2 */}
          {step === 2 && (
            <motion.div {...fadeUp} key="plans" className="space-y-12">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Choose Your Plan</h2>
                  <p className="text-slate-500 mt-1">Transparent pricing. No hidden charges.</p>
                </div>
                <button onClick={() => setStep(1)} className="text-sm flex items-center gap-1 text-rose-600 hover:underline">
                  <MapPin size={14} /> {selectedCity?.name}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {subServices.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={async () => {
                      setSelectedSubService(sub);
                      const { data } = await supabase
                        .from("sub_service_questions")
                        .select("*")
                        .eq("sub_service_id", sub.id);
                      setQuestions(data || []);
                      setStep(3);
                    }}
                    className="relative group cursor-pointer rounded-2xl p-[1px] bg-gradient-to-br from-transparent to-transparent hover:from-rose-500 hover:to-red-500 transition-all duration-300"
                  >
                    <div className="h-full bg-white rounded-2xl p-7 border border-slate-200 transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl">
                      <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-rose-600 transition">{sub.name}</h3>
                      <div className="mb-5">
                        <span className="text-4xl font-bold text-slate-900">₹{Number(sub.price).toLocaleString()}</span>
                        <span className="text-sm text-slate-400 ml-1">/ service</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-6 leading-relaxed">{sub.working_hours || "Standard service configuration"}</p>
                      <ul className="space-y-3 text-sm text-slate-600">
                        <li className="flex items-center gap-2"><span className="h-2 w-2 bg-rose-500 rounded-full" /> Verified professionals</li>
                        <li className="flex items-center gap-2"><span className="h-2 w-2 bg-rose-500 rounded-full" /> Quality assurance</li>
                        <li className="flex items-center gap-2"><span className="h-2 w-2 bg-rose-500 rounded-full" /> Flexible scheduling</li>
                      </ul>
                      <button className="mt-8 w-full py-3 rounded-xl font-semibold bg-slate-900 text-white transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-red-700 group-hover:shadow-lg">
                        Choose this plan →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div
              key={`questions-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              <h2 className="text-3xl font-bold text-gray-900">Configure Your Service</h2>
              <p className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>

              {questions[currentQuestionIndex]?.options && (
                <div className="bg-white border rounded-2xl shadow-md p-6">
                  <p className="font-semibold text-lg mb-6 text-gray-800">
                    {questions[currentQuestionIndex].question}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {questions[currentQuestionIndex].options.map((opt) => {
                      const qId = questions[currentQuestionIndex].id;
                      const isSelected = userAnswers[qId] === opt.option;
                      return (
                        <button
                          key={`${qId}-${opt.option}`}
                          onClick={() => {
                            setUserAnswers({ ...userAnswers, [qId]: opt.option });
                            setQuestionPrices({ ...questionPrices, [qId]: Number(opt.price || 0) });
                          }}
                          className={`flex justify-between items-center px-5 py-4 rounded-xl border transition-all duration-300 shadow-sm ${isSelected
                            ? "bg-rose-50 border-rose-600 shadow-lg hover:border-rose-700"
                            : "bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md hover:border-rose-600"
                            }`}
                        >
                          <span className={`text-gray-900 font-medium ${isSelected ? "text-lg" : "text-sm"}`}>
                            {opt.option}
                          </span>
                          {opt.price > 0 && (
                            <span className={`font-semibold ${isSelected ? "text-red-600 text-lg" : "text-gray-500 text-sm"}`}>
                              ₹{opt.price}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Previous/Next Buttons (for questions only) */}
              <div className="flex justify-between items-center mt-6">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(prev - 1, 0))}
                  className="px-6 py-3 rounded-xl border text-sm disabled:opacity-40 hover:border-gray-400 transition"
                >
                  Previous
                </button>
                {currentQuestionIndex < questions.length - 1 && (
                  <button
                    disabled={!userAnswers[questions[currentQuestionIndex].id]}
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(prev + 1, questions.length - 1))}
                    className="px-6 py-3 rounded-xl bg-slate-900 text-white text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                )}
              </div>

              {/* Date/Time and Notes (only on last question) */}
              {currentQuestionIndex === questions.length - 1 && (
                <div ref={dateTimeRef} className="bg-white border rounded-2xl shadow-md p-6 mt-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Date Picker: only tomorrow onwards */}
                    <input
                      type="date"
                      required
                      min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]} // tomorrow
                      className="border rounded-xl px-4 py-3 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                      value={bookingData.startDate}
                      onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                    />

                    <div className="border rounded-xl">
                      <select
                        required
                        value={bookingData.workTime}
                        onChange={(e) => setBookingData({ ...bookingData, workTime: e.target.value })}
                        className="w-full px-4 py-3 outline-none focus:ring-rose-500 focus:border-rose-500 transition appearance-none"
                        size={1} // default dropdown behavior
                      >
                        {Array.from({ length: 48 }).map((_, i) => {
                          const hours = Math.floor(i / 2);
                          const minutes = i % 2 === 0 ? "00" : "30";
                          const value = `${hours.toString().padStart(2, "0")}:${minutes}`;
                          const label = `${hours % 12 === 0 ? 12 : hours % 12}:${minutes} ${hours < 12 ? "AM" : "PM"}`;
                          return (
                            <option key={i} value={value}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    </div>




                  </div>
                  <textarea
                    placeholder="Add any notes or special instructions..."
                    className="w-full border rounded-xl px-4 py-3 focus:ring-rose-500 focus:border-rose-500 outline-none transition resize-none"
                    rows={3}
                    value={bookingData.notes || ""}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  />

                  {/* Review & Continue button below notes */}
                  <button
                    disabled={
                      questions.some((q) => !userAnswers[q.id]) || !bookingData.startDate || !bookingData.workTime
                    }
                    onClick={() => setStep(4)}
                    className="w-full mt-4 px-6 py-3 rounded-xl bg-rose-600 text-white text-sm hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Review & Continue
                  </button>
                </div>
              )}

            </motion.div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <motion.div
              {...fadeUp}
              key="pay"
              className="space-y-12 max-w-4xl mx-auto"
            >
              {/* Header */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">Review & Confirm</h2>
                <p className="text-gray-500 mt-2">
                  Please review your service details before proceeding to payment
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-white shadow-lg rounded-2xl p-8 space-y-6">
                {/* Service & City */}
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Service</p>
                    <p className="font-semibold text-lg">{service.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{selectedSubService?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">City</p>
                    <p className="font-semibold">{selectedCity?.name}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200" />

                {/* Schedule */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Scheduled Date & Time</span>
                  <span className="font-medium">{bookingData.startDate} at {bookingData.workTime}</span>
                </div>

                <div className="border-t border-gray-200" />

                {/* Price Breakdown with hover effect */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50 transition">
                    <span className="text-gray-600">Base Price</span>
                    <span className="font-medium">₹{Number(service.price || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50 transition">
                    <span className="text-gray-600">Plan Price</span>
                    <span className="font-medium">₹{Number(selectedSubService?.price || 0).toLocaleString()}</span>
                  </div>
                  {Object.values(questionPrices).length > 0 && (
                    <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50 transition">
                      <span className="text-gray-600">Add-ons</span>
                      <span className="font-medium">₹{Object.values(questionPrices).reduce((a, b) => a + b, 0)}</span>
                    </div>
                  )}
                  {isSubscribed && (
                    <div className="flex justify-between items-center text-green-600 font-medium text-sm p-2 rounded-lg hover:bg-green-50 transition">
                      <span>Subscription Discount</span>
                      <span>-20%</span>
                    </div>
                  )}
                </div>

                {/* Total Amount with highlight */}
                <div className="border-t border-gray-200 pt-4 flex justify-between items-center p-3 rounded-xl bg-rose-50 hover:bg-rose-100 transition">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-rose-700">₹{finalAmount.toLocaleString()}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    onClick={() => setStep(3)}
                    className="w-full sm:w-1/2 border border-gray-300 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleBookingSubmit}
                    className="w-full sm:w-1/2 bg-rose-600 text-white py-3 rounded-lg font-medium hover:bg-rose-700 transition"
                  >
                    Proceed to Secure Payment
                  </button>
                </div>
              </div>
            </motion.div>
          )}


        </AnimatePresence>
      </main>
    </div>
  );
}
