"use client";

import { useState, useEffect } from "react"; // Import useEffect for the toast visibility logic
import { Phone, Mail, MapPin, Clock, Star, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// -------------------- TOAST MESSAGE COMPONENT --------------------
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;

  let bgColor = "";
  let textColor = "text-white";
  let Icon = null;

  if (type === "success") {
    bgColor = "bg-green-600";
    Icon = CheckCircle;
  } else if (type === "error") {
    bgColor = "bg-red-600";
    Icon = XCircle;
  } else {
    // Default/Info
    bgColor = "bg-blue-600";
    Icon = Info;
  }

  // Use useEffect to automatically close the toast after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Toast disappears after 5 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount/re-render
  }, [message, onClose]);


  return (
    <div className="fixed bottom-5 right-5 z-[1000] p-4">
        <div className={`flex items-center space-x-4 ${bgColor} ${textColor} p-4 rounded-xl shadow-2xl min-w-[300px] transition-all duration-300 transform translate-x-0`}>
            {Icon && <Icon className="w-6 h-6 flex-shrink-0" />}
            <span className="font-medium flex-grow">{message}</span>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors duration-200">
                <X className="w-4 h-4" />
            </button>
        </div>
    </div>
  );
};

// Placeholder icons (using Lucide icons imported earlier)
const CheckCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const XCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const Info = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;


// A small reusable component for the Star Rating
const RatingInput = ({ rating, setRating }) => {
    return (
      <div className="flex gap-1.5 mt-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-7 h-7 cursor-pointer transition-all duration-200 ${
              rating >= star ? "text-red-500 fill-red-500 hover:text-red-600 hover:fill-red-600" : "text-gray-400 hover:text-red-300"
            }`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
    );
  };


const Contact = () => {
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
  
    const [reviewData, setReviewData] = useState({
      name: "",
      rating: 0,
      review: "",
    });
  
    // Unified state for managing toasts
    const [toast, setToast] = useState({ message: "", type: "" });

    const [contactLoading, setContactLoading] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);

    // Helper to display a toast
    const showToast = (message, type) => {
        setToast({ message, type });
    };

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };
  
    const handleReviewChange = (e) => {
      setReviewData({ ...reviewData, [e.target.name]: e.target.value });
    };
  
    const handleRatingChange = (newRating) => {
      setReviewData({ ...reviewData, rating: newRating });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setContactLoading(true);
      setToast({ message: "", type: "" }); // Clear old toast

      try {
        const { error } = await supabase.from("contacts").insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: formData.message,
          },
        ]);
  
        if (error) throw error;
  
        showToast("Message sent successfully! We will get back to you soon.", "success");
        setFormData({ name: "", email: "", phone: "", message: "" });
  
      } catch (err) {
        console.error(err);
        showToast("Error sending message. Please try again.", "error");
      } finally {
        setContactLoading(false);
      }
    };
  
    const handleReviewSubmit = async (e) => {
      e.preventDefault();
      setToast({ message: "", type: "" }); // Clear old toast

      if (reviewData.rating === 0) {
        showToast("Please provide a star rating before submitting.", "error");
          return;
      }
      setReviewLoading(true);
  
      try {
        const { error } = await supabase.from("website_reviews").insert([
          {
            name: reviewData.name,
            rating: reviewData.rating,
            review: reviewData.review,
          },
        ]);
  
        if (error) throw error;
  
        showToast("Thank you! Your feedback has been submitted.", "success");
        setReviewData({ name: "", rating: 0, review: "" });
  
      } catch (err) {
        console.error("Supabase error:", err?.message || err);
        showToast("Unable to save review. Please try again later.", "error");
      } finally {
          setReviewLoading(false);
      }
    };
  
    const contactDetails = [
      {
        icon: Phone,
        title: "Call Us",
        info: "+91 9620296838",
        desc: "Mon-Sat 8AM-8PM",
        gradient: "from-red-600 to-red-800",
        blur: "bg-red-500/30",
      },
      {
        icon: Mail,
        title: "Email Us",
        info: "support@blinkmaid.com",
        desc: "We reply within 24 hrs",
        gradient: "from-gray-800 to-red-700",
        blur: "bg-gray-700/30",
      },
      {
        icon: MapPin,
        title: "Visit Us",
        info: "NO. 33, SHOP NO.01, TELECOM LAYOUT MAIN ROAD, BENGALURU",
        gradient: "from-red-700 to-red-900",
        blur: "bg-red-600/40",
      },
      {
        icon: Clock,
        title: "Working Hours",
        info: "8:00 AM - 8:00 PM",
        desc: "Monday - Saturday",
        gradient: "from-gray-900 to-gray-700",
        blur: "bg-gray-700/40",
      },
    ];
  
    return (
      <div className="bg-white text-gray-900 overflow-hidden min-h-screen font-sans">
  
        {/* -------------------- TOAST RENDERED HERE -------------------- */}
        <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast({ message: "", type: "" })} 
        />
  
        {/* -------------------- HERO SECTION -------------------- */}
        <section className="bg-gradient-to-br from-red-800 via-black to-red-900 text-white pt-40 pb-24 px-6 md:px-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')]"></div>
          <div className="relative z-10">
            <p className="text-red-300 font-medium mb-2 uppercase tracking-widest">Connect with Us</p>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-xl mb-4">
              Let's Start a <span className="text-red-400">Conversation</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Whether you have a question about our services, pricing, or need support, our team is ready to help you find the perfect cleaning solution.
            </p>
          </div>
        </section>
  
        {/* -------------------- CONTACT INFO BOXES -------------------- */}
        <section className="py-20 px-8 md:px-20 -mt-20 relative z-20">
          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {contactDetails.map((item, i) => (
              <div
                key={i}
                className="relative bg-white rounded-3xl p-8 shadow-2xl hover:shadow-red-300/50 hover:-translate-y-1 transition-all duration-500 text-center border border-gray-100 overflow-hidden group"
              >
                <div
                  className={`absolute -top-10 left-1/2 transform -translate-x-1/2 w-40 h-40 ${item.blur} blur-[80px] rounded-full group-hover:blur-[100px] transition-all duration-500`}
                ></div>
  
                <div
                  className={`relative mx-auto mb-6 w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br ${item.gradient} text-white shadow-xl group-hover:shadow-red-500/50 transition-all duration-300`}
                >
                  <item.icon className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
                </div>
  
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">{item.title}</h3>
                <p className="font-semibold text-gray-700 break-words group-hover:text-red-600 transition-colors duration-300">
                  {item.info}
                </p>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
  
        {/* -------------------- MAIN CONTENT: FORM & REVIEW -------------------- */}
        <section className="py-24 px-8 md:px-20 bg-white relative">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-16">
  
              {/* ---------- CONTACT FORM (2/3 width) ---------- */}
              <div className="lg:col-span-2">
                  <h2 className="text-4xl font-extrabold text-gray-900 mb-8 border-l-4 border-red-600 pl-4">
                      Send Us a <span className="text-red-600">Quick Message</span>
                  </h2>
  
                  <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 shadow-xl rounded-3xl p-8 md:p-10 space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                          <div>
                              <label className="text-sm font-bold text-gray-700 mb-1 block">Full Name *</label>
                              <input
                                  type="text"
                                  name="name"
                                  value={formData.name}
                                  onChange={handleChange}
                                  required
                                  className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-xl transition duration-200"
                                  placeholder="John Doe"
                              />
                          </div>
  
                          <div>
                              <label className="text-sm font-bold text-gray-700 mb-1 block">Phone Number</label>
                              <input
                                  type="tel"
                                  name="phone"
                                  value={formData.phone}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-xl transition duration-200"
                                  placeholder="+91 98765 43210"
                              />
                          </div>
                      </div>
  
                      <div>
                          <label className="text-sm font-bold text-gray-700 mb-1 block">Email *</label>
                          <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-xl transition duration-200"
                              placeholder="you@example.com"
                          />
                      </div>
  
                      <div>
                          <label className="text-sm font-bold text-gray-700 mb-1 block">Message *</label>
                          <textarea
                              name="message"
                              rows={5}
                              value={formData.message}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 border border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-xl resize-none transition duration-200"
                              placeholder="Tell us about your cleaning needs, preferred date, or any questions you have..."
                          ></textarea>
                      </div>
  
                      <button 
                          type="submit" 
                          disabled={contactLoading}
                          className="w-full py-4 bg-gradient-to-r from-red-700 to-black text-white rounded-xl font-bold text-lg hover:from-red-800 hover:to-gray-900 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                          {contactLoading ? (
                              <>
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  Sending...
                              </>
                          ) : (
                              "Send Message"
                          )}
                      </button>
                  </form>
              </div>
  
  
              {/* ---------- REVIEW FORM (1/3 width) ---------- */}
              <div className="lg:col-span-1">
                  <h2 className="text-4xl font-extrabold text-gray-900 mb-8 border-l-4 border-black pl-4">
                      Leave a <span className="text-black">Review</span>
                  </h2>
                  
                  <form onSubmit={handleReviewSubmit} className="bg-red-50/50 p-8 rounded-3xl shadow-xl border border-red-100 space-y-6">
  
                      <div className="text-left">
                          <label className="font-bold text-gray-700 mb-1 block">Your Name *</label>
                          <input
                              type="text"
                              name="name"
                              required
                              value={reviewData.name}
                              onChange={handleReviewChange}
                              className="w-full px-4 py-3 border border-red-200 focus:border-red-500 focus:ring-red-500 rounded-xl transition duration-200"
                              placeholder="Enter your name"
                          />
                      </div>
  
                      <div className="text-left">
                          <label className="font-bold text-gray-700 mb-1 block">Rating *</label>
                          <RatingInput 
                              rating={reviewData.rating} 
                              setRating={handleRatingChange} 
                          />
                      </div>
  
                      <div className="text-left">
                          <label className="font-bold text-gray-700 mb-1 block">Your Review *</label>
                          <textarea
                              name="review"
                              rows={4}
                              required
                              value={reviewData.review}
                              onChange={handleReviewChange}
                              className="w-full px-4 py-3 border border-red-200 focus:border-red-500 focus:ring-red-500 rounded-xl resize-none transition duration-200"
                              placeholder="Write your experience..."
                          />
                      </div>
  
                      <button
                          type="submit"
                          disabled={reviewLoading}
                          className="w-full py-4 bg-gradient-to-r from-black to-red-800 text-white font-bold rounded-xl text-lg hover:from-gray-900 hover:to-red-700 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                          {reviewLoading ? (
                              <>
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  Submitting...
                              </>
                          ) : (
                              "Submit Review"
                          )}
                      </button>
                  </form>
              </div>
          </div>
        </section>
  
        {/* -------------------- MAP -------------------- */}
        <section className="py-24 px-8 md:px-20 bg-gray-50">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
              Our <span className="text-red-600">Location</span>
            </h2>
  
            <p className="text-gray-600 mb-10 text-lg font-medium max-w-2xl mx-auto">
              Find us at: NO. 33, SHOP NO.01, TELECOM LAYOUT MAIN ROAD, ASHWATHNAGAR, THANISANDRA, BENGALURU - 560077
            </p>
  
            <div className="w-full h-[450px] border-8 border-white rounded-3xl overflow-hidden shadow-2xl shadow-red-200/50">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15548.74052327576!2d77.6200236!3d13.023253!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae172ed4f63c87%3A0x7d25e01b332b85c1!2sTelecom%20Layout%2C%20Ashwathnagar%2C%20Thanisandra%2C%20Bengaluru%2C%20Karnataka%20560077!5e0!3m2!1sen!2sin!4v1704285093751!5m2!1sen!2sin"
                width="100%" 
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </section>
      </div>
    );
  };
  
  export default Contact;