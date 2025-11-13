"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    MapPin,
    ClipboardList,
    Calendar,
    CreditCard,
    X,
} from "lucide-react";

export default function ServiceDetailsPage() {
    const { id } = useParams();
    const [discountApplied, setDiscountApplied] = useState(false);
    const router = useRouter();
    const [showPremiumPopup, setShowPremiumPopup] = useState(false);
    const [userAnswers, setUserAnswers] = useState({});
    const [questionTotal, setQuestionTotal] = useState(0);
    const [service, setService] = useState(null);
    const [cities, setCities] = useState([]);
    const [selectedCityId, setSelectedCityId] = useState(null);
    const [subServices, setSubServices] = useState([]);
    const [selectedSubService, setSelectedSubService] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [step, setStep] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);
    const [bookingData, setBookingData] = useState({
        startDate: "",
        workTime: "",
        notes: "",
    });

    // 🔹 Fetch service details
    useEffect(() => {
        const fetchService = async () => {
            const { data, error } = await supabase
                .from("services")
                .select("*")
                .eq("id", id)
                .single();
            if (error) console.error(error);
            else setService(data);
        };
        fetchService();
    }, [id]);

    // 🔹 Fetch cities
    useEffect(() => {
        const fetchCities = async () => {
            const { data, error } = await supabase.from("cities").select("*");
            if (error) console.error(error);
            else setCities(data);
        };
        fetchCities();
    }, []);

    const [salary, setSalary] = useState(6500);
    const handleProceedToPay = () => {
        setDiscountApplied(true);
    };


    const handleBooking = async () => {
        try {
            const {
                startDate,
                workTime,
                notes,
            } = bookingData;

            if (!startDate || !workTime) {
                alert("Please fill in date and time before confirming booking.");
                return;
            }

            const userResponse = await supabase.auth.getUser();
            const user = userResponse.data.user;

            if (!user) {
                alert("Please log in to confirm booking.");
                router.push("/login");
                return;
            }

            const selectedCity = cities.find((c) => c.id === selectedCityId)?.name || "N/A";
            const servicePrice = service?.price || 0;
            const subServicePrice = selectedSubService?.price || 0;
            const total = servicePrice + subServicePrice;
            const finalAmount = discountApplied ? total * 0.8 : total;

            const { data, error } = await supabase
                .from("bookings")
                .insert([
                    {
                        user_id: user.id,
                        service_name: service?.name || "N/A",
                        sub_service_name: selectedSubService?.name || "N/A",
                        city: selectedCity || "N/A",
                        service_price: service?.price || 0,
                        sub_service_price: selectedSubService?.price || 0,
                        total_price: (service?.price || 0) + (selectedSubService?.price || 0),
                        discount_applied: discountApplied,
                        final_amount: discountApplied
                            ? ((service?.price || 0) + (selectedSubService?.price || 0)) * 0.8
                            : (service?.price || 0) + (selectedSubService?.price || 0),
                    },
                ])
                .select();

            if (error) {
                console.error("❌ Supabase Insert Error:", error.message);
                alert(`Failed to save booking: ${error.message}`);
            } else {
                console.log("✅ Booking saved successfully:", data);
                alert("Booking confirmed successfully!");
            }

            alert("✅ Booking summary saved successfully!");
            router.push("/home");
        } catch (err) {
            console.error("Booking Error:", err);
            alert("❌ Failed to save booking. Please try again.");
        }
    };

    // 🔹 Handle city select
    const handleCitySelect = async (cityId) => {
        setSelectedCityId(cityId);
        const { data, error } = await supabase
            .from("sub_services")
            .select("*")
            .eq("service_id", id);

        if (error) console.error(error);
        else setSubServices(data || []);
        setStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // 🔹 Handle Sub-service click
    const handleSubServiceClick = async (subService) => {
        setSelectedSubService(subService);

        // Calculate price
        const servicePrice = service?.price || 0;
        const subPrice = subService?.price || 0;
        setTotalPrice(servicePrice + subPrice);

        const { data, error } = await supabase
            .from("sub_service_questions")
            .select("*")
            .eq("sub_service_id", subService.id);

        if (error) console.error(error);
        else setQuestions(data || []);
    };

    const closePopup = () => {
        setSelectedSubService(null);
        setQuestions([]);
    };

    if (!service) {
        return (
            <section className="min-h-screen flex items-center justify-center text-gray-600">
                Loading service details...
            </section>
        );
    }

    const handleSubServiceSelect = (sub) => {
  setSelectedSubService(sub);
  const newTotal = (service?.price || 0) + (sub?.price || 0);
  setTotalPrice(newTotal);
};

    return (
        <div className="bg-gradient-to-br from-gray-50 to-red-50 min-h-screen text-gray-900">
            {/* 🌟 Header */}
            <div className="relative w-full h-[40vh] bg-gradient-to-br from-black via-red-900 to-black flex flex-col justify-center items-center text-center px-6">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
                    <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl bottom-10 right-10 animate-pulse"></div>
                </div>
                <div className="relative z-10 text-white">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-3 drop-shadow-xl">
                        {service.name}
                    </h1>
                    <p className="text-base md:text-lg max-w-2xl mx-auto text-white/90">
                        {service.description ||
                            "Experience top-notch professional service at your doorstep."}
                    </p>
                </div>
            </div>

            {/* 🔙 Back */}
            <div className="max-w-6xl mx-auto px-6 mt-10 flex justify-start">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Services</span>
                </button>
            </div>
            {/* 💡 How It Works */} <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-red-50 text-center"> <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-12"> How <span className="text-red-600">Blinkmaid</span> Works </h2> <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 px-6"> {[MapPin, ClipboardList, Calendar, CreditCard].map((Icon, i) => (<motion.div key={i} className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-2xl transition-all border border-gray-100" whileHover={{ y: -8, scale: 1.03 }} > <div className="flex justify-center mb-4"> <Icon className="w-12 h-12 text-red-600" /> </div> <h3 className="text-xl font-bold text-gray-800 mb-3"> {["Select Your City", "Pick a Service", "Schedule & Customize", "Confirm & Pay",][i]} </h3> <p className="text-gray-600 text-base"> {["Choose your city to view accurate pricing and local availability.", "Select from our curated list of cleaning services suited to your needs.", "Pick your date, time, and preferences — we’ll match the perfect cleaner.", "Instantly book and pay securely. Sit back while we handle the rest!",][i]} </p> </motion.div>))} </div> </section>

            {/* 🔢 Step Progress Bar */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center relative px-6">
                {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="flex flex-col items-center w-1/4 relative">
                        <motion.div
                            className={`w-14 h-14 flex items-center justify-center rounded-full font-bold text-white text-lg transition-all duration-300 ${step === num
                                ? "bg-gradient-to-r from-red-500 to-red-600 scale-110 shadow-2xl ring-4 ring-red-200"
                                : step > num
                                    ? "bg-gradient-to-r from-green-500 to-green-600"
                                    : "bg-gray-300"
                                }`}
                            whileHover={{ scale: 1.1 }}
                            aria-label={`Step ${num}: ${num === 1
                                ? "City"
                                : num === 2
                                    ? "Sub-Service"
                                    : num === 3
                                        ? "Booking"
                                        : "Summary"
                                }`}
                        >
                            {step > num ? "✓" : num}
                        </motion.div>
                        <span
                            className={`mt-3 text-sm font-semibold text-center transition-colors ${step === num ? "text-red-600" : "text-gray-500"
                                }`}
                        >
                            {num === 1
                                ? "City"
                                : num === 2
                                    ? "Sub-Service"
                                    : num === 3
                                        ? "Booking"
                                        : "Summary"}
                        </span>
                    </div>
                ))}
                <div className="absolute top-7 left-6 right-6 h-1 bg-gray-200 rounded-full -z-10 shadow-inner">
                    <motion.div
                        className="h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg"
                        initial={{ width: "0%" }}
                        animate={{
                            width: step === 1 ? "0%" : step === 2 ? "25%" : step === 3 ? "50%" : step === 4 ? "75%" : "100%",
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    ></motion.div>
                </div>
            </div>

            {/* 💫 Step Container */}
            <motion.section
                className="max-w-5xl mx-auto bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-100/50 mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.4 }}
                        >
                            <h2 className="text-4xl font-extrabold text-center mb-8 text-gray-800">
                                Select Your <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">City</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {cities.map((city) => (
                                    <motion.div
                                        key={city.id}
                                        className={`p-6 rounded-2xl transition-all duration-300 border-2 shadow-lg hover:shadow-2xl cursor-pointer transform hover:scale-105 backdrop-blur-sm ${selectedCityId === city.id
                                            ? "border-red-500 bg-red-50/80 ring-4 ring-red-200"
                                            : "border-gray-200 hover:border-red-400 bg-white/50"
                                            }`}
                                        onClick={() => setSelectedCityId(city.id)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && setSelectedCityId(city.id)}
                                        aria-selected={selectedCityId === city.id}
                                        whileHover={{ y: -5 }}
                                    >
                                        <img
                                            src={city.image}
                                            alt={city.name}
                                            className="w-28 h-28 mx-auto rounded-full object-cover mb-4 border-4 border-red-100 shadow-xl"
                                        />
                                        <h3 className="text-xl font-bold text-gray-800 text-center">
                                            {city.name}
                                        </h3>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.4 }}
                        >
                            <h2 className="text-4xl font-extrabold text-center mb-8 text-gray-800">
                                Choose a <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">Sub-Service</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {subServices.map((sub) => (
                                    <motion.div
                                        key={sub.id}
                                        className={`p-6 rounded-2xl transition-all duration-300 border shadow-xl hover:shadow-2xl cursor-pointer transform hover:scale-105 backdrop-blur-sm ${selectedSubService?.id === sub.id
                                            ? "border-red-500 bg-red-50/80 ring-4 ring-red-200"
                                            : "border-gray-200 hover:border-red-400 bg-white/50"
                                            }`}
                                        onClick={() => handleSubServiceClick(sub)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubServiceClick(sub)}
                                        aria-selected={selectedSubService?.id === sub.id}
                                        whileHover={{ y: -5 }}
                                    >
                                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                                            {sub.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                            {sub.description || "No description provided."}
                                        </p>
                                        <p className="text-red-600 font-bold text-lg">₹{sub.price}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.4 }}
                        >
                            <h2 className="text-4xl font-extrabold text-center mb-8 text-gray-800">
                                Work <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">Shifts & Date</span>
                            </h2>

                            {/* Added Content */}
                            <div className="text-center mb-8 space-y-2">
                                <p className="text-lg font-semibold mt-4">
                                    Monthly Salary:{" "}
                                    {discountApplied ? (
                                        <>
                                            <span className="line-through text-gray-500">₹{salary}</span>{" "}
                                            <span className="text-green-600 font-bold">
                                                ₹{salary - salary * 0.2}
                                            </span>{" "}
                                            <span className="text-sm text-green-500">(20% discount applied)</span>
                                        </>
                                    ) : (
                                        <>₹{salary}</>
                                    )}
                                </p>

                                <p className="text-gray-600">
                                    ✨ Blinkmaid Subscribers get 20% OFF —{" "}
                                    <a
                                        onClick={() => setShowPremiumPopup(true)}
                                        className="text-red-600 hover:text-red-700 underline font-semibold cursor-pointer"
                                    >
                                        Upgrade Now
                                    </a>

                                </p>

                                <p className="text-gray-600">Daily Working Hours ~2:30 approx.</p>
                                <p className="text-gray-500 text-sm">*Estimate varies with workload, shifts, timings and location.</p>
                                <p className="text-red-600 font-bold">Start Date *</p>
                            </div>

                            <form className="space-y-6 max-w-lg mx-auto">
                                <div>
                                    <label className="block font-bold mb-2 text-gray-700 text-base" htmlFor="startDate">
                                        Start Date *
                                    </label>
                                    <input
                                        id="startDate"
                                        type="date"
                                        required
                                        className="w-full border-2 border-gray-300 rounded-lg p-3 focus:ring-4 focus:ring-red-300 focus:border-red-500 transition-all shadow-sm"
                                        onChange={(e) =>
                                            setBookingData({ ...bookingData, startDate: e.target.value })
                                        }
                                        value={bookingData.startDate || ''}
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-2 text-gray-700 text-base" htmlFor="workTime">
                                        Work Time *
                                    </label>
                                    <input
                                        id="workTime"
                                        type="time"
                                        required
                                        className="w-full border-2 border-gray-300 rounded-lg p-3 focus:ring-4 focus:ring-red-300 focus:border-red-500 transition-all shadow-sm"
                                        onChange={(e) =>
                                            setBookingData({ ...bookingData, workTime: e.target.value })
                                        }
                                        value={bookingData.workTime || ''}
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-2 text-gray-700 text-base" htmlFor="notes">
                                        Notes
                                    </label>
                                    <textarea
                                        id="notes"
                                        placeholder="Any special instructions..."
                                        className="w-full border-2 border-gray-300 rounded-lg p-3 focus:ring-4 focus:ring-red-300 focus:border-red-500 transition-all resize-none shadow-sm"
                                        rows={4}
                                        onChange={(e) =>
                                            setBookingData({ ...bookingData, notes: e.target.value })
                                        }
                                        value={bookingData.notes || ''}
                                    />
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.4 }}
                        >
                            <h2 className="text-4xl font-extrabold text-center mb-8 text-gray-800">
                                Booking <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">Summary</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6 shadow-inner">
                                    <h3 className="text-lg font-bold text-gray-800 mb-3">Booking Details</h3>
                                    <div className="space-y-2">
                                        <p><strong>City:</strong> {cities.find((c) => c.id === selectedCityId)?.name}</p>
                                        <p><strong>Service:</strong> {service.name}</p>
                                        <p><strong>Sub-Service:</strong> {selectedSubService?.name}</p>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 shadow-inner">
                                    <h3 className="text-lg font-bold text-red-800 mb-3">Pricing & Schedule</h3>
                                    <div className="space-y-2">
                                        <p>
                                            <strong>Total Price:</strong>{" "}
                                            {discountApplied ? (
                                                <>
                                                    <span className="line-through text-gray-500">₹{totalPrice}</span>{" "}
                                                    <span className="text-green-600 font-bold">
                                                        ₹{(totalPrice * 0.8).toFixed(2)}
                                                    </span>{" "}
                                                    <span className="text-sm text-green-500">(20% subscription discount applied)</span>
                                                </>
                                            ) : (
                                                <span className="text-red-600 font-bold">₹{totalPrice}</span>
                                            )}
                                        </p>

                                        <p><strong>Date:</strong> {bookingData.startDate}</p>
                                        <p><strong>Work Shift:</strong> {bookingData.workTime}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 🔘 Navigation Buttons */}
                <div className="flex justify-between items-center mt-10">
                    {step > 1 && (
                        <motion.button
                            onClick={() => setStep(step - 1)}
                            className="px-8 py-3 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-gray-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Go to previous step"
                        >
                            ← Previous
                        </motion.button>
                    )}
                    {step < 4 && (
                        <motion.button
                            onClick={() => {
                                if (step === 1 && selectedCityId) {
                                    handleCitySelect(selectedCityId);
                                } else if (step === 2 && selectedSubService) {
                                    setStep(step + 1);
                                } else if (step === 3 && bookingData.startDate && bookingData.workTime) {
                                    setStep(step + 1);
                                } else {
                                    alert('Please complete the required fields.');
                                }
                            }}
                            disabled={
                                (step === 1 && !selectedCityId) ||
                                (step === 2 && !selectedSubService) ||
                                (step === 3 && (!bookingData.startDate || !bookingData.workTime))
                            }
                            className="ml-auto px-10 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-red-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Go to next step"
                        >
                            Next →
                        </motion.button>
                    )}
                    {step === 4 && (
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleBooking}
                                className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold px-5 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md text-sm"
                            >
                                Confirm Booking
                            </button>
                        </div>

                    )}
                </div>
            </motion.section>

            {/* 💎 Blinkmaid Premium Subscription Popup */}
            <AnimatePresence>
                {showPremiumPopup && (
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
                            transition={{ duration: 0.3 }}
                            className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl max-w-md w-full p-8 relative border border-gray-100/50"
                        >
                            <button
                                onClick={() => setShowPremiumPopup(false)}
                                className="absolute top-3 right-3 text-gray-500 hover:text-red-600 transition-colors"
                                aria-label="Close popup"
                            >
                                <X size={24} />
                            </button>

                            <h3 className="text-2xl font-extrabold text-center text-gray-900 mb-3">
                                ✨ Blinkmaid Premium Subscription
                            </h3>

                            <p className="text-center text-gray-600 mb-5">
                                Get <span className="text-red-600 font-semibold">20% OFF</span> on all services every month!
                            </p>

                            <ul className="text-gray-700 space-y-2 mb-5 list-disc list-inside">
                                <li>Exclusive 15–20% discount on all bookings</li>
                                <li>Priority service scheduling</li>
                                <li>Access to special festive offers</li>
                                <li>Early access to new services</li>
                            </ul>

                            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-4 text-center mb-6 shadow-inner">
                                <p className="text-gray-800 font-bold text-lg">
                                    Subscription Fee: <span className="text-red-600">₹199/month</span>
                                </p>
                                <p className="text-gray-500 text-sm">Cancel anytime. No hidden charges.</p>
                            </div>

                            <button
                                onClick={() => {
                                    alert("Payment simulated: ₹199 subscription activated!");
                                    setDiscountApplied(true); // ✅ Apply the 20% discount
                                    setShowPremiumPopup(false); // Close popup
                                }}
                                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
                            >
                                Proceed to Pay ₹199
                            </button>


                            <p className="text-xs text-gray-500 text-center mt-2">
                                *Payment simulation only — no real charges applied.
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* 💬 Popup for Questions */}
            <AnimatePresence>
                {selectedSubService && (
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
                            <button
                                onClick={closePopup}
                                className="absolute top-3 right-3 text-gray-500 hover:text-red-600 transition-colors"
                                aria-label="Close popup"
                            >
                                <X size={24} />
                            </button>

                            <h3 className="text-xl font-extrabold text-gray-800 mb-4 text-center">
                                🧹 <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">{selectedSubService.name}</span>
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
                                        closePopup();
                                        setStep(3);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    className="space-y-4"
                                >
                                    {questions.map((q) => (
                                        <motion.div
                                            key={q.id}
                                            className="p-3 border border-gray-200 rounded-2xl bg-white/50 shadow-lg hover:shadow-xl transition-all duration-300"
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <label className="block font-bold text-gray-800 mb-2 text-sm">
                                                {q.question}
                                            </label>


                                            {(q.type === "multiple" || q.type === "checkbox") && (
                                                <div className="space-y-2">
                                                    {(Array.isArray(q.options)
                                                        ? q.options
                                                        : typeof q.options === "string"
                                                            ? q.options.split(",")
                                                            : []
                                                    ).length > 0 ? (
                                                        (Array.isArray(q.options)
                                                            ? q.options
                                                            : typeof q.options === "string"
                                                                ? q.options.split(",")
                                                                : []
                                                        ).map((opt, index) => {
                                                            // Determine label text safely
                                                            let labelText = "";
                                                            if (typeof opt === "string") labelText = opt;
                                                            else if (opt && typeof opt === "object") labelText = opt.name || opt.label || opt.title || "";
                                                            return (
                                                                <label
                                                                    key={`${q.id}-${q.type}-${index}`}
                                                                    className="flex items-center gap-2 cursor-pointer hover:bg-red-50 p-1 rounded-lg transition-colors"
                                                                >
                                                                    <input
                                                                        type={q.type === "multiple" ? "radio" : "checkbox"}
                                                                        name={q.type === "multiple" ? q.id : undefined}
                                                                        value={typeof opt === "string" ? opt : opt.id}
                                                                        onChange={(e) => {
                                                                            if (q.type === "multiple") {
                                                                                setUserAnswers((prev) => ({
                                                                                    ...prev,
                                                                                    [q.id]: e.target.value,
                                                                                }));
                                                                            } else {
                                                                                setUserAnswers((prev) => {
                                                                                    const selected = prev[q.id] || [];
                                                                                    if (e.target.checked) {
                                                                                        return {
                                                                                            ...prev,
                                                                                            [q.id]: [...selected, e.target.value],
                                                                                        };
                                                                                    } else {
                                                                                        return {
                                                                                            ...prev,
                                                                                            [q.id]: selected.filter((x) => x !== e.target.value),
                                                                                        };
                                                                                    }
                                                                                });
                                                                            }
                                                                        }}
                                                                        className="text-red-600 focus:ring-4 focus:ring-red-300"
                                                                    />
                                                                    <span className="text-gray-700 text-sm">
                                                                        {typeof opt === 'string'
                                                                            ? opt
                                                                            : opt.option || opt.name || opt.label || "Option"}
                                                                    </span>
                                                                </label>
                                                            );
                                                        })
                                                    ) : (
                                                        <p className="text-gray-500 italic text-sm">No options available for this question.</p>
                                                    )}
                                                </div>
                                            )}


                                            {q.type === "text" && (
                                                <input
                                                    type="text"
                                                    placeholder="Your answer..."
                                                    onChange={(e) =>
                                                        setUserAnswers((prev) => ({
                                                            ...prev,
                                                            [q.id]: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full border-2 border-gray-300 rounded-lg p-2 focus:ring-4 focus:ring-red-300 focus:border-red-500 transition-all shadow-sm bg-white/80"
                                                />
                                            )}
                                        </motion.div>
                                    ))}

                                    <motion.button
                                        type="submit"
                                        className="mt-4 w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-red-300"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Done
                                    </motion.button>
                                </form>
                            ) : (
                                <p className="text-gray-600 text-center text-sm">No questions found.</p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
