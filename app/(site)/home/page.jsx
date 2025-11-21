"use client";

import React, { useRef, useState } from "react";
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


// ✅ Background image for hero (changed from video to image since it's a JPG)
const bgImage = "/bg_pic.jpg"; // Hero section background image

// ✅ Background video for second section
const bgClip2 = "/videos/clip.mp4"; // Second video section

// ✅ Fallback background image (ensure you have this in public/images/)
const fallbackBg = "/images/fallback-bg.jpg"; // Add a fallback image in public/images/

// ✅ Inline Carousel Components
function Carousel({ children, className = "" }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const updateButtons = () => {
        if (!emblaApi) return;
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
    };

    React.useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("select", updateButtons);
        updateButtons();
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
            className={`absolute ${direction === "left" ? "left-2" : "right-2"} top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            <Icon size={24} />
        </button>
    );
}

// ✅ Card Component
function Card({ children, className = "" }) {
    return (
        <div className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition ${className}`}>
            {children}
        </div>
    );
}

function CardContent({ children }) {
    return <div className="p-5">{children}</div>;
}

// ✅ Main Home Page
export default function Home() {
    const { showToast } = useToast();
    const [imageError, setImageError] = useState(false);
    const [video2Error, setVideo2Error] = useState(false);

    const services = [
        {
            icon: <HiOutlineHome size={40} className="text-red-600" />,
            title: "Home Cleaning",
            desc: "Spotless, fast, and eco-friendly home cleaning solutions.",
        },
        {
            icon: <HiOutlineOfficeBuilding size={40} className="text-red-600" />,
            title: "Office Cleaning",
            desc: "Maintain a productive and hygienic workspace effortlessly.",
        },
        {
            icon: <HiOutlineTruck size={40} className="text-red-600" />,
            title: "Vehicle Cleaning",
            desc: "Mobile car washing with advanced equipment and care.",
        },
        {
            icon: <HiOutlineCog size={40} className="text-red-600" />,
            title: "Maintenance",
            desc: "AC repair, plumbing, and all-round property maintenance.",
        },
        {
            icon: <HiOutlineUserGroup size={40} className="text-red-600" />,
            title: "Professional Staff",
            desc: "Trained, verified, and customer-friendly cleaning professionals.",
        },
        {
            icon: <HiSupport size={40} className="text-red-600" />,
            title: "24/7 Support",
            desc: "We’re here for you anytime, anywhere.",
        },
    ];

    const testimonials = [
        {
            name: "John Doe",
            role: "Homeowner",
            message: "BlinkMaid transformed my home! Their service is top-notch and reliable.",
            rating: 5,
        },
        {
            name: "Jane Smith",
            role: "Office Manager",
            message: "Professional and efficient. Highly recommend for office cleaning.",
            rating: 5,
        },
        {
            name: "Mike Johnson",
            role: "Car Enthusiast",
            message: "My car has never looked better. Great mobile service!",
            rating: 5,
        },
    ];

    return (
        <div className="relative min-h-screen bg-gray-100 text-gray-900">
            {/* 🎥 Hero Background Video */}
            <div className="absolute top-0 left-0 w-full h-[65vh] md:h-[75vh] z-0 overflow-hidden">
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
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-red-900/60"></div>
            </div>

            {/* Hero Text Section */}
            <section className="relative flex flex-col justify-center items-center text-center h-[65vh] md:h-[75vh] px-6 z-10">
                <motion.h1
                    className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    Welcome to <span className="text-red-400">BlinkMaid</span> 🚗
                </motion.h1>

                <motion.p
                    className="text-lg md:text-xl text-gray-100 mt-4 max-w-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                >
                    Your one-stop platform for cleaning, maintenance, and convenience.
                </motion.p>

                <motion.a
                    href="#services"
                    className="mt-8 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold shadow-lg transition"
                    whileHover={{ scale: 1.05 }}
                >
                    Explore Services
                </motion.a>
            </section>


            {/* Services Section */}
            <section id="services" className="relative bg-white py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <motion.h2
                        className="text-4xl font-bold text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Our <span className="text-red-600">Services</span>
                    </motion.h2>

                    {/* Carousel without arrows */}
                    <Carousel className="relative">
                        <CarouselContent>
                            {services.map((s, i) => (
                                <CarouselItem key={i}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1, duration: 0.5 }}
                                    >
                                        <Card className="border-none shadow-lg hover:shadow-xl transition">
                                            <CardContent>
                                                <div className="flex flex-col items-center text-center space-y-4 py-6">
                                                    <div className="bg-red-100 p-5 rounded-full">{s.icon}</div>
                                                    <h3 className="text-xl font-semibold">{s.title}</h3>
                                                    <p className="text-gray-600">{s.desc}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {/* Removed <CarouselPrevious /> and <CarouselNext /> */}
                    </Carousel>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="relative bg-gradient-to-r from-black to-red-900 py-20 text-white">
                <div className="max-w-6xl mx-auto px-6">
                    <motion.h2
                        className="text-4xl font-bold text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        What Our <span className="text-red-400">Clients Say</span>
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.2, duration: 0.5 }}
                            >
                                <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                                    <CardContent>
                                        <div className="flex items-center mb-4">
                                            {[...Array(t.rating)].map((_, idx) => (
                                                <Star key={idx} size={20} className="text-yellow-400 fill-current" />
                                            ))}
                                        </div>
                                        <p className="text-gray-100 mb-4">"{t.message}"</p>
                                        <div>
                                            <p className="font-semibold">{t.name}</p>
                                            <p className="text-sm text-gray-300">{t.role}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section className="relative bg-white py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl font-bold mb-8">
                            About <span className="text-red-600">BlinkMaid</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                            BlinkMaid is revolutionizing the cleaning industry with cutting-edge technology and a commitment to excellence. Our team of professionals is dedicated to providing top-quality services that make your life easier and your spaces cleaner.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                            <div className="text-center">
                                <HiOutlineSparkles size={50} className="text-red-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                                <p className="text-gray-600">Using the latest tech for efficient cleaning.</p>
                            </div>
                            <div className="text-center">
                                <HiOutlineUserGroup size={50} className="text-red-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Expert Team</h3>
                                <p className="text-gray-600">Trained professionals you can trust.</p>
                            </div>
                            <div className="text-center">
                                <HiSupport size={50} className="text-red-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                                <p className="text-gray-600">Always here when you need us.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Subscription Section */}
            <section className="py-24 px-8 md:px-16 lg:px-32 bg-gray-200">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-5xl font-bold text-gray-800 mb-4">Subscription Plans</h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Save more with our 3, 6, or 12-month subscriptions — enjoy up to{" "}
                        <span className="text-red-600 font-bold">20% OFF</span> your selected service!
                    </p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                        {
                            duration: "3 Months",
                            discount: "15%",
                            basePrice: 1000,
                        },
                        {
                            duration: "6 Months",
                            discount: "18%",
                            basePrice: 1000,
                        },
                        {
                            duration: "1 Year",
                            discount: "20%",
                            basePrice: 1000,
                        },
                    ].map((plan, index) => {
                        const discountedPrice = plan.basePrice - plan.basePrice * (parseInt(plan.discount) / 100);
                        return (
                            <motion.div
                                key={index}
                                className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 shadow-lg hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 text-center border border-red-200 relative overflow-hidden"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.15, duration: 0.6 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                                <h3 className="text-3xl font-bold text-gray-800 mb-4 relative z-10">{plan.duration}</h3>
                                <p className="text-gray-600 mb-4 text-base relative z-10">
                                    Save <span className="text-red-600 font-bold">{plan.discount}</span> on your selected service
                                </p>
                                <div className="flex items-center justify-center gap-3 mb-6 relative z-10">
                                    <p className="text-xl line-through text-gray-400">₹{plan.basePrice.toFixed(2)}</p>
                                    <p className="text-4xl font-extrabold text-red-600">₹{discountedPrice.toFixed(2)}</p>
                                </div>
                                <ul className="text-gray-600 text-sm space-y-3 mb-8 relative z-10">
                                    <li className="flex items-center justify-center gap-2"><HiOutlineCheckCircle className="text-green-500" /> Includes selected cleaning service</li>
                                    <li className="flex items-center justify-center gap-2"><HiOutlineCheckCircle className="text-green-500" /> Priority customer support</li>
                                    <li className="flex items-center justify-center gap-2"><HiOutlineCheckCircle className="text-green-500" /> Flexible scheduling</li>
                                </ul>
                                <button className="bg-red-600 text-white px-8 py-3 rounded-full hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg relative z-10">
                                    Subscribe Now
                                </button>
                            </motion.div>
                        );
                    })}
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
                <div className="absolute inset-0 bg-gradient-to-r from-black to-red-900/70"></div>
                <motion.div
                    className="relative z-10 text-center text-white"
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
                        className="mt-6 inline-block px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold shadow-lg transition"
                    >
                        Get Started
                    </a>
                </motion.div>
            </section>


            {/* Enquiry Form Section */}
            <section className="py-24 px-6 md:px-20 bg-gray-50">
                <motion.div
                    className="max-w-4xl mx-auto text-center mb-16"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
                        Enquiry <span className="text-red-600">Form</span>
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Let us know your requirements, and our team will get back to you soon.
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-black mx-auto mt-6 rounded-full" />
                </motion.div>

                <motion.form
                    className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-6"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
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
                    {/* Type of Work & No. of Workers (side by side) */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Type of Work
                            </label>
                            <select
                                name="type_of_work"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
                                required
                            >
                                <option value="">Select Type</option>
                                <option>House Cleaning</option>
                                <option>Cooking</option>
                                <option>Baby Care</option>
                                <option>Senior Care</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                No. of Workers
                            </label>
                            <input
                                type="number"
                                name="number_of_workers"
                                placeholder="Enter number of workers"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="full_name"
                                placeholder="Enter your name"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone_number"
                                placeholder="Enter your phone number"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Preferred Contact Time
                            </label>
                            <input
                                type="text"
                                name="preferred_contact_time"
                                placeholder="e.g. Morning, Afternoon, Evening"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Additional Message
                        </label>
                        <textarea
                            name="message"
                            placeholder="Write your message (optional)"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
                            rows="4"
                        />
                    </div>

                    <div className="text-center">
                        <motion.button
                            type="submit"
                            className="bg-gradient-to-r from-red-600 to-black text-white px-10 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Submit Enquiry
                        </motion.button>
                    </div>
                </motion.form>
            </section>

            {/* Contact Section */}
            <section id="contact" className="relative bg-gray-200 py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <motion.h2
                        className="text-4xl font-bold text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Contact <span className="text-red-600">Us</span>
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <HiOutlineMail size={50} className="text-red-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Email</h3>
                            <p className="text-gray-600">support@blinkmaid.com</p>
                        </div>
                        <div className="text-center">
                            <HiOutlinePhone size={50} className="text-red-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Phone</h3>
                            <p className="text-gray-600">+1 (123) 456-7890</p>
                        </div>
                        <div className="text-center">
                            <HiOutlineLocationMarker size={50} className="text-red-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Location</h3>
                            <p className="text-gray-600">123 Clean St, City, State</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gradient-to-r from-black to-red-900 text-white py-6 mt-0 mb-0">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <p className="m-0">&copy; 2023 BlinkMaid. All rights reserved.</p>
                    <div className="mt-3 space-x-6">
                        <a href="#" className="hover:text-red-400 transition">Privacy Policy</a>
                        <a href="#" className="hover:text-red-400 transition">Terms of Service</a>
                        <a href="#" className="hover:text-red-400 transition">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}