"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";

export default function ServiceDetailsPage() {
    const { id } = useParams();
    const router = useRouter();

    const [service, setService] = useState(null);
    const [cities, setCities] = useState([]);
    const [selectedCityId, setSelectedCityId] = useState(null);

    const [subServices, setSubServices] = useState([]);
    const [selectedSubService, setSelectedSubService] = useState(null);

    const [questions, setQuestions] = useState([]);
    const [questionPrices, setQuestionPrices] = useState({});
    const [userAnswers, setUserAnswers] = useState({});

    const [totalPrice, setTotalPrice] = useState(0);
    const [showPremiumPopup, setShowPremiumPopup] = useState(false);
    const [discountApplied, setDiscountApplied] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscriptionPlan, setSubscriptionPlan] = useState("");

    const [step, setStep] = useState(1);

    // Fetch service
    useEffect(() => {
        const fetchService = async () => {
            const { data, error } = await supabase.from("services").select("*").eq("id", id).single();
            if (error) console.error(error);
            else setService(data);
        };
        fetchService();
    }, [id]);

    // Fetch cities
    useEffect(() => {
        const fetchCities = async () => {
            const { data, error } = await supabase.from("cities").select("*");
            if (error) console.error(error);
            else setCities(data);
        };
        fetchCities();
    }, []);

    // Fetch subscription status
    useEffect(() => {
        const fetchSubscription = async () => {
            const { data } = await supabase.auth.getUser();
            if (!data?.user) return;

            const userId = data.user.id;
            const { data: sub } = await supabase
                .from("subscriptions")
                .select("*")
                .eq("user_id", userId)
                .eq("status", "active")
                .maybeSingle();

            if (sub) {
                setIsSubscribed(true);
                setSubscriptionPlan(sub.plan_name || "Premium");
                setDiscountApplied(true);
            }
        };
        fetchSubscription();
    }, []);

    // Update total price
    useEffect(() => {
        const servicePrice = service?.price || 0;
        const subPrice = selectedSubService?.price || 0;
        const qPrice = Object.values(questionPrices).reduce((a, b) => a + b, 0);
        setTotalPrice(servicePrice + subPrice + qPrice);
    }, [service, selectedSubService, questionPrices]);

    // Handle City selection
    const handleCitySelect = async (cityId) => {
        setSelectedCityId(cityId);

        const { data: serviceData } = await supabase
            .from("services")
            .select("*")
            .eq("name", service?.name)
            .eq("city_id", cityId)
            .single();

        if (!serviceData) {
            setSubServices([]);
            return;
        }

        const { data: subData } = await supabase
            .from("sub_services")
            .select("*")
            .eq("service_id", serviceData.id);

        setSubServices(subData || []);
        setStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Handle Sub-service click
  const handleSubServiceClick = async (subService) => {
  setSelectedSubService(subService);
  setQuestionPrices({});
  setUserAnswers({});
  setStep(3); // 👈 open popup immediately

  const { data } = await supabase
    .from("sub_service_questions")
    .select("*")
    .eq("sub_service_id", subService.id);

  setQuestions(data || []);
};


   const closePopup = () => {
  setSelectedSubService(null);
  setQuestions([]);
  setQuestionPrices({});
  setStep(2);
};


    const handleProceedToBooking = () => {
  const bookingInfo = {
    serviceId: service.id,
    serviceName: service.name,
    cityId: selectedCityId,
    cityName: cities.find(c => c.id === selectedCityId)?.name || "",
    subServiceId: selectedSubService.id,
    subServiceName: selectedSubService.name,
    basePrice: service.price,
    subServicePrice: selectedSubService.price,
    questionPrices,
    userAnswers,
    totalPrice,
    discountApplied,
    subscriptionPlan,
  };

  localStorage.setItem("bookingInfo", JSON.stringify(bookingInfo));

  router.push(`/services/${id}/booking`);
};

    if (!service) return <p className="text-center mt-20">Loading service details...</p>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
            {/* Header */}
            <div className="relative w-full h-[40vh] bg-gradient-to-br from-black via-red-900 to-black flex flex-col justify-center items-center text-center px-6">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
                    <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl bottom-10 right-10 animate-pulse"></div>
                </div>
                <div className="relative z-10 text-white">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-3 drop-shadow-xl">{service.name}</h1>
                    <p className="text-base md:text-lg max-w-2xl mx-auto text-white/90">{service.description}</p>
                </div>
            </div>

            {/* Back button */}
            <div className="max-w-6xl mx-auto px-6 mt-10 flex justify-start">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium">
                    <ArrowLeft size={20} /> Back to Services
                </button>
            </div>

            {/* Step Container */}
            <motion.section className="max-w-5xl mx-auto bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-100/50 mb-16">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.4 }}>
                            <h2 className="text-4xl font-extrabold text-center mb-8 text-gray-800">
                                Select Your <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">City</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {cities.map((city) => (
                                    <motion.div
                                        key={city.id}
                                        className={`p-6 rounded-2xl border shadow-xl cursor-pointer transform hover:scale-105 ${selectedCityId === city.id ? "border-red-500 bg-red-50/80 ring-4 ring-red-200" : "border-gray-200 bg-white/50"}`}
                                        onClick={() => handleCitySelect(city.id)}
                                    >
                                        <img src={city.image} alt={city.name} className="w-28 h-28 mx-auto rounded-full object-cover mb-4 border-4 border-red-100 shadow-xl" />
                                        <h3 className="text-xl font-bold text-gray-800 text-center">{city.name}</h3>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.4 }}>
                            <h2 className="text-4xl font-extrabold text-center mb-8 text-gray-800">
                                Choose a <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">Sub-Service</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {subServices.length === 0 ? (
                                    <p className="text-center text-gray-600 py-10">❌ No sub-services found for this city.</p>
                                ) : (
                                    subServices.map((sub) => (
                                        <motion.div key={sub.id} className={`p-6 rounded-2xl border shadow-xl cursor-pointer transform hover:scale-105 ${selectedSubService?.id === sub.id ? "border-red-500 bg-red-50/80 ring-4 ring-red-200" : "border-gray-200 bg-white/50"}`} onClick={() => handleSubServiceClick(sub)}>
                                            <h3 className="text-xl font-bold text-gray-800 mb-3 truncate">{sub.name}</h3>
                                            <p className="text-gray-600 text-sm mb-4">{sub.description || "No description provided."}</p>
                                            <p className="text-red-600 font-bold text-lg">₹{sub.price}</p>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between mt-10">
                    {step > 1 && <button onClick={() => setStep(step - 1)} className="px-8 py-3 rounded-xl bg-gray-100 text-gray-800">← Previous</button>}
                </div>
            </motion.section>

            {/* 💬 Questions Popup */}
            <AnimatePresence>
                {step === 3 && selectedSubService && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl max-w-md w-full p-6 relative border border-gray-100/50"
                        >
                            <button onClick={closePopup} className="absolute top-3 right-3 text-gray-500 hover:text-red-600 transition-colors" aria-label="Close popup">
                                <X size={24} />
                            </button>

                            <h3 className="text-xl font-extrabold text-gray-800 mb-4 text-center">
                                <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">{selectedSubService.name}</span>
                            </h3>

                            <p className="text-center text-gray-600 text-[12px] mb-3">
                                Customize your preferences below to help us assign the right staff for your home.
                            </p>

                            {/* 💰 Display Prices */}
                            <div className="bg-gradient-to-r from-gray-50 to-red-50 border border-red-200 rounded-2xl p-3 mb-4 shadow-inner">
                                <p className="text-red-600 font-bold text-sm mb-1">
                                    Service Price: ₹{service?.price || 0} + Sub-Service: ₹{selectedSubService?.price || 0}
                                </p>
                                <p className="text-gray-800 font-extrabold text-lg">
                                    Total: ₹{totalPrice}
                                </p>
                            </div>

                            {questions.length > 0 ? (
                                <form
  onSubmit={(e) => {
    e.preventDefault();
    handleProceedToBooking();
  }}
  className="space-y-4"
>

                                    {questions.map((q) => {
                                        let parsedOptions = [];
                                        if (Array.isArray(q.options)) parsedOptions = q.options;
                                        else if (typeof q.options === "string") {
                                            try { parsedOptions = JSON.parse(q.options); } catch { parsedOptions = q.options.split(","); }
                                        }

                                        return (
                                            <motion.div key={q.id} className="p-3 border border-gray-200 rounded-2xl bg-white/50 shadow-lg hover:shadow-xl transition-all duration-300" whileHover={{ scale: 1.02 }}>
                                                <label className="block font-bold text-gray-800 mb-2 text-sm">{q.question}</label>

                                                {(q.type === "multiple" || q.type === "checkbox") && (
                                                    <div className="space-y-2">
                                                        {parsedOptions.length > 0 ? parsedOptions.map((opt, index) => {
                                                            const isObject = typeof opt === "object" && opt !== null;
                                                            const optionText = isObject ? opt.option || opt.name || opt.label || "Option" : opt;
                                                            const optionPrice = isObject ? parseFloat(opt.price || 0) : 0;
                                                            return (
                                                                <label key={`${q.id}-${index}`} className="flex items-center gap-2 cursor-pointer hover:bg-red-50 p-1 rounded-lg transition-colors">
                                                                    <input
                                                                        type={q.type === "multiple" ? "radio" : "checkbox"}
                                                                        name={q.type === "multiple" ? q.id : undefined}
                                                                        value={optionText}
                                                                        onChange={(e) => {
                                                                            if (q.type === "multiple") {
                                                                                setUserAnswers(prev => ({ ...prev, [q.id]: e.target.value }));
                                                                                setQuestionPrices(prev => ({ ...prev, [q.id]: optionPrice }));
                                                                            } else {
                                                                                setUserAnswers(prev => {
                                                                                    const selected = prev[q.id] || [];
                                                                                    if (e.target.checked) return { ...prev, [q.id]: [...selected, e.target.value] };
                                                                                    else return { ...prev, [q.id]: selected.filter(x => x !== e.target.value) };
                                                                                });
                                                                                setQuestionPrices(prev => {
                                                                                    const current = prev[q.id] || 0;
                                                                                    if (e.target.checked) return { ...prev, [q.id]: current + optionPrice };
                                                                                    else return { ...prev, [q.id]: current - optionPrice };
                                                                                });
                                                                            }
                                                                        }}
                                                                        className="text-red-600 focus:ring-4 focus:ring-red-300"
                                                                    />
                                                                    <span className="text-gray-700 text-sm">
                                                                        {optionText} {optionPrice > 0 ? `(₹${optionPrice})` : ""}
                                                                    </span>
                                                                </label>
                                                            );
                                                        }) : <p className="text-gray-500 italic text-sm">No options available for this question.</p>}
                                                    </div>
                                                )}

                                                {q.type === "text" && (
                                                    <input
                                                        type="text"
                                                        placeholder="Your answer..."
                                                        onChange={(e) => setUserAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                                        className="w-full border-2 border-gray-300 rounded-lg p-2 focus:ring-4 focus:ring-red-300 focus:border-red-500 transition-all shadow-sm bg-white/80"
                                                    />
                                                )}
                                            </motion.div>
                                        );
                                    })}

                                    <motion.button type="submit" className="mt-4 w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-red-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        Done
                                    </motion.button>
                                </form>
                            ) : <p className="text-gray-600 text-center text-sm">No questions found.</p>}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
