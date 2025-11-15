"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [successMsg, setSuccessMsg] = useState("");

  // 🔥 FIXED: Added handleChange function
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    setSuccessMsg("Thank you for your message! We will get back to you shortly.");

    setTimeout(() => setSuccessMsg(""), 5000);
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
              <div
                className={`absolute -top-10 left-1/2 transform -translate-x-1/2 w-40 h-40 ${item.blur} blur-[80px] rounded-full group-hover:blur-[100px] transition-all duration-500`}
              ></div>

              <div
                className={`relative mx-auto mb-6 w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${item.gradient} text-white shadow-lg group-hover:shadow-red-500/50 transition-all duration-300`}
              >
                <item.icon className="w-8 h-8 group-hover:rotate-6 transition-transform duration-300" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
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

          {/* LEFT SIDE - FORM */}
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Send Us a <span className="text-red-600">Message</span>
            </h2>

            <p className="text-gray-600 mb-8 text-lg">
              Fill in your details below and our team will reach out shortly.
            </p>

            {/* SUCCESS MESSAGE - FIXED */}
            {successMsg && (
              <div className="mb-4 p-3 text-center text-sm font-semibold text-green-700 bg-green-100 border border-green-300 rounded-lg">
                {successMsg}
              </div>
            )}

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-black to-red-700 text-white rounded-xl font-bold text-lg hover:scale-[1.01] transition-all"
              >
                Send Message
              </button>

              <p className="text-sm text-gray-500 text-center">
                We respect your privacy and never share your details.
              </p>
            </form>
          </div>

          {/* RIGHT SIDE - IMAGE */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-black/20 rounded-3xl blur-3xl"></div>

            <img
              src="https://tse4.mm.bing.net/th/id/OIP.aPYoHyVUoDRjLdTNrJL_MQHaE8?pid=Api&P=0&h=220"
              alt="Customer Support"
              className="relative rounded-3xl shadow-2xl border-4 border-white object-cover w-full min-h-[300px] hover:scale-[1.01] transition-transform"
            />

            <div className="absolute -bottom-8 -left-8 bg-white shadow-2xl p-5 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-red-600 to-black w-14 h-14 rounded-xl text-white flex items-center justify-center text-xl font-bold">
                  24/7
                </div>
                <div>
                  <p className="text-sm text-gray-600">Always Available</p>
                  <p className="font-bold text-gray-900">Support Team</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-8 -right-8 bg-white shadow-2xl p-5 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-black to-red-600 w-14 h-14 rounded-xl text-white flex items-center justify-center text-xl font-bold">
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

          <div className="relative w-full h-[450px] rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-200">
            <iframe
              title="Blinkmaid Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.134248949786!2d77.6101168746734!3d12.975418187344486!"
              className="absolute inset-0 w-full h-full"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
