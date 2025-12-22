"use client";

import React, { useRef, useState, useEffect } from "react"; // ✅ Added useEffect
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import {
    HiOutlineHome,
    HiOutlineOfficeBuilding,
    HiOutlineCog,
    HiOutlineTruck,
    HiOutlineCheckCircle,
    HiOutlineUserGroup,
    HiSupport,
    HiOutlineSparkles,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineLocationMarker,
} from "react-icons/hi";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useToast } from "@/app/components/toast/ToastContext";
import { useRouter } from "next/navigation";

// --- Existing Carousel & Card Components (omitted for brevity) ---
// (Keep Carousel, CarouselContent, CarouselItem, CarouselButton, Card, CardContent as they are)

function Carousel({ children, className = "" }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const router = useRouter();

    const updateButtons = () => {
        if (!emblaApi) return;
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
    };

    React.useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("select", updateButtons);
        updateButtons();
        // Clean up event listener on unmount
        return () => emblaApi.off("select", updateButtons);
    }, [emblaApi]);

    const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
    const scrollNext = () => emblaApi && emblaApi.scrollNext();

    return (
        <div className={`relative ${className}`}>
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">{children}</div>
            </div>
            <CarouselButton direction="left" onClick={scrollPrev} disabled={!canScrollPrev} />
            <CarouselButton direction="right" onClick={scrollNext} disabled={!canScrollNext} />
        </div>
    );
}

function CarouselContent({ children }) {
    return (
        <div className="flex">
            {React.Children.map(children, (child) =>
                React.cloneElement(child, {
                    className:
                        "flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.33%] p-3",
                })
            )}
        </div>
    );
}

function CarouselItem({ children, className = "" }) {
    return <div className={className}>{children}</div>;
}

function CarouselButton({ direction, onClick, disabled }) {
    const Icon = direction === "left" ? ChevronLeft : ChevronRight;
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`absolute ${direction === "left" ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 bg-blinkblack/80 text-blinkwhite p-3 rounded-full hover:bg-blinkred transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm`}
        >
            <Icon size={24} />
        </button>
    );
}

function Card({ children, className = "" }) {
    return (
        <div className={`bg-blinkwhite rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-blinkred/10 ${className}`}>
            {children}
        </div>
    );
}

function CardContent({ children }) {
    return <div className="p-6">{children}</div>;
}

// Helper function to assign icons based on service name (customizable)
const getServiceIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('home') || lowerName.includes('cleaning')) return <HiOutlineHome size={48} className="text-blinkred" />;
    if (lowerName.includes('office')) return <HiOutlineOfficeBuilding size={48} className="text-blinkred" />;
    if (lowerName.includes('vehicle') || lowerName.includes('car')) return <HiOutlineTruck size={48} className="text-blinkred" />;
    if (lowerName.includes('maintenance') || lowerName.includes('repair')) return <HiOutlineCog size={48} className="text-blinkred" />;
    if (lowerName.includes('staff') || lowerName.includes('professional')) return <HiOutlineUserGroup size={48} className="text-blinkred" />;
    if (lowerName.includes('support')) return <HiSupport size={48} className="text-blinkred" />;
    return <HiOutlineSparkles size={48} className="text-blinkred" />; // Default icon
};

// ✅ Main Home Page
export default function Home() {
    const [imageError, setImageError] = useState(false);
    const [video2Error, setVideo2Error] = useState(false);
    const [testimonials, setTestimonials] = useState([]); // ✅ New state for testimonials
    const [loadingTestimonials, setLoadingTestimonials] = useState(true); // ✅ New state for loading
    const [services, setServices] = useState([]); // ✅ New state for services
    const [loadingServices, setLoadingServices] = useState(true); // ✅ New state for loading services

    // --- Data Fetching Logic (Updated) ---
    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                // Fetch reviews that have status 'active' and order by creation date
                const { data, error } = await supabase
                    .from("website_reviews")
                    .select("id, name, rating, review") // Select only necessary columns
                    .eq("status", "active") // Filter for active reviews
                    .order("created_at", { ascending: false }); // Order by newest first

                if (error) {
                    console.error("Error fetching testimonials:", error);
                    toast.error("Failed to load reviews.");
                    return;
                }

                // Map the fetched data to match a simpler structure if needed, or use as-is.
                // Since the table columns map nicely to what's needed, we can use the data directly.
                const processedTestimonials = data.map(item => ({
                    name: item.name,
                    role: "Verified Client", // Using a default role as the schema doesn't include one
                    message: item.review, // Mapping 'review' to 'message'
                    rating: item.rating,
                }));

                setTestimonials(processedTestimonials);
            } catch (error) {
                console.error("Unexpected error in fetchTestimonials:", error);
                toast.error("An unexpected error occurred while loading reviews.");
            } finally {
                setLoadingTestimonials(false);
            }
        };

        const fetchServices = async () => {
            try {
                const { data, error } = await supabase
                    .from("services")
                    .select("id, name, description, image_url")
                    .order("id", { ascending: true });

                if (error) {
                    console.error("Error fetching services:", error);
                    toast.error("Failed to load services.");
                    return;
                }

                // Filter to show only unique services based on normalized name (case-insensitive, trimmed)
                if (data) {
                    const seen = new Set();
                    const uniqueServices = data.filter(service => {
                        const normalizedName = service.name.trim().toLowerCase();
                        if (seen.has(normalizedName)) return false;
                        seen.add(normalizedName);
                        return true;
                    });
                    setServices(uniqueServices);
                } else {
                    setServices([]);
                }
            } catch (error) {
                console.error("Unexpected error in fetchServices:", error);
                toast.error("Unexpected error while loading services.");
            } finally {
                setLoadingServices(false);
            }
        };


        fetchTestimonials();
        fetchServices();
    }, []); // Run once on component mount
    // ---------------------------------

    // Removed the old hardcoded 'services' array
    // const services = [...]

    // ✅ Background image for hero (changed from video to image since it's a JPG)
    const bgImage = "/bg_pic.jpg"; // Hero section background image
    const router = useRouter();

    // ✅ Background video for second section
    const bgClip2 = "/videos/clip.mp4"; // Second video section

    // ✅ Fallback background image (ensure you have this in public/images/)
    const fallbackBg = "/images/fallback-bg.jpg"; // Add a fallback image in public/images/

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
            {/* 🎥 Hero Background Video (... existing code ... ) */}
            {/* ... (Hero section remains the same) ... */}
            <div className="absolute top-0 left-0 w-full h-[70vh] md:h-[80vh] z-0 overflow-hidden">
                {!imageError ? (
                    <video
                        src="/videos/hero-bg.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Image
                        src={bgImage}
                        alt="Hero Background"
                        fill
                        priority
                        className="object-cover"
                    />
                )}
                {/* Overlay for contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-blinkblack/80 via-blinkblack/60 to-blinkred/70"></div>
            </div>

            {/* Hero Text Section (.... existing code ....) */}
            <section className="relative flex flex-col justify-center items-center text-center h-[70vh] md:h-[80vh] px-6 z-10">
                <motion.h1
                    className="text-6xl md:text-7xl font-black text-blinkwhite drop-shadow-2xl mb-6"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                >
                    Welcome to <span className="text-blinkred bg-gradient-to-r from-blinkred to-pink-400 bg-clip-text text-transparent">BlinkMaid</span>
                </motion.h1>

                <motion.p
                    className="text-xl md:text-2xl text-gray-200 mt-6 max-w-3xl leading-relaxed"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                >
                    Your one-stop platform for cleaning, maintenance, and convenience. Experience top-tier services with a touch of innovation.
                </motion.p>
                <motion.a
                    href="/services"
                    className="mt-10 px-10 py-4 bg-gradient-to-r from-blinkred to-blinkblack hover:from-blinkblack hover:to-blinkred text-blinkwhite rounded-full font-bold text-lg shadow-2xl transition-all duration-300 transform hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Explore Services
                </motion.a>

            </section>

            {/* Services Section - Premium Horizontal Scroll */}
            {/* Services Section - Premium Single Row with Images */}
            <section id="services" className="relative bg-[#0a0a0a] py-24 overflow-hidden">

                {/* Background Decorative Element */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blinkred/5 rounded-full blur-[120px] -z-10" />

                <div className="max-w-7xl mx-auto px-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-5xl md:text-6xl font-black text-white mb-4">
                            Our <span className="text-blinkred">Expertise</span>
                        </h2>
                        <div className="h-1 w-20 bg-blinkred"></div>
                    </motion.div>
                </div>

                {/* Horizontal Scroll Container */}
                <div className="relative group">
                    {!loadingServices && services.length > 0 && (
                        <div className="overflow-x-auto flex gap-6 px-[5%] pb-12 scrollbar-hide snap-x snap-mandatory cursor-grab active:cursor-grabbing">
                            {services.map((s, i) => (
                                <motion.div
                                    key={i}
                                    className="flex-shrink-0 w-[300px] md:w-[400px] snap-center"
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1, duration: 0.6 }}
                                >
                                    <div className="group relative h-[550px] rounded-3xl overflow-hidden bg-zinc-900 shadow-2xl border border-white/10">

                                        {/* Service Image Background */}
                                        <img
                                            src={
                                                s.image_url
                                                    ? s.image_url
                                                    : "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"
                                            }
                                            alt={s.name}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                                        />


                                        {/* Gradient Overlay (Ensures text readability) */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />

                                        {/* Content Overlay */}
                                        <div className="relative z-20 p-8 h-full flex flex-col justify-end">
                                            <div className="mb-4">
                                                <span className="inline-block px-3 py-1 rounded-full bg-blinkred text-white text-[10px] font-bold tracking-widest uppercase mb-3">
                                                    Service 0{i + 1}
                                                </span>
                                                <h3 className="text-3xl font-bold text-white leading-tight">
                                                    {s.name}
                                                </h3>
                                            </div>

                                            <p className="text-gray-300 text-sm leading-relaxed mb-8 transform transition-all duration-500 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
                                                {s.description}
                                            </p>

                                            <motion.a
                                                onClick={() => router.push(`/services/${s.id}`)}
                                                className="inline-flex items-center justify-center w-full py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold hover:bg-blinkred hover:border-blinkred transition-all duration-300 group/btn"
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                ENQUIRE NOW
                                                <span className="ml-2 transform group-hover/btn:translate-x-2 transition-transform">→</span>
                                            </motion.a>
                                        </div>

                                        {/* Top Right Icon/Element */}
                                        <div className="absolute top-6 right-6 z-20">
                                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-blinkred animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Custom CSS for hiding scrollbars */}
                <style jsx>{`
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `}</style>
            </section>

            {/* Testimonials Section (UPDATED) */}
            {/* Testimonials Section - High Energy Red Design */}
            <section className="relative bg-blinkred py-24 overflow-hidden">

                {/* Abstract Background Shapes for Texture */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 -right-24 w-80 h-80 bg-black/20 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    {/* Section Header */}
                    <div className="flex flex-col items-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-white text-xs font-bold tracking-widest uppercase mb-4 shadow-sm"
                        >
                            Real Stories
                        </motion.div>
                        <motion.h2
                            className="text-5xl md:text-6xl font-black text-center text-white"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                        >
                            What Our <span className="text-black/40">Clients Say</span>
                        </motion.h2>
                    </div>

                    {/* Loading State */}
                    {loadingTestimonials && (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                        </div>
                    )}

                    {/* Testimonials Grid */}
                    {!loadingTestimonials && testimonials.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {testimonials.map((t, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                    whileHover={{ y: -10 }}
                                    className="flex h-full"
                                >
                                    <div className="relative w-full bg-white/10 backdrop-blur-xl border border-white/30 rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col justify-between overflow-hidden group">

                                        {/* Corner Accent */}
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[5rem] -mr-8 -mt-8 transition-all group-hover:bg-white/10" />

                                        <div>
                                            {/* Rating Stars */}
                                            <div className="flex gap-1 mb-8">
                                                {[...Array(5)].map((_, idx) => (
                                                    <Star
                                                        key={idx}
                                                        size={18}
                                                        className={`${idx < t.rating ? 'text-white fill-white' : 'text-white/30'}`}
                                                    />
                                                ))}
                                            </div>

                                            {/* Message */}
                                            <p className="text-white text-xl font-medium leading-relaxed italic mb-8">
                                                "{t.message}"
                                            </p>
                                        </div>

                                        {/* User Info */}
                                        <div className="flex items-center gap-4 border-t border-white/20 pt-8">
                                            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-blinkred font-black text-xl shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                                                {t.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-extrabold text-lg tracking-tight leading-none uppercase">
                                                    {t.name}
                                                </h4>
                                                <p className="text-white/60 text-xs font-bold mt-1 tracking-wider uppercase">
                                                    {t.role || "Verified Client"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Subscription Section - Premium Tiered Design */}
            <section id="pricing" className="relative bg-[#f8f9fa] py-24 overflow-hidden">

                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blinkred/5 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gray-200 rounded-full blur-[120px] -z-10" />

                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        className="text-center mb-20"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-blinkred font-bold tracking-[0.2em] uppercase text-sm">Transparent Pricing</span>
                        <h2 className="text-5xl md:text-6xl font-black text-gray-900 mt-4 mb-6">
                            Choose Your <span className="text-blinkred">Freedom.</span>
                        </h2>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                            Unlock long-term peace of mind with our subscription tiers.
                            Enjoy <span className="text-gray-900 font-bold">priority staffing</span> and significant savings.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        {[
                            {
                                duration: "3 Months",
                                tagline: "Essential Plan",
                                price: 5999,
                                features: [
                                    "1 Free Replacement",
                                    "10% Monthly Salary Discount",
                                    "24/7 Support",
                                ],
                                popular: false,
                            },
                            {
                                duration: "6 Months",
                                tagline: "Most Recommended",
                                price: 11999,
                                features: [
                                    "1 Free Replacement",
                                    "10% Monthly Salary Discount",
                                    "24/7 Support",
                                ],
                                popular: true,
                            },
                            {
                                duration: "12 Months",
                                tagline: "Best Value",
                                price: 19999,
                                features: [
                                    "1 Free Replacement",
                                    "10% Monthly Salary Discount",
                                    "24/7 Support",
                                ],
                                popular: false,
                            },
                        ].map((plan, index) => (
                            <motion.div
                                key={index}
                                className={`relative group p-[2px] rounded-[2.5rem] transition-all duration-500 ${plan.popular ? 'bg-gradient-to-b from-blinkred to-pink-500 scale-105 z-10 shadow-2xl' : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -20 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {/* Internal Card */}
                                <div className="bg-white rounded-[2.4rem] p-10 h-full flex flex-col relative overflow-hidden">

                                    {plan.popular && (
                                        <div className="absolute top-0 right-0 bg-blinkred text-white text-[10px] font-black px-6 py-2 rounded-bl-2xl uppercase tracking-tighter">
                                            Best Seller
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <h3 className="text-sm font-bold text-blinkred uppercase tracking-widest mb-2">{plan.tagline}</h3>
                                        <p className="text-4xl font-black text-gray-900">{plan.duration}</p>
                                    </div>

                                    <div className="flex items-baseline gap-1 mb-8">
                                        <span className="text-4xl font-black text-gray-900">₹{plan.price.toLocaleString()}</span>
                                        <span className="text-gray-400 font-medium text-sm">/flat</span>
                                    </div>

                                    <div className="h-px w-full bg-gray-100 mb-8" />

                                    <ul className="space-y-5 mb-10 flex-grow">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3 text-gray-600 font-medium text-sm">
                                                <div className={`p-1 rounded-full ${plan.popular ? 'bg-blinkred/10 text-blinkred' : 'bg-gray-100 text-gray-400'}`}>
                                                    <HiOutlineCheckCircle size={18} />
                                                </div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Second Video Section with Fallback */}
            <section className="relative h-[70vh] flex items-center justify-center">
                {!video2Error ? (
                    <video
                        src={bgClip2}
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster={fallbackBg}
                        onError={() => setVideo2Error(true)}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <Image
                        src={fallbackBg}
                        alt="Fallback Background"
                        fill
                        className="object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-blinkblack to-blinkred/70"></div>
                <motion.div
                    className="relative z-10 text-center text-blinkwhite"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-4xl font-bold mb-4">Reliable. Smart. Clean.</h2>
                    <p className="text-lg max-w-xl mx-auto">
                        BlinkMaid — simplifying your cleaning experience through modern technology and trusted professionals.
                    </p>
                    <a
                        href="#contact"
                        className="mt-6 inline-block px-8 py-3 bg-blinkred hover:bg-blinkred/80 text-blinkwhite rounded-full font-semibold shadow-lg transition"
                    >
                        Get Started
                    </a>
                </motion.div>
            </section>


            {/* Enquiry Form Section - Dark Premium Dashboard */}
            <section id="contact" className="relative py-24 bg-white overflow-hidden">

                <div className="max-w-7xl mx-auto px-6 relative">
                    <div className="flex flex-col lg:flex-row gap-0 items-stretch rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-gray-100">

                        {/* Left Side: Dark Info Panel */}
                        <motion.div
                            className="lg:w-1/3 bg-[#111111] p-12 text-white flex flex-col justify-between"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div>
                                <div className="w-12 h-1 bg-blinkred mb-8"></div>
                                <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                                    Let's Start Your <br />
                                    <span className="text-blinkred">Journey.</span>
                                </h2>
                                <p className="text-gray-400 text-lg leading-relaxed mb-10">
                                    Submit your details and experience the gold standard of professional cleaning.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div className="group flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blinkred transition-colors duration-500">
                                        <HiSupport size={24} className="text-blinkred group-hover:text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-500">Fast Response</p>
                                        <p className="text-white font-bold">Within 2 Hours</p>
                                    </div>
                                </div>

                                <div className="group flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blinkred transition-colors duration-500">
                                        <HiOutlineCheckCircle size={24} className="text-blinkred group-hover:text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-500">Verified Pros</p>
                                        <p className="text-white font-bold">100% Background Checked</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Side: The Form (Darker Accents) */}
                        <motion.div
                            className="lg:w-2/3 w-full bg-[#1a1a1a] p-8 md:p-16"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                        >
                            <form
                                className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8"
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = {
                                        number_of_workers: e.target.number_of_workers.value,
                                        type_of_work: e.target.type_of_work.value,
                                        full_name: e.target.full_name.value,
                                        email: e.target.email.value,
                                        phone_number: e.target.phone_number.value,
                                        preferred_contact_time: e.target.preferred_contact_time.value,
                                        message: e.target.message.value,
                                    };
                                    try {
                                        const { error } = await supabase.from("enquiries").insert([formData]);
                                        if (error) throw error;
                                        toast.success("Enquiry submitted successfully!");
                                        e.target.reset();
                                    } catch (err) {
                                        toast.error("Failed to submit enquiry");
                                    }
                                }}
                            >
                                {/* Custom Styled Inputs - Dark Mode */}
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase text-blinkred tracking-[0.2em]">Service Type</label>
                                    <select
                                        name="type_of_work"
                                        className="w-full bg-[#222222] border-none rounded-xl px-6 py-4 text-white focus:ring-2 focus:ring-blinkred transition-all appearance-none cursor-pointer outline-none"
                                        required
                                    >
                                        <option value="" className="bg-[#222222]">Select Service</option>
                                        <option className="bg-[#222222]">Cooking</option>
                                        <option className="bg-[#222222]">Baby Care</option>
                                        <option className="bg-[#222222]">Senior Care</option>
                                                                                <option className="bg-[#222222]">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase text-blinkred tracking-[0.2em]">Team Size</label>
                                    <input
                                        type="number"
                                        name="number_of_workers"
                                        placeholder="e.g. 2"
                                        className="w-full bg-[#222222] border-none rounded-xl px-6 py-4 text-white focus:ring-2 focus:ring-blinkred transition-all outline-none"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase text-blinkred tracking-[0.2em]">Your Name</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        placeholder="Full Name"
                                        className="w-full bg-[#222222] border-none rounded-xl px-6 py-4 text-white focus:ring-2 focus:ring-blinkred transition-all outline-none"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase text-blinkred tracking-[0.2em]">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="email@example.com"
                                        className="w-full bg-[#222222] border-none rounded-xl px-6 py-4 text-white focus:ring-2 focus:ring-blinkred transition-all outline-none"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase text-blinkred tracking-[0.2em]">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        placeholder="Mobile Number"
                                        className="w-full bg-[#222222] border-none rounded-xl px-6 py-4 text-white focus:ring-2 focus:ring-blinkred transition-all outline-none"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase text-blinkred tracking-[0.2em]">Best Time to Call</label>
                                    <input
                                        type="text"
                                        name="preferred_contact_time"
                                        placeholder="Morning / Evening"
                                        className="w-full bg-[#222222] border-none rounded-xl px-6 py-4 text-white focus:ring-2 focus:ring-blinkred transition-all outline-none"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-xs font-black uppercase text-blinkred tracking-[0.2em]">Your Message</label>
                                    <textarea
                                        name="message"
                                        rows="3"
                                        placeholder="Anything else we should know?"
                                        className="w-full bg-[#222222] border-none rounded-xl px-6 py-4 text-white focus:ring-2 focus:ring-blinkred transition-all outline-none"
                                    ></textarea>
                                </div>

                                <div className="md:col-span-2 pt-6">
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.02, backgroundColor: "#ffffff", color: "#000000" }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full bg-blinkred py-5 rounded-2xl text-white font-black uppercase tracking-[0.2em] shadow-2xl transition-all duration-300"
                                    >
                                        Confirm Inquiry
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Contact Section - Premium Location & Contact Info */}
            <section id="contact-info" className="relative bg-white pb-24 overflow-hidden">
                {/* Soft background glow */}
                <div className="absolute top-1/2 left-0 w-72 h-72 bg-blinkred/5 rounded-full blur-[120px] -z-10" />

                <div className="max-w-7xl mx-auto px-6 relative">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-blinkred font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Get In Touch</span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900">
                            Contact <span className="text-blinkred">Us</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <HiOutlineMail size={32} />,
                                title: "Email Support",
                                detail: "support@blinkmaid.com",
                                sub: "Response within 2 hours"
                            },
                            {
                                icon: <HiOutlinePhone size={32} />,
                                title: "Call Anytime",
                                detail: "+91 93804 19755",
                                sub: "Mon - Sun, 9am - 9pm"
                            },
                            {
                                icon: <HiOutlineLocationMarker size={32} />,
                                title: "Our Headquarters",
                                detail: "No. 33, Shop No.01, Telecom Layout Main Road,",
                                sub: "Ashwathnagar, Thanisandra, Bengaluru-560077"
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                className="group bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)] transition-all duration-500 text-center relative overflow-hidden"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -10 }}
                            >
                                {/* Animated Background Accent */}
                                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blinkred/5 rounded-full group-hover:scale-[2] transition-transform duration-700" />

                                <div className="relative z-10">
                                    <div className="w-20 h-20 bg-gray-50 text-blinkred rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-blinkred group-hover:text-white transition-all duration-300 shadow-inner">
                                        {item.icon}
                                    </div>

                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-3">
                                        {item.title}
                                    </h3>

                                    <p className="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-blinkred transition-colors">
                                        {item.detail}
                                    </p>

                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                        {item.sub}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}