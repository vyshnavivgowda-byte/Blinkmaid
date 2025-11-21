"use client";

import { useState, useRef, useEffect } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { Eye, EyeOff, X, Loader2, User, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "@/public/logo.jpg";
import { supabase } from "../../lib/supabaseClient";

const menuItems = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Maid Registration", path: "/maid-registration" },
  { label: "About Us", path: "/about" },
  { label: "Contact Us", path: "/contact" },
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
  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    location: "",
    subscribe: false,
  });

  // Check user authentication on mount and listen for changes
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data?.session) {
        setUser(data.session.user);
      } else {
        setUser(null);
      }
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setModalOpen(false);
      }
    };
    if (modalOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalOpen]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          location: formData.location,
        },
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    if (formData.subscribe) {
      await handleSubscription();
    }

    setLoading(false);
    alert("Registration successful! Check your email for verification.");
    resetForm();
    setIsRegister(false);
    setModalOpen(false);
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Login successful!");
      setModalOpen(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    alert("Logged out successfully!");
  };

  // Handle subscription
  const handleSubscription = async () => {
    const { error } = await supabase.from("subscribers").insert([
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        subscribed_at: new Date(),
      },
    ]);
    if (error) {
      console.error("Subscription error:", error.message);
      alert("Subscription failed. Please try again.");
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      location: "",
      subscribe: false,
    });
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Toggle menu for mobile
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Toggle dropdown
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-3 hover:scale-105 transition-transform"
        >
          <Image
            src={logo}
            alt="Blinkmaid Logo"
            width={180}
            height={200}
            className="rounded-full"
          />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-10">
          {menuItems.map(({ label, path }) => (
            <Link
              key={path}
              href={path}
              className={`
    font-medium transition-colors px-3 py-2 rounded-lg
    ${pathname === path
                  ? "text-white bg-gradient-to-r from-red-700 to-gray-900 shadow-lg"
                  : "text-black hover:text-white hover:bg-gradient-to-r hover:from-red-700 hover:to-gray-900"
                }
  `}
            >
              {label}
            </Link>


          ))}
        </nav>

        {/* Auth Section */}
        <div className="relative">
          {user ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="
    flex items-center space-x-2 px-3 py-2 
    bg-gradient-to-r from-red-700 to-gray-900
    rounded-full 
    text-white 
    transition-all
  "
              >
                <User size={20} />
                <span className="hidden sm:block font-medium">
                  {user.user_metadata?.name || "User"}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-black shadow-lg rounded-xl overflow-hidden border border-red-600 z-10">
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 hover:bg-red-700 text-gray-200 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={16} className="mr-2" /> Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-4 py-2 hover:bg-red-700 text-gray-200 transition-colors"
                  >
                    <LogOut size={16} className="mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              className="
    px-6 py-3 
    bg-gradient-to-r from-red-700 to-gray-900
    text-white 
    rounded-xl 
    font-semibold 
    transition-all
  "
            >
              Login
            </button>


          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-white p-2"
          aria-label="Toggle menu"
        >
          {menuOpen ? <HiX size={28} /> : <HiMenu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-black shadow-lg border-t border-red-600">
          <nav className="flex flex-col space-y-4 p-6">
            {menuItems.map(({ label, path }) => (
              <Link
                key={path}
                href={path}
                className={`
    font-medium transition-colors px-3 py-2 rounded-lg
    ${pathname === path ? "bg-red-600 text-white shadow-lg" : "text-black"}
    hover:text-white hover:bg-gradient-to-r hover:from-red-700 hover:to-gray-900
  `}
              >
                {label}
              </Link>

            ))}
          </nav>
        </div>
      )}

      {/* Auth Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[100] p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative"
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-red-600"
              aria-label="Close modal"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h2>

            {/* Form */}
            <form
              onSubmit={isRegister ? handleRegister : handleLogin}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {isRegister && (
                <>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                    required
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                    required
                  />
                  <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                    required
                  />
                  {/* Subscribe Checkbox */}
                  <div className="col-span-2 flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      name="subscribe"
                      checked={formData.subscribe}
                      onChange={handleChange}
                      className="w-4 h-4 accent-red-600"
                      id="subscribe"
                    />
                    <label
                      htmlFor="subscribe"
                      className="text-sm text-red-600 underline cursor-pointer"
                      onClick={() => setShowSubscribePopup(true)}
                    >
                      I want to subscribe to Blinkmaid updates and offers.
                    </label>
                  </div>
                </>
              )}

              {/* Email */}
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="col-span-2 w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                required
              />

              {/* Password */}
              <div className="col-span-2 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border px-4 py-3 pr-10 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`col-span-2 w-full py-3 rounded-xl text-white font-semibold transition-all duration-200 flex items-center justify-center ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-black to-red-600 hover:from-red-600 hover:to-black shadow-lg"
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
            <p className="text-center text-sm text-gray-600 mt-3">
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

            {/* Membership Info */}
            <div className="border-t border-gray-300 mt-6 pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Blinkmaid Membership Details
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Enjoy premium benefits with your free Blinkmaid account.
                No payment is required for now.
              </p>
              <div className="bg-gray-50 border rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <span>Plan:</span>
                  <span className="font-medium">Basic Monthly</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Price:</span>
                  <span className="font-semibold text-red-600">₹199.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-red-600 font-semibold">
                    Active (Demo)
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                *Displayed for demo. Payment integration will be added later.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Popup */}
      {showSubscribePopup && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[200] p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 relative">
            <button
              onClick={() => setShowSubscribePopup(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-red-600"
              aria-label="Close popup"
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-semibold text-gray-800 mb-3 text-center">
              Blinkmaid Subscription
            </h2>

            <p className="text-gray-600 text-sm mb-5 text-center leading-relaxed">
              Subscribe now to get{" "}
              <span className="font-semibold text-red-600">15–20% off</span> all
              services! You’ll also receive exclusive updates and seasonal offers.
            </p>
            <button
              onClick={async () => {
                setLoading(true);
                await handleSubscription();
                setLoading(false);
                setFormData((prev) => ({ ...prev, subscribe: true }));
                setShowSubscribePopup(false);
                alert("Subscription activated and saved successfully!");
              }}
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center transition-all duration-200 ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 shadow-lg"
                }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Processing...
                </>
              ) : (
                "Proceed to Pay"
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
