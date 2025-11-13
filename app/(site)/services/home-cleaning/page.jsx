"use client";
import { useState } from "react";
import {
    Star,
    Plus,
    X,
    CheckCircle,
    MapPin,
    Brush,        // 🧹 Replace Broom with Brush
    Calendar,
    CreditCard,
} from "lucide-react";
import { Sparkles } from "lucide-react";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HomeCleaningPage() {
    const [step, setStep] = useState(1);
    const [selectedCity, setSelectedCity] = useState("");
    const [gender, setGender] = useState("female");
    const [showPopup, setShowPopup] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);

    // 👇 Subscription state (can later be fetched from Supabase)
    const [isSubscribed, setIsSubscribed] = useState(false);
    const discountedPrice = isSubscribed ? totalPrice * 0.8 : totalPrice;

    const [formData, setFormData] = useState({
        houseSize: "",
        floors: "",
        hasDog: "",
        startDate: "",
        shiftTime: "",
        notes: "",
        preference: "",
    });

    // Replace your existing cities array with this:
    const cities = [
        { name: "Delhi", icon: "🏛️", multiplier: 1.2 },     // +20% base rate
        { name: "Chennai", icon: "🏗️", multiplier: 1.0 },    // normal rate
        { name: "Hyderabad", icon: "🏰", multiplier: 0.9 },   // -10%
        { name: "Bengaluru", icon: "🏯", multiplier: 1.1 },   // +10%
    ];

    const mainService = {
        title: "Brooming, Mopping",
        price: 2500,
        rating: "4.9",
        desc: "Complete floor cleaning and sanitization for a sparkling clean space.",
        img: "/home-cleaning.jpg",
    };

    const addons = [
        {
            title: "Bathroom Cleaning",
            price: 500,
            rating: "4.8",
            desc: "Thorough bathroom cleaning for a hygienic space.",
            img: "/bathroom-cleaning.jpg",
        },
        {
            title: "Dusting",
            price: 800,
            rating: "4.9",
            desc: "Professional dusting service for a spotless dust-free home.",
            img: "/dusting.jpg",
        },
        {
            title: "Dish-washing",
            price: 500,
            rating: "4.7",
            desc: "Expert dishwashing service ensuring spotless, sanitized dishes.",
            img: "/dishwashing.jpg",
        },
    ];

    const handleServiceClick = (service) => {
        setSelectedService(service);
        setTotalPrice(service.price);
        setShowPopup(true);
    };

    const calculatePrice = (updatedData) => {
        let base = selectedService ? selectedService.price : 0;

        // Adjust by city multiplier
        const cityMultiplier =
            cities.find((c) => c.name === selectedCity)?.multiplier || 1;
        base *= cityMultiplier;

        switch (updatedData.houseSize) {
            case "2 BHK":
                base += 300;
                break;
            case "3 BHK":
                base += 600;
                break;
            case "4 BHK":
                base += 900;
                break;
            case "5 BHK":
                base += 1200;
                break;
            case "Villa":
                base += 2000;
                break;
        }

        const floors = parseInt(updatedData.floors) || 1;
        base += (floors - 1) * 400;

        if (updatedData.hasDog === "Yes") base += 300;

        setTotalPrice(base);
    };


    const handleInputChange = (key, value) => {
        const updated = { ...formData, [key]: value };
        setFormData(updated);
        calculatePrice(updated);
    };

    const handleConfirm = () => {
        if (!formData.houseSize || !formData.floors || !formData.hasDog) {
            alert("Please select all options!");
            return;
        }
        setShowPopup(false);
        setStep(4);
    };

    const handleShiftConfirm = () => {
        if (!formData.startDate || !formData.shiftTime) {
            alert("Please fill all fields!");
            return;
        }
        setStep(5);
    };

    return (
        <section className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen text-gray-900">
            {/* Hero Section with Image Background */}
            <div
                className="relative w-full h-[65vh] bg-cover bg-center"
                style={{
                    backgroundImage: "url('/bg_pic.jpg')", // Add your image in /public
                }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>

                {/* Text Overlay */}
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-3 drop-shadow-lg">
                        Professional <span className="text-red-400">Home Cleaning</span>
                    </h1>
                    <p className="text-lg md:text-xl max-w-2xl text-gray-100">
                        Hassle-free, trusted and affordable cleaning services — from kitchens to bedrooms.
                    </p>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="bg-white py-20 px-6 text-center">
                <h2 className="text-4xl font-extrabold text-gray-800 mb-10">
                    How <span className="text-red-600">Blinkmaid</span> Works
                </h2>

                <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {[
                        {
                            icon: <MapPin className="w-10 h-10 text-red-600" />,
                            title: "Select Your City",
                            desc: "Choose your city to view accurate pricing and local availability.",
                        },
                        {
                            icon: <Brush className="w-10 h-10 text-red-600" />,
                            title: "Pick a Service",
                            desc: "Select from our curated list of cleaning services suited to your needs.",
                        },
                        {
                            icon: <Calendar className="w-10 h-10 text-red-600" />,
                            title: "Schedule & Customize",
                            desc: "Pick your date, time, and preferences — we’ll match the perfect cleaner.",
                        },
                        {
                            icon: <CreditCard className="w-10 h-10 text-red-600" />,
                            title: "Confirm & Pay",
                            desc: "Instantly book and pay securely. Sit back while we handle the rest!",
                        },
                    ]
                        .map((step, i) => (
                            <motion.div
                                key={i}
                                className="p-6 bg-gradient-to-b from-white to-red-50 rounded-3xl shadow-md border border-red-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="text-5xl mb-4">{step.icon}</div>
                                <h3 className="font-bold text-xl text-gray-800 mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 text-sm">{step.desc}</p>
                            </motion.div>
                        ))}
                </div>
            </div>


            {/* Step Indicator */}
            <div className="flex justify-center items-center mt-10 mb-6 space-x-4">
                {[1, 2, 3, 4, 5].map((num, idx) => (
                    <div key={num} className="flex items-center">
                        {/* Step Circle */}
                        <div className="relative flex flex-col items-center">
                            <motion.div
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg border-2 transition-all duration-300
            ${step === num
                                        ? "bg-red-500 border-red-500 text-white shadow-lg scale-110"
                                        : step > num
                                            ? "bg-green-500 border-green-500 text-white"
                                            : "bg-gray-200 border-gray-300 text-gray-600"
                                    }`}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: step === num ? 1.1 : 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {step > num ? <CheckCircle size={20} /> : num}
                            </motion.div>
                            <p
                                className={`text-sm mt-2 font-medium ${step >= num ? "text-red-600" : "text-gray-500"
                                    }`}
                            >
                                Step {num}
                            </p>
                        </div>

                        {/* Line Connector */}
                        {idx !== 4 && (
                            <div
                                className={`w-16 h-1 mx-2 rounded transition-all duration-300 
            ${step > num ? "bg-red-500" : "bg-gray-300"}`}
                            ></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: City */}
            {step === 1 && (
                <motion.div
                    className="py-20 bg-gradient-to-b from-white to-red-50 text-center px-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-3">
                        Select Your <span className="text-red-600">City</span>
                    </h2>
                    <p className="text-gray-600 mb-14 text-lg">
                        Choose where you’d like to book a Blinkmaid cleaning service.
                    </p>

                    {/* City Cards Grid */}
                    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 justify-center">
                        {cities.map((city, index) => (
                            <motion.button
                                key={index}
                                onClick={() => setSelectedCity(city.name)}
                                className={`group flex flex-col items-center p-8 rounded-3xl border-2 transition-all duration-300 shadow-md hover:shadow-2xl hover:-translate-y-2 ${selectedCity === city.name
                                    ? "bg-gradient-to-b from-red-100 to-red-50 border-red-600"
                                    : "bg-white border-gray-200 hover:border-red-400"
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="w-24 h-24 flex items-center justify-center rounded-full border-4 border-red-300 bg-gradient-to-br from-red-50 to-white text-5xl mb-5 group-hover:scale-110 transition-transform duration-300">
                                    {city.icon}
                                </div>
                                <h3 className="font-bold text-lg text-gray-800 group-hover:text-red-600 transition-colors">
                                    {city.name}
                                </h3>
                            </motion.button>
                        ))}
                    </div>

                    {/* Next Button */}
                    {selectedCity && (
                        <motion.button
                            onClick={() => setStep(2)}
                            className="mt-14 px-12 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-semibold hover:scale-105 transition-transform duration-300 shadow-lg"
                            whileHover={{ scale: 1.05 }}
                        >
                            Next: Select Service
                        </motion.button>
                    )}
                </motion.div>
            )}


            {/* Step 2: Services */}
            {step === 2 && (
                <motion.div
                    className="py-16 px-4 bg-gray-50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-lg p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-semibold text-gray-800">Select a Service</h1>
                            <button onClick={() => setStep(1)} className="text-red-600 hover:underline">
                                ← Change City ({selectedCity})
                            </button>
                        </div>

                        {/* Gender Toggle */}
                        <div className="flex justify-center mb-10">
                            <div className="flex bg-gray-100 rounded-full p-2 shadow-inner">
                                {["male", "female"].map((g) => (
                                    <button
                                        key={g}
                                        onClick={() => setGender(g)}
                                        className={`px-6 py-2 rounded-full font-medium capitalize transition ${gender === g
                                            ? "bg-red-500 text-white shadow"
                                            : "text-gray-700 hover:bg-red-100"
                                            }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {[mainService, ...addons].map((s, i) => (
                            <motion.div
                                key={i}
                                className="flex flex-col sm:flex-row items-center gap-5 border rounded-2xl shadow-sm p-5 hover:shadow-lg transition mb-4 bg-white"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                            >
                                <img
                                    src={s.img}
                                    alt={s.title}
                                    className="w-28 h-28 rounded-xl object-cover"
                                />
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-800">{s.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
                                    <p className="text-red-600 font-semibold mt-2">
                                        ₹{s.price} / month
                                    </p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <Star className="text-yellow-400 w-5 h-5" />
                                    <p className="text-xs">{s.rating}</p>
                                    <button
                                        onClick={() => handleServiceClick(s)}
                                        className="mt-3 bg-red-500 text-white rounded-full p-3 shadow hover:bg-red-600 transition"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* STEP 4 - Work Shifts & Date */}
            {step === 4 && (
                <motion.div
                    className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="max-w-2xl w-full bg-white rounded-3xl shadow-lg p-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                            Work Shifts & Date
                        </h2>

                        {/* 💰 Price Summary with Subscription Logic */}
                        <div className="border-t pt-4 mb-8 text-center">
                            {isSubscribed ? (
                                <>
                                    <p className="text-lg font-semibold text-gray-700">
                                        Monthly Salary:
                                        <span className="text-gray-500 line-through ml-2">
                                            ₹{totalPrice}.00
                                        </span>{" "}
                                        <span className="text-green-600 font-bold ml-2">
                                            ₹{discountedPrice.toFixed(2)} (20% off)
                                        </span>
                                    </p>
                                    <p className="text-sm text-green-600 font-medium mt-1">
                                        🎉 Subscription discount applied — Blinkmaid thanks you for being a valued member!
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-lg font-semibold text-gray-700">
                                        Monthly Salary:{" "}
                                        <span className="text-red-600 font-bold">
                                            ₹{totalPrice}.00
                                        </span>
                                    </p>
                                    <p className="text-sm text-blue-600 font-medium mt-2">
                                        ✨ Blinkmaid Subscribers get <b>20% OFF</b> —{" "}
                                        <button
                                            onClick={() => setShowSubscriptionPopup(true)}
                                            className="underline text-red-600 hover:text-red-700 font-semibold"
                                        >
                                            Upgrade Now
                                        </button>
                                    </p>
                                </>
                            )}

                            <p className="text-sm text-gray-500 mt-3">
                                Daily Working Hours ~2:30 approx. <br />
                                *Estimate varies with workload, shifts, timings and location.
                            </p>
                        </div>

                        {/* Start Date */}
                        <div className="mb-6">
                            <label className="font-semibold text-gray-700">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-red-500"
                                value={formData.startDate}
                                onChange={(e) => handleInputChange("startDate", e.target.value)}
                            />
                        </div>

                        {/* Shift Time */}
                        <div className="mb-6">
                            <label className="font-semibold text-gray-700">
                                Work Shift Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-red-500"
                                value={formData.shiftTime}
                                onChange={(e) => handleInputChange("shiftTime", e.target.value)}
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                Surge pricing between <b>7:00 - 7:30 am/pm</b> <br />
                                Special discounts between <b>12:00 PM - 4:00 PM</b>
                            </p>
                        </div>

                        {/* Notes */}
                        <div className="mb-6">
                            <label className="font-semibold text-gray-700">Notes</label>
                            <textarea
                                rows={3}
                                placeholder="Any special instructions..."
                                className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-red-500"
                                value={formData.notes}
                                onChange={(e) => handleInputChange("notes", e.target.value)}
                            />
                        </div>

                        {/* Confirm */}
                        <button
                            onClick={handleShiftConfirm}
                            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-full font-semibold hover:scale-105 transition shadow-lg"
                        >
                            Confirm & Submit Booking
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Subscription Popup */}
            {showSubscriptionPopup && (
                <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <button
                            onClick={() => setShowSubscriptionPopup(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-black"
                        >
                            <X size={22} />
                        </button>

                        <h2 className="text-2xl font-bold text-center text-red-600 mb-4">
                            🎉 Blinkmaid Premium Subscription
                        </h2>

                        <p className="text-gray-700 text-center mb-4">
                            Get <b>20% OFF</b> on all services every month!
                        </p>

                        <ul className="text-gray-600 mb-6 space-y-2 list-disc list-inside">
                            <li>Exclusive 15–20% discount on all bookings</li>
                            <li>Priority service scheduling</li>
                            <li>Access to special festive offers</li>
                            <li>Early access to new services</li>
                        </ul>

                        <div className="text-center mb-6">
                            <p className="font-semibold text-lg text-gray-800 mb-2">Subscription Fee: ₹199/month</p>
                            <p className="text-sm text-gray-500">Cancel anytime. No hidden charges.</p>
                        </div>

                        <button
                            onClick={() => {
                                setIsSubscribed(true);
                                setShowSubscriptionPopup(false);
                                alert("Thank you for subscribing to Blinkmaid Premium!");
                            }}
                            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-full font-semibold hover:scale-105 transition"
                        >
                            Proceed to Pay ₹199
                        </button>

                        <p className="text-center text-xs text-gray-400 mt-3">
                            *Payment simulation only — no real charges applied.
                        </p>
                    </motion.div>
                </motion.div>
            )}

            {/* Step 5: Summary & Payment */}
            {step === 5 && (
                <motion.div
                    className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex flex-col items-center justify-center py-12 px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
                        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
                            Summary & Payment
                        </h2>

                        {/* Summary Section */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-3 text-gray-700">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                                    🏠 Booking Details
                                </h3>
                                <p><b>City:</b> {selectedCity}</p>
                                <p><b>Service:</b> {selectedService?.title}</p>
                                <p><b>House Size:</b> {formData.houseSize}</p>
                                <p><b>Floors:</b> {formData.floors}</p>
                                <p><b>Pet(s):</b> {formData.hasDog}</p>
                            </div>

                            <div className="space-y-3 text-gray-700">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                                    🕒 Schedule Details
                                </h3>
                                <p><b>Start Date:</b> {formData.startDate}</p>
                                <p><b>Shift Time:</b> {formData.shiftTime}</p>
                                <p><b>Preference:</b> {formData.preference || "No Preference"}</p>
                                <p><b>Notes:</b> {formData.notes || "None"}</p>
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-gradient-to-r from-red-100 to-red-200 rounded-2xl p-6 text-center shadow-inner">
                            {isSubscribed ? (
                                <>
                                    <p className="text-xl font-bold text-gray-800">
                                        Monthly Salary:{" "}
                                        <span className="line-through text-gray-500">
                                            ₹{totalPrice}.00
                                        </span>{" "}
                                        <span className="text-green-600 font-extrabold ml-2">
                                            ₹{discountedPrice.toFixed(2)} (20% OFF)
                                        </span>
                                    </p>
                                    <p className="text-sm text-green-700 mt-2">
                                        🎉 Blinkmaid Premium Discount Applied!
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-xl font-bold text-gray-800">
                                        Monthly Salary:{" "}
                                        <span className="text-red-600 font-extrabold">
                                            ₹{totalPrice}.00 approx.
                                        </span>
                                    </p>
                                    <p className="text-sm text-blue-700 mt-2">
                                        ✨ Subscribe to Blinkmaid Premium for <b>20% OFF</b> on your next booking!
                                    </p>
                                </>
                            )}

                            <p className="text-sm text-gray-600 mt-4">
                                ⏰ Daily Working Hours ~2:30 approx. <br />
                                <i>*Estimate varies with workload, shifts, and location.</i>
                            </p>
                        </div>

                        {/* Payment Actions */}
                        <div className="mt-10 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => alert("Redirecting to payment gateway...")}
                                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-full font-semibold hover:from-red-600 hover:to-red-700 hover:scale-[1.03] transition-all shadow-md"
                            >
                                💰 Make Payment
                            </button>

                            <button
                                onClick={() => setStep(4)}
                                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-full font-medium hover:bg-gray-100 transition-all"
                            >
                                ← Back to Work Shifts
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}


            {/* Popup */}
            {showPopup && selectedService && (
                <motion.div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {/* Header Gradient */}
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-5 px-6">
                            <h2 className="text-2xl font-semibold text-center">
                                {selectedService.title}
                            </h2>
                            <button
                                onClick={() => setShowPopup(false)}
                                className="absolute top-4 right-4 text-white/80 hover:text-white transition"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Body Content */}
                        <div className="p-8 space-y-6">
                            {/* Description */}
                            <p className="text-gray-600 text-center text-sm leading-relaxed">
                                Customize your preferences below to help us assign the right staff for your home.
                            </p>

                            {/* House Size */}
                            <div>
                                <label className="block font-medium text-gray-700 mb-2">
                                    Select House Size
                                </label>
                                <select
                                    value={formData.houseSize}
                                    onChange={(e) => handleInputChange("houseSize", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                                >
                                    <option value="">Select</option>
                                    {["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "Villa"].map((opt) => (
                                        <option key={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Floors */}
                            <div>
                                <label className="block font-medium text-gray-700 mb-2">
                                    Number of Floors
                                </label>
                                <select
                                    value={formData.floors}
                                    onChange={(e) => handleInputChange("floors", e.target.value.split(" ")[0])}
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                                >
                                    <option value="">Select</option>
                                    {["1 Floor", "2 Floors", "3 Floors", "4 Floors", "5 Floors"].map((opt) => (
                                        <option key={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Pets */}
                            <div>
                                <label className="block font-medium text-gray-700 mb-2">
                                    Do You Have Pets?
                                </label>
                                <select
                                    value={formData.hasDog}
                                    onChange={(e) => handleInputChange("hasDog", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                                >
                                    <option value="">Select</option>
                                    {["Yes", "No"].map((opt) => (
                                        <option key={opt}>{opt}</option>
                                    ))}
                                </select>
                                <p className="text-sm text-gray-500 mt-1">
                                    Helps us assign pet-friendly professionals.
                                </p>
                            </div>

                            {/* Price */}
                            <div className="text-center mt-4">
                                <p className="text-lg font-bold text-red-600">
                                    Estimated Total: ₹{totalPrice}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    *Price varies slightly with shift and location.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowPopup(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-full font-medium hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-full font-semibold hover:scale-[1.03] transition-all shadow-md"
                                >
                                    Confirm & Continue →
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

        </section>
    );
}