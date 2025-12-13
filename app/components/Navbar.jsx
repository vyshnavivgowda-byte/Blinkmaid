"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { Eye, EyeOff, X, Loader2, User, LogOut, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "@/public/logo.jpg";
import { supabase } from "../../lib/supabaseClient";
import { useToast } from "@/app/components/toast/ToastContext";

const menuItems = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Maid Registration", path: "/maid-registration" },
  { label: "About Us", path: "/about" },
  { label: "Contact Us", path: "/contact" },
];

const plans = [
  {
    duration: "3 Months",
    price: 5999,
    features: [
      "1 Free Replacement",
      "10% Monthly Salary Discount",
      "24/7 Customer Support",
    ],
  },
  {
    duration: "6 Months",
    price: 11999,
    features: [
      "1 Free Replacement",
      "10% Monthly Salary Discount",
      "24/7 Customer Support",
    ],
  },
  {
    duration: "12 Months",
    price: 19999,
    features: [
      "1 Free Replacement",
      "10% Monthly Salary Discount",
      "24/7 Customer Support",
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSubscribePopup, setShowSubscribePopup] = useState(false);
  const [formErrors, setFormErrors] = useState({}); // For form validation
  const [subscribers, setSubscribers] = useState([]); // For displaying subscribers table
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const modalRef = useRef(null);
  const { showToast } = useToast();
  const subscribeModalRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "", // Added for registration
    phone: "",
    subscribe: false,
    plan: null,
  });

  // Reset form and errors
  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      subscribe: false,
      plan: null,
    });
    setFormErrors({});
  }, []);

  // Form validation
  const validateForm = useCallback(() => {
    const errors = {};
    if (isRegister) {
      if (!formData.name.trim()) errors.name = "Name is required.";
      if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone)) errors.phone = "Valid 10-digit phone number required.";
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match.";
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Valid email is required.";
    if (!formData.password || formData.password.length < 6) errors.password = "Password must be at least 6 characters.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, isRegister]);

  // Registration function (removed email confirmation, added auto-login)
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
          },
        },
      });

      if (error) {
        console.error('Supabase signup error:', error); // Debug log
        showToast(error.message, "error");
        setLoading(false);
        return;
      }

      // Auto-login after successful registration
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        console.error('Auto-login error:', signInError); // Debug log
        showToast("Registration successful, but auto-login failed. Please log in manually.", "warning");
      } else {
        showToast("Registration successful! You are now logged in.", "success");
      }

      // Note: Subscription happens after payment, not here
      setLoading(false);
      resetForm();
      setIsRegister(false);
      setModalOpen(false);
    } catch (err) {
      console.error('Fetch error in handleRegister:', err); // Debug log
      showToast("Network error. Please check your connection and try again.", "error");
      setLoading(false);
    }
  };

  // Check user authentication on mount and listen for changes
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data?.session) {
        setUser(data.session.user);
        fetchSubscribers(data.session.user.id); // Fetch subscribers on login
      } else {
        setUser(null);
        setSubscribers([]);
      }
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchSubscribers(session.user.id);
      } else {
        setSubscribers([]);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Fetch subscribers for the authenticated user
  const fetchSubscribers = async (userId) => {
    setLoadingSubscribers(true);
    const { data, error } = await supabase
      .from("subscribers")
      .select("*")
      .eq("user_id", userId);
    if (error) {
      showToast(`Error fetching subscribers: ${error.message}`, "error");
    } else {
      setSubscribers(data || []);
    }
    setLoadingSubscribers(false);
  };

  // Close modal when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event) => {
      // For login/register modal
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setModalOpen(false);
      }
      // For subscription modal
      if (subscribeModalRef.current && !subscribeModalRef.current.contains(event.target)) {
        setShowSubscribePopup(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setModalOpen(false);
        setShowSubscribePopup(false);
      }
    };

    if (modalOpen || showSubscribePopup) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen, showSubscribePopup]);

  // Handle form input changes
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    // Clear error on change
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }, [formErrors]);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (error) {
      showToast(error.message, "error");
    } else {
      showToast("Login successful!", "success");
      resetForm();
      setModalOpen(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    setSubscribers([]);
    showToast("Logged out successfully!", "success");
  };

  // Handle subscription (only for logged-in users, save with user_id)
  const handleSubscription = async (plan, userId) => {
    try {
      const { error } = await supabase.from("subscribers").insert([
        {
          name: user.user_metadata?.name || "",
          email: user.email,
          phone: user.user_metadata?.phone || "",
          plan_duration: plan.duration,
          plan_price: plan.price,
          plan_benefits: JSON.stringify(plan.features), // Store as JSON string
          user_id: userId,
          subscribed_at: new Date(),
        },
      ]);
      if (error) {
        showToast(`Subscription failed: ${error.message}. Please try again.`, "error");
        return false;
      }
      showToast("Subscription saved successfully!", "success");
      fetchSubscribers(userId); // Refresh subscribers
      return true;
    } catch (err) {
      showToast("An unexpected error occurred. Please try again.", "error");
      return false;
    }
  };

  // Handle Razorpay payment (only for logged-in users)
  const handlePayment = (plan) => {
    if (!user) {
      showToast("Please log in to subscribe.", "error");
      return;
    }

    const options = {
      key: "rzp_test_RpvE2nM5XUTYN7", // Replace with your Razorpay Key ID
      amount: plan.price * 100,
      currency: "INR",
      name: "Blinkmaid Subscription",
      description: `${plan.duration} Subscription`,
      handler: function (response) {
        setFormData((prev) => ({ ...prev, subscribe: true, plan }));
        setShowSubscribePopup(false);
        showToast("Payment successful! You are now subscribed.", "success");
        handleSubscription(plan, user.id);
      },
      prefill: {
        name: user.user_metadata?.name || "",
        email: user.email,
        contact: user.user_metadata?.phone || "",
      },
      theme: {
        color: "#dc2626",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      showToast(`Payment failed: ${response.error.description}`, "error");
    });
    rzp.open();
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Toggle menu for mobile
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Toggle dropdown
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <>
      <header className="bg-white shadow-lg fixed top-0 left-0 w-full z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 hover:scale-105 transition-transform duration-200"
            aria-label="Go to Home"
          >
            <Image
              src={logo}
              alt="Blinkmaid Logo"
              width={180}
              height={200}
              className="rounded-full shadow-md"
            />
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map(({ label, path }) => (
              <Link
                key={path}
                href={path}
                className={`font-medium px-4 py-2 rounded-lg transition-all duration-200 ${pathname === path
                  ? "text-white bg-gradient-to-r from-red-700 to-gray-900 shadow-lg"
                  : "text-gray-800 hover:text-white hover:bg-gradient-to-r hover:from-red-700 hover:to-gray-900 hover:shadow-md"
                  }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="relative flex items-center space-x-4">
            {user ? (
              <>
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <User size={20} />
                    <span className="font-medium">{user.user_metadata?.name || user.email}</span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        <LogOut size={16} className="inline mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
                {/* Subscribe Button */}
                <button
                  onClick={() => setShowSubscribePopup(true)}
                  className="px-4 py-2 bg-gradient-to-r from-red-700 to-gray-900 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Subscribe
                </button>
              </>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-red-700 to-gray-900 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <HiX size={28} /> : <HiMenu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white shadow-lg border-t border-gray-200 animate-fade-in">
            <nav className="flex flex-col space-y-2 p-6">
              {menuItems.map(({ label, path }) => (
                <Link
                  key={path}
                  href={path}
                  className={`font-medium px-4 py-3 rounded-lg transition-all duration-200 ${pathname === path
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-gray-800 hover:bg-gradient-to-r hover:from-red-700 hover:to-gray-900 hover:text-white"
                    }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              {/* Mobile Subscribe Button (only for logged-in users) */}
              {user && (
                <button
                  onClick={() => { setMenuOpen(false); setShowSubscribePopup(true); }}
                  className="font-medium px-4 py-3 rounded-lg text-gray-800 hover:bg-gradient-to-r hover:from-red-700 hover:to-gray-900 hover:text-white"
                >
                  Subscribe
                </button>
              )}
            </nav>
          </div>
        )}

        {/* Auth Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[100] p-4 animate-fade-in">
            <div
              ref={modalRef}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative"
              role="dialog"
              aria-labelledby="modal-title"
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute right-4 top-4 text-gray-500 hover:text-red-600 transition-colors"
                aria-label="Close modal"
              >
                <X size={22} />
              </button>

              <h2 id="modal-title" className="text-2xl font-bold text-gray-800 mb-6 text-center">
                {isRegister ? "Create Account" : "Welcome Back"}
              </h2>

              <form
                onSubmit={isRegister ? handleRegister : handleLogin}
                className="grid grid-cols-1 gap-4"
              >
                {isRegister && (
                  <>
                    <div>
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all ${formErrors.name ? "border-red-500" : "border-gray-300"
                          }`}
                        required
                        aria-describedby={formErrors.name ? "name-error" : undefined}
                      />
                      {formErrors.name && <p id="name-error" className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                    </div>
                    <div>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all ${formErrors.phone ? "border-red-500" : "border-gray-300"
                          }`}
                        required
                        aria-describedby={formErrors.phone ? "phone-error" : undefined}
                      />
                      {formErrors.phone && <p id="phone-error" className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                    </div>
                  </>
                )}
                {/* Email */}
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all ${formErrors.email ? "border-red-500" : "border-gray-300"
                      }`}
                    required
                    aria-describedby={formErrors.email ? "email-error" : undefined}
                  />
                  {formErrors.email && <p id="email-error" className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                </div>

                {/* Password */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full border px-4 py-3 pr-10 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all ${formErrors.password ? "border-red-500" : "border-gray-300"
                      }`}
                    required
                    aria-describedby={formErrors.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-600 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {formErrors.password && <p id="password-error" className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
                </div>

                {/* Confirm Password for Registration */}
                {isRegister && (
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full border px-4 py-3 pr-10 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all ${formErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                        }`}
                      required
                      aria-describedby={formErrors.confirmPassword ? "confirm-password-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-600 transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    {formErrors.confirmPassword && <p id="confirm-password-error" className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-200 flex items-center justify-center ${loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-black to-red-600 hover:from-red-600 hover:to-black shadow-lg hover:shadow-xl"
                    }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Processing...
                    </>
                  ) : isRegister ? (
                    "Register"
                  ) : (
                    "Login"
                  )}
                </button>
              </form>

              {/* Toggle Login/Register */}
              <p className="text-center text-sm text-gray-600 mt-4">
                {isRegister ? (
                  <>
                    Already have an account?{" "}
                    <span
                      onClick={() => setIsRegister(false)}
                      className="text-red-600 hover:underline cursor-pointer"
                    >
                      Login
                    </span>
                  </>
                ) : (
                  <>
                    Don’t have an account?{" "}
                    <span
                      onClick={() => setIsRegister(true)}
                      className="text-red-600 hover:underline cursor-pointer"
                    >
                      Register
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Subscription Modal */}
        {showSubscribePopup && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[200] p-4 animate-fade-in">
            <div
              ref={subscribeModalRef}
              className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl p-8 relative"
              role="dialog"
              aria-modal="true"
              aria-labelledby="subscribe-title"
            >
              <button
                onClick={() => setShowSubscribePopup(false)}
                className="absolute right-4 top-4 text-gray-500 hover:text-red-600 transition-colors"
                aria-label="Close subscription popup"
              >
                <X size={22} />
              </button>

              <h2
                id="subscribe-title"
                className="text-xl font-semibold text-gray-800 mb-3 text-center"
              >
                Blinkmaid Subscription Plans
              </h2>

              <p className="text-gray-600 text-sm mb-5 text-center leading-relaxed">
                Choose a plan to subscribe and get exclusive updates, offers, and benefits!
              </p>

              {/* 3 Column Plans */}
              <div className="grid grid-cols-3 gap-8">
                {plans.map((plan, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300"
                  >
                    <h3 className="text-2xl font-bold text-center text-gray-900">
                      {plan.duration}
                    </h3>

                    <p className="text-sm text-center text-gray-600 mt-1">
                      Flat Price — No Hidden Charges
                    </p>

                    <p className="text-3xl font-extrabold text-red-600 text-center mt-4">
                      ₹{plan.price}
                    </p>

                    <div className="mt-6 space-y-3">
                      {plan.features?.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                          <span className="text-green-600 text-lg">✔</span>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePayment(plan)}
                      className="mt-6 w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-3 rounded-2xl font-semibold hover:from-red-700 hover:to-red-900 transition-all duration-200 shadow-md"
                    >
                      Buy Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Subscription Banner Below Header */}
      {/* Subscription Banner Below Header */}
    {user && (
  <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-2 px-4 text-center text-sm font-medium shadow-md sticky top-20 z-40">
    {loadingSubscribers ? (
            <div className="flex justify-center items-center">
              <Loader2 className="animate-spin mr-2" size={16} />
              Loading subscription...
            </div>
          ) : subscribers.length > 0 ? (
            `You have an active subscription: ${subscribers[0].plan_duration} for ₹${subscribers[0].plan_price}. Subscribed on ${new Date(subscribers[0].subscribed_at).toLocaleDateString()}. Benefits: ${JSON.parse(subscribers[0].plan_benefits || "[]").join(", ")}.`
          ) : (
            <span>
              You don’t have an active subscription yet.{" "}
              <button
                onClick={() => setShowSubscribePopup(true)}
                className="underline font-semibold hover:text-yellow-200 ml-1"
              >
                Subscribe Now
              </button>
            </span>
          )}

        </div>
      )}

    </>
  );
}
