"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Edit,
  Save,
  X,
  Bell,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Camera,
  RefreshCw,
} from "lucide-react";

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_RpvE2nM5XUTYN7";
const API_BASE_URL = "/api";

const useRazorpayScript = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
};

export default function ProfilePage() {
  useRazorpayScript();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newMaid, setNewMaid] = useState("");
  const [changeReason, setChangeReason] = useState("");
  const [updatingMaid, setUpdatingMaid] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const fetchBookings = useCallback(async (userId) => {
    setLoadingBookings(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) setBookings(data);
    setLoadingBookings(false);
  }, []);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.getUser();

    if (authError || !data?.user) {
      setError("Unable to load profile. Please log in.");
      setLoading(false);
      return;
    }

    const user = data.user;

    const profileData = {
      name: user.user_metadata?.name || "Not Provided",
      phone: user.user_metadata?.phone || "Not Provided",
      address: user.user_metadata?.address || "Not Provided",
      location: user.user_metadata?.location || "Not Provided",
      email: user.email,
      avatar: user.user_metadata?.avatar_url || null,
      subscription: null,
    };

    const { data: subscriptions, error: subError } = await supabase
      .from("subscribers")
      .select("*")
      .eq("email", profileData.email)
      .order("subscribed_at", { ascending: false });

    if (subError) {
      console.error("Error fetching subscription:", subError);
    } else {
      if (subscriptions && subscriptions.length > 0) {
        profileData.subscription = subscriptions[0];
      }
    }

    setUserData(profileData);
    setEditData(profileData);
    fetchBookings(user.id);
    setLoading(false);
  }, [fetchBookings]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        name: editData.name,
        phone: editData.phone,
        address: editData.address,
        location: editData.location,
      },
    });

    if (!error) {
      await fetchProfile();
      setIsEditing(false);
    } else {
      console.error("Error updating profile:", error);
      alert("Failed to save changes.");
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setEditData(userData);
    setIsEditing(false);
  };

  const openChangeMaidModal = (booking) => {
    setSelectedBooking(booking);
    setNewMaid("");
    setChangeReason("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
    setNewMaid("");
    setChangeReason("");
  };

  const handleChangeMaid = async () => {
    if (!newMaid.trim()) {
      alert("Please enter a maid name or ID.");
      return;
    }
    if (!changeReason.trim()) {
      alert("Please provide a reason.");
      return;
    }

    setUpdatingMaid(true);

    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      alert("Authentication error. Please log out and log back in.");
      setUpdatingMaid(false);
      return;
    }

    const user = authData.user;

    const { error: insertError } = await supabase
      .from("maid_changes")
      .insert({
        booking_id: selectedBooking.id,
        new_maid_id: newMaid,
        change_reason: changeReason,
        changed_by: user.id,
        previous_maid_id: selectedBooking.maid_id || null,
      });

    if (insertError) {
      console.error("Failed to log maid change:", insertError);
      alert("Failed to log maid change.");
      setUpdatingMaid(false);
      return;
    }

const { error: updateError } = await supabase
  .from("bookings")
  .update({ maid_id: newMaid })
  .eq("id", selectedBooking.id)
  .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to update maid in booking:", updateError);
      alert("Failed to update maid in booking.");
      setUpdatingMaid(false);
      return;
    }

    await fetchBookings(user.id);
    setUpdatingMaid(false);
    alert("Maid changed successfully!");
    closeModal();
  };

  const handleRazorpaySubscription = useCallback(async (plan) => {
    if (paymentProcessing) return;
    setPaymentProcessing(true);

    const { duration, price, discount } = plan;

    try {
      const response = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.price,
          currency: "INR",
          plan_duration: plan.duration,
          user_email: userData.email,
        }),
      });


      if (!response.ok) {
        const text = await response.text(); // Debug: Log HTML if not JSON
        console.error("Response not OK:", response.status, text);
        throw new Error(`Failed to create Razorpay order: ${response.status}`);
      }

      const orderData = await response.json();
      const orderId = orderData.id;      // Razorpay returns { id: "order_ABC" }
      const finalAmount = orderData.amount;

      const options = {
        key: rzp_test_RpvE2nM5XUTYN7,
        amount: finalAmount,
        currency: "INR",
        name: "Home Service Subscription",
        description: `${duration} Subscription - ${discount} OFF`,
        order_id: orderId,
        handler: async function (paymentResponse) {
          try {
            const verificationResponse = await fetch(`/api/verify-razorpay-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                user_email: userData.email,
                user_name: userData.name,
                user_phone: userData.phone,
                plan_duration: duration,
                plan_price: price,
              }),
            });

            if (!verificationResponse.ok) {
              const text = await verificationResponse.text();
              console.error("Verification failed:", verificationResponse.status, text);
              throw new Error("Payment verification failed on server.");
            }

            alert("Subscription successful! Thank you for subscribing.");
            await fetchProfile();
          } catch (verifyError) {
            console.error("Verification Error:", verifyError);
            alert("Payment successful, but verification failed. Please contact support.");
          }
        },
        prefill: {
          name: userData.name || "Customer",
          email: userData.email,
          contact: userData.phone === "Not Provided" ? "" : userData.phone,
        },
        theme: {
          color: "#dc2626",
        },
      };

      const rzp1 = new window.Razorpay(options);

      rzp1.on("payment.failed", function (response) {
        console.error("Razorpay Error:", response.error);
        alert(`Payment failed: ${response.error.description}`);
      });

      rzp1.open();
    } catch (err) {
      console.error("Order Creation Error:", err);
      alert(err.message || "Could not start payment process. Please try again.");
    } finally {
      setPaymentProcessing(false);
    }
  }, [userData, paymentProcessing, fetchProfile]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-red-500 border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <XCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Error Loading Profile</h2>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const subscriptionPlans = [
    { duration: "3 Months", price: 5999, originalPrice: 6666, discount: "15%", benefits: ["1 Free Replacement", "10% Monthly Salary Discount", "24/7 Customer Support"] },
    { duration: "6 Months", price: 11999, originalPrice: 13332, discount: "18%", benefits: ["1 Free Replacement", "10% Monthly Salary Discount", "24/7 Customer Support"] },
    { duration: "1 Year", price: 19999, originalPrice: 24999, discount: "20%", benefits: ["1 Free Replacement", "10% Monthly Salary Discount", "24/7 Customer Support"] },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 text-gray-900 pb-20">
      <div className="bg-gradient-to-r text-white from-red-700 via-black to-red-700 py-24 text-center shadow-lg">
        <h1 className="text-5xl font-extrabold tracking-wide drop-shadow-xl">
          Your <span className="text-red-300">Profile</span>
        </h1>
        <p className="mt-4 text-gray-300">View and manage your personal details</p>
      </div>

      <div className="max-w-7xl mx-auto mt-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 bg-white p-3 rounded-3xl shadow-xl border border-gray-200 backdrop-blur-sm"
        >
          {[
            { name: "Profile", icon: <User size={20} /> },
            { name: "My Bookings", icon: <Calendar size={20} /> },
            { name: "Subscriptions", icon: <Bell size={20} /> },
          ].map((tab) => (
            <motion.button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 px-6 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 ${activeTab === tab.name
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md"
                }`}
            >
              {tab.icon} {tab.name}
            </motion.button>
          ))}
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="max-w-7xl mx-auto px-6 mt-10"
        >
          {activeTab === "My Bookings" && (
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold mb-8 text-red-700 flex items-center gap-3"
              >
                <Calendar size={32} /> My Bookings
              </motion.h2>
              {loadingBookings ? (
                <div className="text-center py-16">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-12 w-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto"
                  ></motion.div>
                </div>
              ) : bookings.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 bg-white rounded-3xl shadow-xl border border-gray-200"
                >
                  <XCircle size={64} className="text-gray-400 mx-auto mb-6" />
                  <p className="text-gray-600 text-xl">No bookings found. Start booking services today!</p>
                  <button className="mt-6 px-8 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors shadow-lg">
                    Explore Services
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {bookings.map((b, index) => (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.03, y: -5 }}
                      className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-red-700">{b.service_name}</h3>
                        <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                          Active
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">
                        <strong>Sub Service:</strong> {b.sub_service_name}
                      </p>
                      <p className="text-gray-600 mb-3">
                        <strong>City:</strong> {b.city}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
                        <span>Service: ₹{b.service_price}</span>
                        <span>Sub: ₹{b.sub_service_price}</span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        <strong>Total:</strong> ₹{b.total_price}
                      </p>
                      <div className="flex items-center gap-3 mb-4">
                        <strong>Discount:</strong>
                        {b.discount_applied ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            <CheckCircle size={16} /> Applied
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            <XCircle size={16} /> None
                          </span>
                        )}
                      </div>
                      <p className="text-3xl font-bold text-red-600 mb-4">₹{b.final_amount}</p>
                      <p className="text-gray-400 text-sm mb-6">
                        Booked: {new Date(b.created_at).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => openChangeMaidModal(b)}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <RefreshCw size={16} /> Change Maid
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "Profile" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-200"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-4xl font-bold text-red-700 flex items-center gap-3">
                  <User size={32} /> Profile Details
                </h2>
                {!isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Edit size={20} /> Edit Profile
                  </motion.button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField
                  icon={<User size={20} />}
                  label="Full Name"
                  name="name"
                  value={editData.name}
                  isEditing={isEditing}
                  onChange={handleEditChange}
                />
                <InputField
                  icon={<Phone size={20} />}
                  label="Phone Number"
                  name="phone"
                  value={editData.phone}
                  isEditing={isEditing}
                  onChange={handleEditChange}
                />
                <InputField
                  icon={<Home size={20} />}
                  label="Address"
                  name="address"
                  textarea
                  value={editData.address}
                  isEditing={isEditing}
                  onChange={handleEditChange}
                />
                <InputField
                  icon={<MapPin size={20} />}
                  label="Location"
                  name="location"
                  value={editData.location}
                  isEditing={isEditing}
                  onChange={handleEditChange}
                />
                <div>
                  <label className="text-red-700 font-semibold flex items-center gap-3 mb-3 text-lg">
                    <Mail size={20} /> Email Address
                  </label>
                  <p className="bg-gray-50 p-5 rounded-2xl border border-gray-300 shadow-sm">{userData.email}</p>
                </div>
                <div>
                  <label className="text-red-700 font-semibold flex items-center gap-3 mb-3 text-lg">
                    <Bell size={20} /> Subscription Status
                  </label>
                  {userData.subscription ? (
                    <div className="bg-green-50 p-5 rounded-2xl border border-green-400 flex items-center gap-3 shadow-sm">
                      <CheckCircle size={24} className="text-green-600" />
                      <span className="text-green-700 font-medium text-lg">Subscribed (Plan: {userData.subscription.plan_duration})</span>
                    </div>
                  ) : (
                    <div className="bg-red-50 p-5 rounded-2xl border border-red-400 flex items-center gap-3 shadow-sm">
                      <XCircle size={24} className="text-red-600" />
                      <span className="text-red-700 font-medium text-lg">Not Subscribed</span>
                    </div>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex gap-6 mt-12 justify-center"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 flex items-center gap-3 shadow-lg transition-all"
                    >
                      <Save size={20} /> {saving ? "Saving..." : "Save Changes"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancel}
                      className="px-8 py-4 bg-gray-400 text-white rounded-2xl hover:bg-gray-500 flex items-center gap-3 shadow-lg transition-all"
                    >
                      <X size={20} /> Cancel
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === "Subscriptions" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-200"
            >
              <h2 className="text-4xl font-bold mb-8 text-red-700 flex items-center gap-3">
                <Bell size={32} /> Subscriptions
              </h2>
              {userData.subscription ? (
                <div className="text-center py-12">
                  <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
                  <p className="text-gray-700 text-xl mb-6">You're subscribed! Enjoy exclusive updates and offers.</p>
                  <div className="bg-gray-50 p-6 rounded-2xl mb-6">
                    <h3 className="text-2xl font-bold text-red-700 mb-4">Your Plan Details (Latest Subscription)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      <p className="text-gray-700"><strong>Plan Duration:</strong> {userData.subscription.plan_duration}</p>
                      <p className="text-gray-700"><strong>Plan Price:</strong> ₹{userData.subscription.plan_price}</p>
                      <p className="text-gray-700"><strong>Subscribed At:</strong> {new Date(userData.subscription.subscribed_at).toLocaleDateString()}</p>
                      <p className="text-gray-700"><strong>Benefits:</strong> 1 Free Maid Replacement, 10% Monthly Salary Discount, 24/7 Customer Support</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-200"
                  >
                    <p className="text-center text-gray-600 mb-12">
                      Save more with our 3, 6, or 12-month subscriptions — enjoy up to
                      <span className="text-red-600 font-bold"> 20% OFF </span>
                      your selected service!
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                      {subscriptionPlans.map((plan, index) => (
                        <motion.div
                          key={plan.duration}
                          whileHover={{ scale: 1.05, y: -5 }}
                          className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8"
                        >
                          <h3 className="text-2xl font-bold text-center mb-2">{plan.duration}</h3>
                          <p className="text-center text-gray-500 mb-4">
                            Save <span className="text-red-600 font-bold">{plan.discount}</span> on your selected service
                          </p>

                          <div className="text-center mb-6">
                            <p className="line-through text-gray-400 text-xl">₹{plan.originalPrice}</p>
                            <p className="text-red-600 text-4xl font-extrabold">₹{plan.price}</p>
                          </div>

                          <ul className="text-gray-600 space-y-3 mb-6">
                            {plan.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-center"><CheckCircle className="text-green-500 mr-2" /> {benefit}</li>
                            ))}
                          </ul>

                          <button
                            onClick={() => handleRazorpaySubscription(plan)}
                            disabled={paymentProcessing}
                            className="w-full bg-red-500 text-white py-3 rounded-2xl hover:bg-red-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <CreditCard size={20} />
                            {paymentProcessing ? "Processing..." : "Subscribe Now"}
                          </button>
                        </motion.div>
                      ))}
                    </div>

                    <p className="text-gray-500 mb-4">Just purchased a subscription? Click below to sync your status.</p>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={fetchProfile}
                      className="px-8 py-3 bg-gray-600 text-white rounded-2xl hover:bg-gray-700 transition-colors shadow-lg flex items-center gap-2 mx-auto disabled:opacity-50"
                      disabled={loading}
                    >
                      <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                      {loading ? "Refreshing..." : "Check Status Again"}
                    </motion.button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-red-700 mb-6 flex items-center gap-3">
                <RefreshCw size={24} /> Change Maid for Booking
              </h3>
              {selectedBooking && (
                <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
                  <p className="text-gray-700 mb-2"><strong>Service:</strong> {selectedBooking.service_name}</p>
                  <p className="text-gray-700 mb-2"><strong>Sub Service:</strong> {selectedBooking.sub_service_name}</p>
                  <p className="text-gray-700 mb-2"><strong>City:</strong> {selectedBooking.city}</p>
                  <p className="text-gray-700"><strong>Current Maid:</strong> {selectedBooking.maid_id || "Not Assigned"}</p>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Maid ID/Name:</label>
                <input
                  type="text"
                  value={newMaid}
                  onChange={(e) => setNewMaid(e.target.value)}
                  placeholder="e.g., Maid123 or John Doe"
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Reason for Change:</label>
                <textarea
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="e.g., Maid is unavailable, poor service, etc."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleChangeMaid}
                  disabled={updatingMaid}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg disabled:opacity-50"
                >
                  {updatingMaid ? "Updating..." : "Change Maid"}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-400 text-white py-3 rounded-2xl hover:bg-gray-500 transition-all shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputField({ icon, label, name, value, onChange, isEditing, textarea }) {
  return (
    <div className="md:col-span-1">
      <label className="text-red-700 font-semibold flex items-center gap-3 mb-3 text-lg">
        {icon} {label}
      </label>

      {isEditing ? (
        textarea ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            rows={4}
            className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm"
          ></textarea>
        ) : (
          <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm"
          />
        )
      ) : (
        <p className="bg-gray-50 p-5 rounded-2xl border border-gray-300 shadow-sm">{value}</p>
      )}
    </div>
  );
}