"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ChevronDown } from "lucide-react";
import {
  HiOutlineUserGroup,
  HiOutlineSupport,
  HiOutlineMail,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Service {
  id: number;
  name: string;
  price: number;
  description: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const router = useRouter();



  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, price, description");

      if (error) {
        console.error("Error fetching services:", error);
        return;
      }

      const unique: Service[] = [];
      const seen = new Set();

      data.forEach((service) => {
        if (!seen.has(service.name)) {
          seen.add(service.name);
          unique.push(service);
        }
      });

      setServices(unique);
    };

    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("website_reviews")
        .select("id, name, rating, review")
        .eq("status", "active") // Only fetch active reviews
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
        return;
      }

      setReviews(data);
    };

    fetchServices();
    fetchReviews();
  }, []);


  // Static sections
  const whyChooseUs = [
    {
      title: "Authentic and Reliable",
      description:
        "We’re not an agency, but a young startup run by a passionate group of professionals.",
      icon: <HiOutlineUserGroup size={50} className="text-red-600" />,
      color: "bg-red-50",
    },
    {
      title: "Affordable Prices",
      description:
        "Quality services that don’t break your wallet — transparent pricing, no hidden costs.",
      icon: <HiOutlineSupport size={50} className="text-red-600" />,
      color: "bg-red-50",
    },
    {
      title: "24/7 Customer Support",
      description:
        "Our executives are always there to listen and solve your issues quickly.",
      icon: <HiOutlineMail size={50} className="text-red-600" />,
      color: "bg-red-50",
    },
  ];

  const testimonials = [
    {
      name: "John Doe",
      role: "Homeowner",
      description: "A satisfied homeowner who values cleanliness and efficiency.",
      message: "BlinkMaid's home cleaning service is outstanding. Highly recommend!",
      rating: 5,
    },
    {
      name: "Jane Smith",
      role: "Office Manager",
      description: "Experienced office manager focused on maintaining professional spaces.",
      message: "Professional and efficient. Our office has never looked better.",
      rating: 5,
    },
    {
      name: "Alex Johnson",
      role: "Business Owner",
      description: "Entrepreneur who prioritizes spotless environments for productivity.",
      message: "Excellent service! My office space is always spotless after their visit.",
      rating: 5,
    },
  ];
  const [reviews, setReviews] = useState<{ id: number; name: string; rating: number; review: string }[]>([]);

  const faqs = [
    {
      question: "How do I book a service?",
      answer:
        "Simply select your service, choose a date and time, and confirm your booking online.",
    },
    {
      question: "Are your cleaners verified?",
      answer:
        "Yes, all our professionals are background-checked and trained for quality service.",
    },
    {
      question: "What areas do you service?",
      answer:
        "We service residential and commercial properties in major cities. Contact us for specific locations and availability.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      {/* Header Section */}
      <section className="relative bg-gradient-to-r from-black via-red-900 to-black py-24 px-6 text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-black/20"></div>
        <motion.h1
          className="text-6xl md:text-7xl font-extrabold mb-6 relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          Our <span className="text-red-400 bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">Services</span>
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-8 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Book trusted and verified professionals for all your cleaning and maintenance needs. We make your spaces shine effortlessly.
        </motion.p>
        <motion.button
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-10 py-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105"
          whileHover={{ scale: 1.05 }}
        >
          Explore Now
        </motion.button>
      </section>

      {/* Explore Our Services (Completely Redesigned - Minimalist Text-Based Cards) */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Explore Our <span className="text-red-600">Services</span>
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Discover a range of professional cleaning and maintenance services tailored to your needs. Click on any service to learn more and book instantly.
          </motion.p>

          {services.length === 0 ? (
            <motion.p
              className="text-gray-500 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No services available at the moment. Check back soon!
            </motion.p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-red-600 hover:border-red-800"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => router.push(`/services/${service.id}`)}
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-red-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-red-600 text-xl">
                      ₹{service.price}
                    </p>
                    <motion.button
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Book Now
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gradient-to-r from-gray-50 to-gray-100 py-24 px-8 md:px-16 lg:px-32 text-center">
        <motion.h2
          className="text-5xl font-bold text-gray-800 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Why Choose <span className="text-red-600">Us</span>
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {whyChooseUs.map((item, index) => (
            <motion.div
              key={index}
              className={`${item.color} rounded-3xl p-10 shadow-lg hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 border border-red-200`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
            >
              <div className="mb-6">{item.icon}</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {item.title}
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gradient-to-r from-black to-red-900 py-24 px-8 md:px-16 lg:px-32 text-white">
        <motion.h2
          className="text-5xl font-bold text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          What Our <span className="text-red-400">Clients Say</span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {reviews.length === 0 ? (
            <p className="text-gray-300 text-center">No reviews available yet.</p>
          ) : (
            reviews.map((t, index) => (
              <motion.div
                key={t.id}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                <div className="flex items-center mb-6">
                  <div>
                    <p className="font-bold text-lg">{t.name}</p>
                    <p className="text-gray-400 text-xs mt-1">{t.review}</p>
                  </div>
                </div>
                <div className="flex items-center mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={20} className="text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))
          )}

        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gradient-to-r from-gray-50 to-gray-100 py-24 px-8 md:px-16 lg:px-32">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl font-bold text-gray-800 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-lg">Got questions? We've got answers.</p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-xl font-semibold text-gray-800">
                  <span>{faq.question}</span>
                  <ChevronDown className="w-6 h-6 text-red-600 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-gray-600">{faq.answer}</p>
              </details>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
