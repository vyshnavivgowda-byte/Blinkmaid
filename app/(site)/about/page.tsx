"use client";

import Image from "next/image";
import { Target, Eye, Handshake, CheckCircle, Shield } from "lucide-react"; // Imported more relevant icons
import { motion } from "framer-motion";

const About = () => {
  // Color variables for consistency
  const primaryColor = "text-red-600";
  const accentBg = "bg-gray-900";

  // UPDATED: Icons added to carouselItems for the new Feature Grid
  const carouselItems = [
    {
      icon: Handshake, // New icon for 'Trusted Service'
      title: "Professional & Trusted Service",
      description:
        "Our carefully vetted professionals bring years of experience and dedication to make your home spotless and comfortable.",
    },
    {
      icon: CheckCircle, // New icon for 'Quality'
      title: "Quality You Can Trust",
      description:
        "We maintain the highest standards of cleanliness and professionalism, ensuring your home is always in perfect condition.",
    },
    {
      icon: Shield, // New icon for 'Verified'
      title: "Verified & Background Checked",
      description:
        "Every team member goes through rigorous background verification and training to ensure your safety and peace of mind.",
    },
  ];

  const teamMembers = [
    {
      image: "/team1.jpg",
      name: "Aditi Sharma",
      designation: "Founder & CEO",
      description: "Visionary leader with 10+ years in the service industry.",
    },
    {
      image: "/team2.jpg",
      name: "Rahul Mehta",
      designation: "Operations Head",
      description: "Expert in logistics and quality management.",
    },
    {
      image: "/team3.jpg",
      name: "Sneha Kapoor",
      designation: "Customer Success Lead",
      description: "Passionate about delivering exceptional experiences.",
    },
    {
      image: "/team4.jpg",
      name: "Arjun Singh",
      designation: "Technology Director",
      description: "Building seamless digital solutions for better service.",
    },
  ];

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
      {/* Hero Section - Keep original bold gradient */}
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
            Transforming homes and lives through trusted, reliable, and professional domestic services. We connect you with verified experts who care about your home as much as you do.
          </p>
          <motion.div
            className="mt-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              Learn More
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* NEW FEATURE GRID SECTION - Replaces Zigzag Layout */}
      <section className="py-28 px-6 md:px-12 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
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
              <div className="relative flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-red-600 shadow-lg group-hover:bg-black transition-colors duration-300">
                <item.icon className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-red-700 transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission & Vision - Keep original design but ensure it's clean */}
      <section className="py-24 px-6 md:px-20 bg-gradient-to-b from-gray-50 via-white to-gray-100">
        <motion.div
          className="max-w-7xl mx-auto text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4">
            Our <span className="text-red-600">Mission & Vision</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We aim to simplify lives through reliable, affordable, and high-quality domestic services.
          </p>
          <div className="w-28 h-1 bg-gradient-to-r from-red-600 to-black mx-auto mt-6 rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Purpose */}
          <motion.div
            className="p-10 bg-white rounded-3xl shadow-xl border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 text-center group"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-700 via-black to-red-900 shadow-[0_0_20px_rgba(255,0,0,0.3)] group-hover:scale-110 transition-transform duration-300">
              <Target className="text-white w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Our Purpose</h3>
            <p className="text-gray-600 leading-relaxed">
              To simplify household management by providing top-quality, affordable, and verified domestic help. Every home deserves professional care and attention.
            </p>
          </motion.div>

          {/* Vision */}
          <motion.div
            className="p-10 bg-white rounded-3xl shadow-xl border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 text-center group"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-black via-red-800 to-gray-900 shadow-[0_0_20px_rgba(255,0,0,0.3)] group-hover:scale-110 transition-transform duration-300">
              <Eye className="text-white w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              To become India’s most trusted platform for professional domestic services — empowering households and creating employment opportunities nationwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Section - Keep original design but refine aesthetics */}
      <section className="py-24 px-6 md:px-20 bg-white">
        <motion.div
          className="max-w-7xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            Meet Our <span className="text-red-600">Team</span>
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Passionately leading Blinkmaid towards excellence and innovation.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              className="group bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={500}
                  height={500}
                  className="w-full h-64 object-cover object-top filter grayscale group-hover:grayscale-0 transition-all duration-500" // Added grayscale effect for sophisticated look
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                <p className="text-red-600 font-semibold mb-2">{member.designation}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section - Keep original bold gradient */}
      <section className="py-24 px-6 md:px-20 bg-gradient-to-r from-black to-red-700 text-white text-center">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Experience{" "}
            <span className="text-red-200">the Difference?</span>
          </h2>
          <p className="text-lg text-gray-200 mb-8 leading-relaxed">
            Join thousands of satisfied customers who trust Blinkmaid for their home care needs.
          </p>
          <motion.button
            className="bg-gradient-to-r from-gray-900 to-black text-white px-10 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Today
          </motion.button>
        </motion.div>
      </section>


    </div>
  );
};

export default About;