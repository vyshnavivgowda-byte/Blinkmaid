"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, MapPin, Calendar, Clock, CheckCircle, AlertCircle, Loader, CreditCard, User } from "lucide-react";

// Razorpay integration
import { useRazorpay } from "react-razorpay"; // Assuming you install react-razorpay or use checkout.js directly

/* ------------------------------
   Animation Presets
------------------------------ */
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.4, ease: "easeOut" },
};

const slideIn = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
  transition: { duration: 0.5 },
};

export default function ServiceBookingFlow() {
  const { id } = useParams();
  const router = useRouter();
  const reviewBtnRef = useRef(null);
  const dateTimeRef = useRef(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signInError, setSignInError] = useState(null);
  const [serviceTax, setServiceTax] = useState(0);

  const [customerDetails, setCustomerDetails] = useState({
    fullName: "",
    mobile: "",
    altMobile: "",
    flat: "",
    floor: "",
    building: "",
    street: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  const steps = ["Location", "Plan", "Configuration", "Payment"];
  const progress = (step / steps.length) * 100;

  // Razorpay hook (if using react-razorpay)
  const { Razorpay } = useRazorpay();

  /* ------------------------------
     Initial Load: Fetch original service, cities, and user/subscriber status
     (Removed sub_services fetch from here)
  ------------------------------ */
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        const { data: service, error: serviceError } = await supabase
          .from("services")
          .select("*")
          .eq("id", id)
          .single();
        if (serviceError) throw serviceError;

        // Fetch all services with the same name (trimmed and case-insensitive) to get associated city_ids
        const serviceName = service.name.trim().toLowerCase();
        const { data: relatedServices, error: relatedError } = await supabase
          .from("services")
          .select("city_id")
          .ilike("name", `%${serviceName}%`); // Use ilike for case-insensitive and partial match
        if (relatedError) throw relatedError;

        // Extract unique city_ids
        const cityIds = [...new Set(relatedServices.map(s => s.city_id).filter(Boolean))];

        // Fetch cities that are associated with this service name
        const { data: cities, error: citiesError } = await supabase
          .from("cities")
          .select("*")
          .in("id", cityIds);
        if (citiesError) throw citiesError;

        setService(service);
        setCities(cities || []);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check subscribers table for subscription
          const { data: sub, error: subError } = await supabase
            .from("subscribers")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();
          if (subError) console.warn("Subscription check error:", subError);
          if (sub) setIsSubscribed(true); // Apply discount if subscribed
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  /* ------------------------------
     Fetch sub_services after city is selected (Step 1)
     - Find the service in the selected city with the same name as the original service.
     - Then fetch sub_services for that service's ID (making plans location-specific).
  ------------------------------ */
  useEffect(() => {
    if (!selectedCity || !service) return;

    const fetchSubServices = async () => {
      try {
        // Find the service in the selected city with a matching name (case-insensitive)
        const serviceName = service.name.trim().toLowerCase();
        const { data: matchingService, error: matchError } = await supabase
          .from("services")
          .select("id")
          .eq("city_id", selectedCity.id)
          .ilike("name", `%${serviceName}%`)
          .single(); // Assumes one matching service per city; adjust if needed
        if (matchError || !matchingService) {
          throw new Error("No matching service found in the selected city. Please choose another location.");
        }

        // Fetch sub_services for the matching service's ID
        const { data: subs, error: subsError } = await supabase
          .from("sub_services")
          .select("*")
          .eq("service_id", matchingService.id);
        if (subsError) throw subsError;

        setSubServices(subs || []);
      } catch (err) {
        setError("Failed to load plans for the selected city: " + err.message);
      }
    };

    fetchSubServices();
  }, [selectedCity, service]);

  /* ------------------------------
     Pricing
  ------------------------------ */
  useEffect(() => {
    const planPrice = Number(selectedSubService?.price || 0);
    const addons = Object.values(questionPrices).reduce((a, b) => a + b, 0);
    const subtotal = planPrice + addons;

    const isTaxablePlan =
      selectedSubService?.name?.toLowerCase().includes("daily") ||
      selectedSubService?.name?.toLowerCase().includes("hourly");

    const tax = isTaxablePlan ? Math.round(subtotal * 0.1) : 0;

    setServiceTax(tax);
    setTotalPrice(subtotal + tax);
  }, [selectedSubService, questionPrices]);

  const finalAmount = isSubscribed
    ? Math.round(totalPrice * 0.9)
    : totalPrice;


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blinkwhite to-slate-50">
        <Loader className="animate-spin text-blinkred" size={48} />
        <span className="ml-4 text-slate-600">Loading service details…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blinkwhite">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <p className="text-slate-600">Error: {error}</p>
          <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-blinkred text-blinkwhite rounded-lg hover:bg-red-700">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Service not found.
      </div>
    );
  }

  const handleSignIn = async () => {
    setAuthLoading(true);
    setSignInError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      });

      if (error) {
        setSignInError("Invalid email or password");
        return; // Stay on modal
      }

      // Success: Close modal and proceed to step 4
      setShowSignInModal(false);
      setStep(4);
    } catch (err) {
      setSignInError("Something went wrong. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setShowSignInModal(true);
      return;
    }

    if (!isAddressValid()) {
      setError("Please complete service address details before payment.");
      return;
    }

    try {
      // Load Razorpay SDK
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) throw new Error("Razorpay SDK failed to load");

      // Create order via backend (amount in paise)
      const response = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalAmount * 100 }), // Convert to paise
      });

      const order = await response.json();
      if (!order?.id) throw new Error(order?.error || "Failed to create Razorpay order");

      // Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "BlinkMaid",
        description: `${service.name} - ${selectedSubService?.name}`,
        order_id: order.id,
        handler: async (res) => {
          if (!res.razorpay_payment_id) {
            setError("Payment was not completed properly");
            return;
          }

          await supabase.from("bookings").insert([
            {
              user_id: user.id,
              service_name: service.name,
              sub_service_name: selectedSubService?.name,
              city: selectedCity?.name,
              sub_service_price: Number(selectedSubService?.price || 0),
              service_tax: serviceTax,
              total_price: totalPrice,
              final_amount: finalAmount,
              discount_applied: isSubscribed,
              booking_date: bookingData.startDate,
              work_time: bookingData.workTime,
              notes: bookingData.notes,
              customer_details: customerDetails,
              payment_status: "paid",
              payment_id: res.razorpay_payment_id,
              order_id: res.razorpay_order_id,
            },
          ]);

          setPaymentSuccess(true);
          setTimeout(() => router.push("/home"), 2000);
        },
        prefill: {
          email: user.email,
          contact: customerDetails.mobile,
          name: customerDetails.fullName,
        },
        theme: { color: "#E63946" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError("Payment failed: " + (err.message || err));
    }
  };

  const isAddressValid = () => {
    const requiredFields = [
      "fullName",
      "mobile",
      "flat",
      "street",
      "area",
      "city",
      "state",
      "pincode",
    ];

    return requiredFields.every(
      (field) => customerDetails[field]?.trim() !== ""
    ) && customerDetails.mobile.length === 10 && customerDetails.pincode.length === 6;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blinkwhite to-slate-50">
      {/* Header */}
      <header className="fixed top-4 z-50 bg-blinkwhite/90 backdrop-blur-md border-b shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg border hover:bg-slate-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="text-left">
              <h1 className="text-xl font-semibold text-blinkblack">{service.name}</h1>
              <p className="text-xs text-slate-400">Estimated total</p>
              <p className="text-lg font-semibold text-blinkblack">₹{finalAmount.toLocaleString()}</p>
            </div>
          </div>

          {/* Progress Bar and Steps */}
          <div className="flex items-center gap-2 text-sm">
            {steps.map((label, i) => {
              const active = step === i + 1;
              const completed = step > i + 1;
              return (
                <div key={`step-${i}`} className="flex items-center gap-2">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${completed ? "bg-green-600 text-white" : active ? "bg-blinkred text-white" : "bg-slate-200 text-slate-600"
                      }`}
                  >
                    {completed ? <CheckCircle size={16} /> : i + 1}
                  </span>
                  <span className={`hidden sm:block ${active ? "text-blinkblack font-medium" : "text-slate-400"}`}>
                    {label}
                  </span>
                  {i < steps.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
                </div>
              );
            })}
          </div>
        </div>
      </header>
      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-14 pt-24">
        <AnimatePresence mode="wait">
          {/* STEP 1: Location */}
          {step === 1 && (
            <motion.div {...fadeUp} key="city" className="space-y-8">
              <div key="city-content" className="text-center">
                <h2 className="text-4xl font-bold text-blinkblack mb-4">Choose Your City</h2>
                <p className="text-slate-500">Select the location for your service</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cities.map((city) => (
                  <motion.button
                    key={city.id}
                    onClick={() => {
                      setSelectedCity(city);
                      setStep(2);
                    }}
                    className="bg-blinkwhite border rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={city.image}
                      className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      alt={city.name}
                      loading="lazy"
                    />
                    <div className="p-4 text-left">
                      <p className="font-medium text-blinkblack group-hover:text-blinkred transition">{city.name}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Plan */}
          {step === 2 && (
            <motion.div {...fadeUp} key="plans" className="space-y-12">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-bold tracking-tight text-blinkblack">Choose Your Plan</h2>
                  <p className="text-slate-500 mt-2">Transparent pricing. No hidden charges.</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm flex items-center gap-1 text-blinkred hover:underline"
                >
                  <MapPin size={14} /> {selectedCity?.name}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {subServices.map((sub) => (
                  <motion.div
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
                    className="relative group cursor-pointer rounded-2xl p-[1px] bg-gradient-to-br from-transparent to-transparent hover:from-blinkred hover:to-red-500 transition-all duration-300"
                    whileHover={{ y: -8 }}
                  >
                    <div className="h-full bg-blinkwhite rounded-2xl p-7 border border-slate-200 transition-all duration-300 hover:shadow-2xl">
                      <h3 className="text-xl font-semibold text-blinkblack mb-2 group-hover:text-blinkred transition">
                        {sub.name}
                      </h3>
                      <div className="mb-5">
                        <span className="text-4xl font-bold text-blinkblack">₹{Number(sub.price).toLocaleString()}</span>
                        <span className="text-sm text-slate-400 ml-1">/ service</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-6 leading-relaxed">{sub.working_hours || "Standard service configuration"}</p>
                      <ul className="space-y-3 text-sm text-slate-600">
                        <li className="flex items-center gap-2"><span className="h-2 w-2 bg-blinkred rounded-full" /> Verified professionals</li>
                        <li className="flex items-center gap-2"><span className="h-2 w-2 bg-blinkred rounded-full" /> Quality assurance</li>
                        <li className="flex items-center gap-2"><span className="h-2 w-2 bg-blinkred rounded-full" /> Flexible scheduling</li>
                      </ul>
                      <button className="mt-8 w-full py-3 rounded-xl font-semibold bg-blinkblack text-blinkwhite transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-blinkred group-hover:to-red-700 group-hover:shadow-lg">
                        Choose this plan →
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Configuration

          {/* STEP 3: Configuration */}
          {step === 3 && (
            <motion.div {...slideIn} key={`questions-${currentQuestionIndex}`} className="space-y-10">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-blinkblack">Configure Your Service</h2>
                <p className="text-slate-500 mt-2">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>

              {questions[currentQuestionIndex]?.options && (
                <div className="bg-blinkwhite border rounded-2xl shadow-lg p-6">
                  <p className="font-semibold text-lg mb-6 text-blinkblack">
                    {questions[currentQuestionIndex].question}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {questions[currentQuestionIndex].options.map((opt) => {
                      const qId = questions[currentQuestionIndex].id;
                      const isSelected = userAnswers[qId] === opt.option;
                      return (
                        <motion.button
                          key={`${qId}-${opt.option}`}
                          onClick={() => {
                            setUserAnswers({ ...userAnswers, [qId]: opt.option });
                            setQuestionPrices({ ...questionPrices, [qId]: Number(opt.price || 0) });
                          }}
                          className={`flex justify-between items-center px-5 py-4 rounded-xl border transition-all duration-300 shadow-sm ${isSelected
                            ? "bg-red-50 border-blinkred shadow-lg"
                            : "bg-blinkwhite border-slate-200 hover:bg-slate-50 hover:shadow-md hover:border-blinkred"
                            }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className={`text-blinkblack font-medium ${isSelected ? "text-lg" : "text-sm"}`}>
                            {opt.option}
                          </span>
                          {opt.price > 0 && (
                            <span className={`font-semibold ${isSelected ? "text-blinkred text-lg" : "text-slate-500 text-sm"}`}>
                              ₹{opt.price}
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
                  className="px-6 py-3 rounded-xl border text-sm disabled:opacity-40 hover:border-slate-400 transition"
                >
                  Previous
                </button>
                {currentQuestionIndex < questions.length - 1 && (
                  <button
                    disabled={!userAnswers[questions[currentQuestionIndex].id]}
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1))}
                    className="px-6 py-3 rounded-xl bg-blinkblack text-blinkwhite text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                )}
              </div>

              {/* Date/Time and Notes */}
              {currentQuestionIndex === questions.length - 1 && (
                <motion.div
                  ref={dateTimeRef}
                  {...fadeUp}
                  className="bg-blinkwhite border rounded-2xl shadow-lg p-6 space-y-4"
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input
                        type="date"
                        required
                        min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]} // tomorrow
                        className="border rounded-xl pl-10 pr-4 py-3 focus:ring-blinkred focus:border-blinkred outline-none transition"
                        value={bookingData.startDate}
                        onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 text-slate-400" size={18} />
                      <select
                        required
                        value={bookingData.workTime}
                        onChange={(e) => setBookingData({ ...bookingData, workTime: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border rounded-xl outline-none focus:ring-blinkred focus:border-blinkred transition appearance-none"
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
                    className="w-full border rounded-xl px-4 py-3 focus:ring-blinkred focus:border-blinkred outline-none transition resize-none"
                    rows={3}
                    value={bookingData.notes || ""}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  />
                  <button
                    ref={reviewBtnRef}
                    disabled={
                      questions.some((q) => !userAnswers[q.id]) || !bookingData.startDate || !bookingData.workTime
                    }
                    onClick={() => setStep(4)}
                    className="w-full mt-4 px-6 py-3 rounded-xl bg-blinkred text-blinkwhite text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Review & Continue
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 4: Payment */}
          {step === 4 && (
            <motion.div
              {...fadeUp}
              key="pay"
              className="space-y-12 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <h2 className="text-4xl font-bold text-blinkblack">Review & Confirm</h2>
                <p className="text-slate-500 mt-2">
                  Please review your service details before proceeding to payment
                </p>
              </div>

              <div className="bg-blinkwhite shadow-xl rounded-2xl p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Service</p>
                    <p className="font-semibold text-lg">{service.name}</p>
                    <p className="text-sm text-slate-500 mt-1">{selectedSubService?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">City</p>
                    <p className="font-semibold">{selectedCity?.name}</p>
                  </div>
                </div>

                <div className="border-t border-slate-200" />

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Scheduled Date & Time</span>
                  <span className="font-medium">{bookingData.startDate} at {bookingData.workTime}</span>
                </div>

                <div className="border-t border-slate-200" />

                {/* Pricing Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-slate-50 transition">
                    <span className="text-slate-600">Plan Price</span>
                    <span className="font-medium">₹{Number(selectedSubService?.price || 0).toLocaleString()}</span>
                  </div>
                  {Object.values(questionPrices).length > 0 && (
                    <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-slate-50 transition">
                      <span className="text-slate-600">Add-ons</span>
                      <span className="font-medium">₹{Object.values(questionPrices).reduce((a, b) => a + b, 0)}</span>
                    </div>
                  )}
                  {serviceTax > 0 && (
                    <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-slate-50 transition">
                      <span className="text-slate-600">Service Tax (10%)</span>
                      <span className="font-medium">
                        ₹{serviceTax.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className={`flex justify-between items-center text-lg font-semibold p-2 rounded-lg bg-slate-50 ${isSubscribed ? "line-through text-slate-500" : ""}`}>
                    <span className="text-blinkblack">Total Amount</span>
                    <span className="text-blinkblack">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  {isSubscribed && (
                    <div className="flex justify-between items-center text-green-600 font-medium text-sm p-2 rounded-lg hover:bg-green-50 transition">
                      <span>Subscription Discount</span>
                      <span>-10%</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-bold p-3 rounded-xl bg-blinkred/10 border border-blinkred">
                    <span className="text-blinkblack">Final Amount</span>
                    <span className="text-blinkred">₹{finalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Subscription Prompt if Not Subscribed */}
                {!isSubscribed && (
                  <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 mb-2">Subscribe for 10% Discount on all bookings!</p>
                    <button
                      onClick={() => router.push("/subscription-plan")} // Replace with your subscription page URL
                      className="px-4 py-2 bg-blinkred text-blinkwhite rounded-lg hover:bg-red-700 transition"
                    >
                      View Subscription Plans
                    </button>
                  </div>
                )}
                {/* SERVICE ADDRESS */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <h3 className="text-xl font-semibold text-blinkblack">Service Address & Contact</h3>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-sm text-slate-500 mb-1">Full Name</label>
                      <input
                        placeholder="Enter full name"
                        value={customerDetails.fullName}
                        onChange={(e) =>
                          setCustomerDetails({ ...customerDetails, fullName: e.target.value })
                        }
                        className="input border rounded-lg px-4 py-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm text-slate-500 mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        placeholder="Enter mobile number"
                        value={customerDetails.mobile}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, ""); // allow only digits
                          if (val.length <= 10) {
                            setCustomerDetails({ ...customerDetails, mobile: val });
                          }
                        }}
                        className="input border rounded-lg px-4 py-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                      />
                      {customerDetails.mobile.length > 0 && customerDetails.mobile.length < 10 && (
                        <span className="text-red-500 text-sm mt-1">Mobile number must be 10 digits</span>
                      )}
                    </div>

                    <div className="flex flex-col md:col-span-2">
                      <label className="text-sm text-slate-500 mb-1">Alternate Mobile (Optional)</label>
                      <input
                        type="tel"
                        placeholder="Alternate mobile"
                        value={customerDetails.altMobile}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 10) {
                            setCustomerDetails({ ...customerDetails, altMobile: val });
                          }
                        }}
                        className="input border rounded-lg px-4 py-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Address Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Flat / House / Plot No", key: "flat" },
                      { label: "Floor", key: "floor" },
                      { label: "Building / Apartment Name", key: "building" },
                      { label: "Street / Locality", key: "street" },
                      { label: "Area / Zone", key: "area" },
                      { label: "Landmark (Optional)", key: "landmark" },
                    ].map((field) => (
                      <div className="flex flex-col" key={field.key}>
                        <label className="text-sm text-slate-500 mb-1">{field.label}</label>
                        <input
                          placeholder={field.label}
                          value={customerDetails[field.key]}
                          onChange={(e) =>
                            setCustomerDetails({ ...customerDetails, [field.key]: e.target.value })
                          }
                          className="input border rounded-lg px-4 py-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                        />
                      </div>
                    ))}
                  </div>

                  {/* City/State/Pincode */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <label className="text-sm text-slate-500 mb-1">City / Town</label>
                      <input
                        placeholder="City / Town"
                        value={customerDetails.city}
                        onChange={(e) =>
                          setCustomerDetails({ ...customerDetails, city: e.target.value })
                        }
                        className="input border rounded-lg px-4 py-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm text-slate-500 mb-1">State</label>
                      <input
                        placeholder="State"
                        value={customerDetails.state}
                        onChange={(e) =>
                          setCustomerDetails({ ...customerDetails, state: e.target.value })
                        }
                        className="input border rounded-lg px-4 py-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm text-slate-500 mb-1">Pincode</label>
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={customerDetails.pincode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, ""); // only digits
                          if (val.length <= 6) setCustomerDetails({ ...customerDetails, pincode: val });
                        }}
                        className="input border rounded-lg px-4 py-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                      />
                      {customerDetails.pincode.length > 0 && customerDetails.pincode.length < 6 && (
                        <span className="text-red-500 text-sm mt-1">Pincode must be 6 digits</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    onClick={() => setStep(3)}
                    className="w-full sm:w-1/2 border border-slate-300 py-3 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={!isAddressValid()}
                    className="w-full sm:w-1/2 bg-blinkred text-white py-3 rounded-lg font-medium
             hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed
             flex items-center justify-center gap-2"
                  >
                    <CreditCard size={18} />
                    Proceed to Secure Payment
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sign-In Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blinkwhite rounded-2xl p-8 max-w-md w-full mx-4"
          >
            <div className="text-center mb-6">
              <User className="mx-auto text-blinkred mb-4" size={48} />
              <h3 className="text-2xl font-bold text-blinkblack">Sign In Required</h3>
              <p className="text-slate-500 mt-2">Please sign in to proceed with your booking.</p>
            </div>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full border rounded-xl px-4 py-3 focus:ring-blinkred focus:border-blinkred outline-none transition"
                value={signInData.email}
                onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full border rounded-xl px-4 py-3 focus:ring-blinkred focus:border-blinkred outline-none transition"
                value={signInData.password}
                onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
              />
              {signInError && (
                <p className="text-red-600 text-sm text-center">
                  {signInError}
                </p>
              )}
              <button
                onClick={handleSignIn}
                disabled={authLoading}
                className="w-full bg-blinkred text-blinkwhite py-3 rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition"
              >
                {authLoading ? <Loader className="animate-spin mx-auto" size={20} /> : "Sign In"}
              </button>
              <button
                onClick={() => setShowSignInModal(false)}
                className="w-full text-slate-600 hover:text-slate-800 transition"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {paymentSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-8 rounded-2xl text-center shadow-lg">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
            <h3 className="text-xl font-bold">Payment Successful!</h3>
            <p className="text-slate-600 mt-2">Redirecting to home...</p>
          </div>
        </div>
      )}
    </div>
  );
}