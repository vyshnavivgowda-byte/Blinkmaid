"use client"; // <--- ADDED THIS DIRECTIVE TO MARK IT AS A CLIENT COMPONENT

import { useState } from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react"; // Using Lucide icons instead of react-icons/hi

const Contact = () => {
  // Placeholder URL for the support image
  const SUPPORT_IMAGE_URL = "https://placehold.co/800x600/1f2937/ffffff?text=Professional+Support";
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send this data to an API endpoint here.
    console.log("Form submitted:", formData);

    // Simple message box equivalent for success feedback
    document.getElementById('success-message').innerText = 'Thank you for your message! We will get back to you shortly.';
    setTimeout(() => {
        document.getElementById('success-message').innerText = '';
    }, 5000);
  };

  const contactDetails = [
    {
      icon: Phone,
      title: "Call Us",
      info: "+91 98765 43210",
      desc: "Mon-Sat 8AM-8PM",
      gradient: "from-red-600 to-black",
      blur: "bg-red-500/30",
    },
    {
      icon: Mail,
      title: "Email Us",
      info: "support@blinkmaid.com",
      desc: "We reply within 24 hrs",
      gradient: "from-black to-gray-800",
      blur: "bg-black/30",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      info: "MG Road, Bengaluru",
      desc: "Karnataka, India",
      gradient: "from-red-700 to-black",
      blur: "bg-red-600/40",
    },
    {
      icon: Clock,
      title: "Working Hours",
      info: "8:00 AM - 8:00 PM",
      desc: "Monday - Saturday",
      gradient: "from-gray-900 to-red-600",
      blur: "bg-gray-700/40",
    },
  ];

  return (
    // Note: The "use client"; is not required in the generated file block but kept in mind.
    <div className="bg-gradient-to-br from-white via-red-50 to-gray-100 text-gray-900 overflow-hidden min-h-screen font-sans">
      
      {/* 🌍 Hero Section */}
      <section className="bg-gradient-to-r from-red-700 via-black to-red-700 text-white pt-40 pb-24 px-6 md:px-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-red-700/70 to-black/80"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4">
            Get in <span className="text-red-300">Touch</span>
          </h1>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto">
            Have questions about our services? We're here to help — reach out anytime.
          </p>
        </div>
      </section>

      {/* 📞 Contact Info */}
      <section className="py-20 px-8 md:px-20 -mt-16 relative z-20">
        <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {contactDetails.map((item, i) => (
            <div
              key={i}
              className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center border border-gray-100 overflow-hidden group"
            >
              {/* 🔴 Decorative Blur Behind Icon */}
              <div
                className={`absolute -top-10 left-1/2 transform -translate-x-1/2 w-40 h-40 ${item.blur} blur-[80px] rounded-full transition-all duration-500 group-hover:blur-[100px]`}
              ></div>

              <div
                className={`relative mx-auto mb-6 w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${item.gradient} text-white shadow-lg group-hover:shadow-red-500/50 transition-all duration-300`}
              >
                <item.icon className="w-8 h-8 group-hover:rotate-6 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="font-semibold text-gray-700 group-hover:text-red-600 transition-colors duration-300">
                {item.info}
              </p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ✉️ Contact Form & Support Image */}
      <section className="py-24 px-8 md:px-20 bg-gradient-to-b from-white to-gray-50 relative">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Left - Form */}
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Send Us a <span className="text-red-600">Message</span>
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Fill in your details below and our team will reach out shortly.
            </p>

            {/* Success Message Box */}
            <div id="success-message" className="mb-4 p-3 text-center text-sm font-semibold text-green-700 bg-green-100 border border-green-300 rounded-lg hidden" style={{ display: document.getElementById('success-message')?.innerText ? 'block' : 'none' }}></div>


            <form
              onSubmit={handleSubmit}
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-2xl rounded-3xl p-10 space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us about your cleaning needs..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-white transition-all resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-black to-red-700 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
              >
                Send Message
              </button>
              <p className="text-sm text-gray-500 text-center">
                We respect your privacy and never share your details.
              </p>
            </form>
          </div>

          {/* Right - Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-black/20 rounded-3xl blur-3xl z-0"></div>
            <img
              src="https://tse4.mm.bing.net/th/id/OIP.aPYoHyVUoDRjLdTNrJL_MQHaE8?pid=Api&P=0&h=220"
              alt="Customer Support"
              className="relative rounded-3xl shadow-2xl border-4 border-white object-cover w-full h-auto hover:scale-[1.01] transition-transform duration-500 z-10 min-h-[300px]"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600/1f2937/ffffff?text=Image+Load+Failed"; }}
            />

            {/* Floating Badges */}
            <div className="absolute -bottom-8 -left-8 bg-white shadow-2xl p-5 rounded-2xl border border-gray-100 z-20">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-red-600 to-black w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  24/7
                </div>
                <div>
                  <p className="text-sm text-gray-600">Always Available</p>
                  <p className="font-bold text-gray-900">Support Team</p>
                </div>
              </div>
            </div>

            <div
              className="absolute -top-8 -right-8 bg-white shadow-2xl p-5 rounded-2xl border border-gray-100 z-20"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-black to-red-600 w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  10K+
                </div>
                <div>
                  <p className="text-sm text-gray-600">Happy</p>
                  <p className="font-bold text-gray-900">Customers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🗺️ Map Section */}
      <section className="py-20 px-8 md:px-20 bg-gradient-to-t from-gray-100 via-white to-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-10">
            Find Us <span className="text-red-600">Here</span>
          </h2>
          <div className="relative w-full h-[450px] rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-200 hover:shadow-red-300/50 transition-shadow duration-500">
            <iframe
              title="Blinkmaid Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.134248949786!2d77.6101168746734!3d12.975418187344486!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae16d1f8f8a6cb%3A0xf56a7f62b0e7b6e7!2sMG%20Road%2C%20Bengaluru!5e0!3m2!1sen!2sin!4v1689858473204!5m2!1sen!2sin"
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;