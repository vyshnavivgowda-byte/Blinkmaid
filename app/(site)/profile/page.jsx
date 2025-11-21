"use client";

import { useEffect, useState } from "react";
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
  RefreshCw, // For Change Maid button
} from "lucide-react";

export default function ProfilePage() {
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
  const [selectedBooking, setSelectedBooking] = useState(null); // Store full booking object
  const [newMaid, setNewMaid] = useState("");
  const [changeReason, setChangeReason] = useState("");
  const [updatingMaid, setUpdatingMaid] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        setError("Unable to load profile");
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
      };

      const { data: subscription } = await supabase
        .from("subscribers")
        .select("*")
        .or(`email.eq."${profileData.email}",phone.eq."${profileData.phone}"`)
        .maybeSingle();

      profileData.subscription = subscription;
      setUserData(profileData);
      setEditData(profileData);

      fetchBookings(user.id);
      setLoading(false);
    };

    const fetchBookings = async (userId) => {
      setLoadingBookings(true);
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error) setBookings(data);
      setLoadingBookings(false);
    };

    fetchProfile();
  }, []);

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
      setUserData(editData);
      setIsEditing(false);
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

// ... existing code ...

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

  const user = await supabase.auth.getUser();

  // First, log the change in maid_changes table
  const { error: insertError } = await supabase
    .from("maid_changes")
    .insert({
      booking_id: selectedBooking.id,
      maid: newMaid,
      change_reason: changeReason,
      changed_by: user.data.user.id,
    });

  if (insertError) {
    console.log(insertError);
    alert("Failed to log maid change.");
    setUpdatingMaid(false);
    return;
  }

  // Now, update the booking to assign the new maid
  const { error: updateError } = await supabase
    .from("bookings")
    .update({ maid_id: newMaid })
    .eq("id", selectedBooking.id);

  if (updateError) {
    console.log(updateError);
    alert("Failed to update maid in booking.");
    setUpdatingMaid(false);
    return;
  }

  // Optionally, refetch bookings to reflect the change
  const fetchBookings = async (userId) => {
    setLoadingBookings(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) setBookings(data);
    setLoadingBookings(false);
  };

  await fetchBookings(user.data.user.id);

  setUpdatingMaid(false);
  alert("Maid changed successfully!");
  closeModal();
};

// ... existing code ...




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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 text-gray-900 pb-20">
      {/* HEADER */}
      <div className="bg-gradient-to-r text-white from-red-700 via-black to-red-700 py-24 text-center shadow-lg">
        <h1 className="text-5xl font-extrabold tracking-wide drop-shadow-xl">
          Your <span className="text-red-300">Profile</span>
        </h1>
        <p className="mt-4 text-gray-300">View and manage your personal details</p>
      </div>

      {/* TABS */}
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

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="max-w-7xl mx-auto px-6 mt-10"
        >
          {/* MY BOOKINGS TAB */}
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

          {/* PROFILE TAB */}
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

              {/* Form Fields */}
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
                      <span className="text-green-700 font-medium text-lg">Subscribed</span>
                    </div>
                  ) : (
                    <div className="bg-red-50 p-5 rounded-2xl border border-red-400 flex items-center gap-3 shadow-sm">
                      <XCircle size={24} className="text-red-600" />
                      <span className="text-red-700 font-medium text-lg">Not Subscribed</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
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

          {/* SUBSCRIPTIONS TAB */}
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
                  <button className="px-10 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg">
                    Manage Subscription
                  </button>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                      {/* 3 MONTHS */}
                      <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8"
                      >
                        <h3 className="text-2xl font-bold text-center mb-2">3 Months</h3>
                        <p className="text-center text-gray-500 mb-4">
                          Save <span className="text-red-600 font-bold">15%</span> on your selected service
                        </p>

                        <div className="text-center mb-6">
                          <p className="line-through text-gray-400 text-xl">₹1000.00</p>
                          <p className="text-red-600 text-4xl font-extrabold">₹850.00</p>
                        </div>

                        <ul className="text-gray-600 space-y-3 mb-6">
                          <li className="flex items-center"><CheckCircle className="text-green-500 mr-2" /> Includes selected cleaning service</li>
                          <li className="flex items-center"><CheckCircle className="text-green-500 mr-2" /> Priority customer support</li>
                          <li className="flex items-center"><CheckCircle className="text-green-500 mr-2" /> Flexible scheduling</li>
                        </ul>

                        <button className="w-full bg-red-500 text-white py-3 rounded-2xl hover:bg-red-600 transition-all shadow-lg">
                          Subscribe Now
                        </button>
                      </motion.div>

                      {/* 6 MONTHS */}
                      <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8"
                      >
                        <h3 className="text-2xl font-bold text-center mb-2">6 Months</h3>
                        <p className="text-center text-gray-500 mb-4">
                          Save <span className="text-red-600 font-bold">18%</span> on your selected service
                        </p>

                        <div className="text-center mb-6">
                          <p className="line-through text-gray-400 text-xl">₹1000.00</p>
                          <p className="text-red-600 text-4xl font-extrabold">₹820.00</p>
                        </div>

                        <ul className="text-gray-600 space-y-3 mb-6">
                          <li className="flex items-center"><CheckCircle className="text-green-500 mr-2" /> Includes selected cleaning service</li>
                          <li className="flex items-center"><CheckCircle className="text-green-500 mr-2" /> Priority customer support</li>
                          <li className="flex items-center"><CheckCircle className="text-green-500 mr-2" /> Flexible scheduling</li>
                        </ul>

                        <button className="w-full bg-red-500 text-white py-3 rounded-2xl hover:bg-red-600 transition-all shadow-lg">
                          Subscribe Now
                        </button>
                      </motion.div>

                      {/* 1 YEAR */}
                      <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8"
                      >
                        <h3 className="text-2xl font-bold text-center mb-2">1 Year</h3>
                        <p className="text-center text-gray-500 mb-4">
                          Save <span className="text-red-600 font-bold">20%</span> on your selected service
                        </p>

                        <div className="text-center mb-6">
                          <p className="line-through text-gray-400 text-xl">₹1000.00</p>
                          <p className="text-red-600 text-4xl font-extrabold">₹800.00</p>
                        </div>

                        <ul className="text-gray-600 space-y-3 mb-6">
                          <li className="flex items-center"><CheckCircle className="text-green-500 mr-2" /> Includes selected cleaning service</li>
                          <li className="flex items-center"><CheckCircle className="text-green-500 mr-2" /> Priority customer support</li>
                          <li className="flex items-center"><CheckCircle className="text-green-500 mr-2" /> Flexible scheduling</li>
                        </ul>

                        <button className="w-full bg-red-500 text-white py-3 rounded-2xl hover:bg-red-600 transition-all shadow-lg">
                          Subscribe Now
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>

                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* MODAL FOR CHANGING MAID */}
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
