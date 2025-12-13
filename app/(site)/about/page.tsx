"use client";

import Image from "next/image";
import { Target, Eye, Handshake, CheckCircle, Shield, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // IMPORTANT: Make sure this path matches your project

const About = () => {
  const primaryColor = "text-red-600";

  const carouselItems = [
    {
      icon: Handshake,
      title: "Professional & Trusted Service",
      description:
        "Our carefully vetted professionals bring years of experience and dedication to make your home spotless and comfortable.",
    },
    {
      icon: CheckCircle,
      title: "Quality You Can Trust",
      description:
        "We maintain the highest standards of cleanliness and professionalism, ensuring your home is always in perfect condition.",
    },
    {
      icon: Shield,
      title: "Verified & Background Checked",
      description:
        "Every team member goes through rigorous background verification and training to ensure your safety and peace of mind.",
    },
  ];

  const [reviews, setReviews] = useState([]);

  // Fetch only ACTIVE testimonials (status = 'active')
  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("website_reviews")
        .select("*")
        .eq("status", "active")
        .order("id", { ascending: false });

      if (!error) setReviews(data);
    };

    fetchReviews();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  };

  const staggeredAnimation = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  };

  return (
    <div className="bg-white text-gray-900 w-full overflow-x-hidden">

      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-red-700 via-black to-red-700 text-white pt-40 pb-28 px-6 md:px-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />

        <motion.div
          className="max-w-4xl mx-auto relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg">
            About <span className="text-red-300">Blinkmaid</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-100 leading-relaxed max-w-3xl mx-auto">
            Transforming homes and lives through trusted, reliable, and professional domestic services.
          </p>
        </motion.div>
      </section>

      {/* FEATURE GRID */}
      <section className="py-28 px-6 md:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold text-gray-900"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Our Core <span className={primaryColor}>Commitments</span>
          </motion.h2>
          <div className="w-24 h-1 bg-red-600 mx-auto mt-4 rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          {carouselItems.map((item, index) => (
            <motion.div
              key={index}
              className="p-8 bg-white rounded-xl shadow-xl border-t-4 border-red-700 hover:shadow-2xl transition-all duration-300 text-center group"
              variants={staggeredAnimation}
              initial="initial"
              whileInView="animate"
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-600 group-hover:bg-black transition-colors duration-300">
                <item.icon className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-red-700">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MISSION & VISION */}
    {/* MISSION & VISION */}
<section className="py-24 px-6 md:px-20 bg-gradient-to-b from-white to-gray-100">
  <div className="max-w-7xl mx-auto text-center mb-16">
    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
      Our <span className="text-red-600">Mission & Vision</span>
    </h2>
    <p className="text-gray-600 mt-3 text-lg">
      What drives us at Blinkmaid
    </p>
    <div className="w-24 h-1 bg-red-600 mx-auto mt-5 rounded-full" />
  </div>

  <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
    <motion.div
      className="p-10 bg-white rounded-3xl shadow-xl text-center border border-gray-200"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <Target className="w-12 h-12 mx-auto text-red-600 mb-6" />
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
      <p className="text-gray-600 leading-relaxed">
        To simplify household management by providing top-quality, affordable, and verified domestic help.
      </p>
    </motion.div>

    <motion.div
      className="p-10 bg-white rounded-3xl shadow-xl text-center border border-gray-200"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      viewport={{ once: true }}
    >
      <Eye className="w-12 h-12 mx-auto text-red-600 mb-6" />
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
      <p className="text-gray-600 leading-relaxed">
        To become India’s most trusted platform for professional domestic services.
      </p>
    </motion.div>
  </div>
</section>


      {/* ⭐⭐⭐ NEW TESTIMONIAL SECTION ⭐⭐⭐ */}
      <section className="py-24 px-6 md:px-20 bg-gray-50">
        <motion.div
          className="max-w-7xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            What Our <span className="text-red-600">Customers Say</span>
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Real stories from our valued customers who trust Blinkmaid every day.
          </p>
          <div className="w-24 h-1 bg-red-600 mx-auto mt-6 rounded-full" />
        </motion.div>

        {/* Testimonial Grid */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {reviews.length === 0 && (
            <p className="text-center text-gray-500 col-span-full">
              No testimonials yet. Waiting for customer reviews...
            </p>
          )}

          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:-translate-y-2 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex gap-1 mb-3 justify-center">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="text-yellow-500 w-5 h-5" />
                ))}
              </div>

              <p className="text-gray-700 text-sm italic mb-4">“{review.review}”</p>
              <h4 className="font-bold text-lg text-gray-900 text-center">
                — {review.name}
              </h4>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-20 bg-gradient-to-r from-black to-red-700 text-white text-center">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Experience <span className="text-red-200">the Difference?</span>
          </h2>
          <p className="text-lg text-gray-200 mb-8">
            Join thousands of satisfied customers who trust Blinkmaid for their home care needs.
          </p>

          <button className="bg-gradient-to-r from-gray-900 to-black px-10 py-4 rounded-full text-lg font-semibold shadow-lg hover:opacity-90 transition">
            Get Started Today
          </button>
        </motion.div>
      </section>

    </div>
  );
};

export default About;
