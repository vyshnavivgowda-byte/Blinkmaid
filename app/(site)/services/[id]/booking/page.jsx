"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingPage() {
  const router = useRouter();

  const [bookingInfo, setBookingInfo] = useState(null);
  const [service, setService] = useState(null);
  const [subService, setSubService] = useState(null);
  const [cities, setCities] = useState([]);

  const [bookingData, setBookingData] = useState({
    startDate: "",
    workTime: "",
    notes: "",
  });

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState("");
  const [planBenefits, setPlanBenefits] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  const [totalPrice, setTotalPrice] = useState(0);
  const [step, setStep] = useState(3);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [loadingPayment, setLoadingPayment] = useState(false);

  /* -------------------------------------------------------
      LOAD BOOKING INFO
  ------------------------------------------------------- */
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("bookingInfo") || "null");
    if (!data) {
      router.replace("/");
      return;
    }
    setBookingInfo(data);
    setTotalPrice(Number(data.totalPrice));
  }, []);

  /* -------------------------------------------------------
      FETCH SERVICE DETAILS
  ------------------------------------------------------- */
  useEffect(() => {
    if (!bookingInfo) return;

    const fetchDetails = async () => {
      const { data: serviceData } = await supabase
        .from("services")
        .select("*")
        .eq("id", bookingInfo.serviceId)
        .single();
      setService(serviceData);

      const { data: subServiceData } = await supabase
        .from("sub_services")
        .select("*")
        .eq("id", bookingInfo.subServiceId)
        .single();
      setSubService(subServiceData);

      const { data: citiesData } = await supabase.from("cities").select("*");
      setCities(citiesData || []);
    };

    fetchDetails();
  }, [bookingInfo]);

  /* -------------------------------------------------------
      CHECK SUBSCRIPTION
  ------------------------------------------------------- */
  useEffect(() => {
    const checkSubscription = async () => {
      setLoadingSubscription(true);

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setIsSubscribed(false);
          return;
        }

        const { data, error } = await supabase
          .from("subscribers")
          .select("plan_duration, plan_benefits")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Supabase subscribers query error:", error);
          setIsSubscribed(false);
        } else if (data) {
          setIsSubscribed(true);
          setSubscriptionPlan(data.plan_duration);
          setPlanBenefits(data.plan_benefits);
          console.log("User is subscribed:", user.email, data);
        } else {
          setIsSubscribed(false);
          console.log("User is NOT subscribed:", user.email);
        }
      } catch (err) {
        console.error("Subscription check error:", err);
        setIsSubscribed(false);
      } finally {
        setLoadingSubscription(false);
      }
    };

    checkSubscription();
  }, []);

  /* -------------------------------------------------------
      HANDLE PAYMENT WITH RAZORPAY
  ------------------------------------------------------- */
  const handlePayment = async () => {
    if (!bookingData.startDate || !bookingData.workTime) {
      return alert("Please select date and time.");
    }

    setLoadingPayment(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingPayment(false);
        return alert("Please log in to book.");
      }

      const selectedCity =
        cities.find((c) => c.id === bookingInfo.cityId)?.name || "";

      const finalAmount = (isSubscribed || discountApplied)
        ? Math.round(totalPrice * 0.8)
        : totalPrice;

      // Insert booking as pending
      const { data: booking, error: insertError } = await supabase
        .from("bookings")
        .insert([{
          user_id: user.id,
          service_name: service?.name,
          sub_service_name: subService?.name,
          city: selectedCity,
          service_price: Number(service?.price || 0),
          sub_service_price: Number(subService?.price || 0),
          total_price: Number(totalPrice),
          discount_applied: discountApplied,
          final_amount: Number(finalAmount),
          booking_date: bookingData.startDate,
          work_time: bookingData.workTime,
          notes: bookingData.notes,
          payment_status: "pending",
        }])
        .select("id");

      if (insertError || !booking?.[0]?.id) {
        console.error("Booking insert error:", insertError);
        throw new Error("Booking creation failed before payment.");
      }

      const bookingId = booking[0].id;

      // Create Razorpay order
      const res = await fetch("/api/create-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalAmount * 100, currency: "INR" }),
      });
      const order = await res.json();
      if (!order?.id) throw new Error("Razorpay order creation failed");

      if (!window.Razorpay) {
        alert("Payment gateway not loaded. Please refresh.");
        setLoadingPayment(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "Blinkmaid",
        description: `${service?.name} - ${subService?.name}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/verify-booking", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
              await supabase.from("bookings").update({ payment_status: "failed" }).eq("id", bookingId);
              alert("Payment verification failed");
              setLoadingPayment(false);
              return;
            }

            await supabase.from("bookings").update({
              payment_status: "paid",
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
            }).eq("id", bookingId);

            alert("Booking confirmed & payment successful!");
            localStorage.removeItem("bookingInfo");
            router.push("/home");

          } catch (verifyErr) {
            console.error("Payment verification error:", verifyErr);
            alert("Payment verification failed. Contact support.");
            setLoadingPayment(false);
          }
        },
        modal: {
          ondismiss: async () => {
            await supabase.from("bookings").update({ payment_status: "failed" }).eq("id", bookingId);
            setLoadingPayment(false);
          },
        },
        prefill: {
          name: user.user_metadata?.full_name || "",
          email: user.email,
        },
        theme: { color: "#f87171" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Payment process error:", err);
      alert("Payment failed. Try again.");
      setLoadingPayment(false);
    }
  };

  if (!service || !subService)
    return <p className="text-center mt-20">Loading booking details...</p>;

  /* -------------------------------------------------------
      UI START
  ------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 p-6">
      <motion.section className="max-w-5xl mx-auto bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-100/50">
        <h2 className="text-4xl font-extrabold text-center mb-8 text-gray-800">
          {step === 3 ? (
            <>Work <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">Shifts & Booking</span></>
          ) : (
            <>Review <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">Summary</span></>
          )}
        </h2>

        <AnimatePresence mode="wait">
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }}>
              {/* Booking Form */}
              <form className="space-y-6 max-w-lg mx-auto">
                <div>
                  <label className="block font-bold mb-2 text-gray-700">Start Date *</label>
                  <input type="date" className="w-full border-2 border-gray-300 rounded-lg p-3" value={bookingData.startDate} onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="block font-bold mb-2 text-gray-700">Work Time *</label>
                  <input type="time" className="w-full border-2 border-gray-300 rounded-lg p-3" value={bookingData.workTime} onChange={(e) => setBookingData({ ...bookingData, workTime: e.target.value })} />
                </div>
                <div>
                  <label className="block font-bold mb-2 text-gray-700">Notes</label>
                  <textarea rows={4} className="w-full border-2 border-gray-300 rounded-lg p-3" value={bookingData.notes} onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })} />
                </div>

                {!loadingSubscription ? (
                  !isSubscribed ? (
                    <p className="text-gray-600 mt-2 text-center">
                      ✨ Blinkmaid Subscribers get 20% OFF —{" "}
                      <span className="text-red-600 underline cursor-pointer" onClick={() => router.push("/subscribe")}>Upgrade Now</span>
                    </p>
                  ) : (
                    <div className="text-green-600 font-semibold text-center mt-2">
                      <p>Subscribed (Plan: {subscriptionPlan})</p>
                      {planBenefits && <p>Benefits: {planBenefits}</p>}
                    </div>
                  )
                ) : (
                  <p className="text-center text-gray-500">Checking subscription...</p>
                )}
              </form>

              <div className="flex justify-between mt-8 max-w-lg mx-auto">
                <button className="px-6 py-3 bg-gray-100 rounded-xl text-gray-800" disabled>← Previous</button>
                <button onClick={() => setStep(4)} className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700">Next → Review</button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }}>
              {/* Review Step */}
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-gray-50 border p-6 rounded-2xl">
                  <h3 className="text-lg font-bold mb-3">Booking Details</h3>
                  <p><strong>Service:</strong> {service.name}</p>
                  <p><strong>Sub-Service:</strong> {subService.name}</p>
                  <p><strong>City:</strong> {cities.find((x) => x.id === bookingInfo.cityId)?.name}</p>
                </div>

                <div className="bg-red-50 border p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-red-800 mb-3">Pricing & Schedule</h3>
                  <p>
                    <strong>Total Price:</strong>{" "}
                    {discountApplied || isSubscribed ? (
                      <>
                        <span className="line-through text-gray-500">₹{totalPrice}</span>{" "}
                        <span className="text-green-600 font-bold">₹{Math.round(totalPrice * 0.8)}</span>
                      </>
                    ) : <>₹{totalPrice}</>}
                  </p>
                  <p><strong>Date:</strong> {bookingData.startDate}</p>
                  <p><strong>Work Shift:</strong> {bookingData.workTime}</p>
                  <p><strong>Notes:</strong> {bookingData.notes || "None"}</p>
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setStep(3)} className="px-6 py-3 bg-gray-100 rounded-xl text-gray-800">← Edit</button>
                  <button onClick={handlePayment} className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700" disabled={loadingPayment}>
                    {loadingPayment ? "Processing..." : "Pay & Confirm Booking"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  );
}
