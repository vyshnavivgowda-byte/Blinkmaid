"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const mockPricingData = {
  services: {
    ServiceSet2: {
      "Deep Cleaning": {
        Description:
          "Thorough cleaning of all rooms, including hard-to-reach areas.",
        OPTIONS: "Stain Removal,Appliance Exteriors,Cabinet Wipe Down,Window Sills",
        "4 Hrs": "₹2,500",
        "6 Hrs": "₹3,500",
        "8 Hrs": "₹4,500",
      },
      "Regular Maintenance": {
        Description: "Weekly or bi-weekly cleaning to keep your home tidy and fresh.",
        OPTIONS: "Dusting,Vacuuming,Mopping,Bathroom Sanitization",
        "3 Hrs": "₹1,500",
        "4 Hrs": "₹2,000",
        "6 Hrs": "₹3,000",
      },
      "Move-in/Move-out": {
        Description: "Comprehensive cleaning for empty homes before or after moving.",
        OPTIONS: "Wall Spot Cleaning,Inside Cabinets,Oven Interior,Deep Floor Scrub",
        "8 Hrs": "₹5,000",
        "10 Hrs": "₹6,500",
      },
      "Laundry & Ironing": {
        Description: "Professional washing, drying, and ironing services.",
        OPTIONS: "Sorting,Washing,Folding,Ironing",
        "2 Hrs": "₹1,200",
        "3 Hrs": "₹1,800",
      },
      Note: "Prices are indicative and may vary based on actual area.",
    },
  },
  subscriptionModel: {
    pricing: {
      Monthly: "₹5000",
      Quarterly: "₹14000",
      Annual: "₹50000",
    },
    benefits: [
      "Priority Booking",
      "10% Discount",
      "Free Deep Clean (Annual Only)",
      "Dedicated Manager",
    ],
  },
};

const Pricing = () => {
  const [cities, setCities] = useState([]); // 🏙 fetched from DB
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);

  const data = mockPricingData;
  const serviceSetKey = "ServiceSet2";
  const services = data.services[serviceSetKey];

  // 🔹 Fetch cities from Supabase
  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      const { data, error } = await supabase
        .from("cities")
        .select("id, name, image")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching cities:", error);
      } else {
        setCities(data || []);
      }
      setLoadingCities(false);
    };

    fetchCities();
  }, []);

  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const subscriptionPrice = Object.entries(data.subscriptionModel.pricing).reduce(
    (acc, [duration, price]) => {
      const numericPrice = parseInt(price.replace(/[^0-9]/g, ""));
      const serviceFactor = selectedServices.length || 1;
      const calculatedPrice = numericPrice + serviceFactor * 1000;
      return { ...acc, [duration]: calculatedPrice };
    },
    {}
  );

  return (
    <div className="bg-gray-50 w-full font-sans relative overflow-hidden min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-red-700 via-black to-red-700 text-white pt-40 pb-28 px-6 md:px-20 text-center relative overflow-hidden">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-md relative z-10">
          Our <span className="text-red-300">Pricing</span>
        </h1>
        <p className="text-gray-200 text-lg max-w-3xl mx-auto">
          Choose flexible maid service plans designed for your lifestyle.
        </p>
      </section>

      {/* 🏙 City Selection */}
      <section className="py-20 px-6 md:px-20 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6">
            Select Your <span className="text-red-600">City</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choose your location to explore personalized pricing and services.
          </p>
          <div className="w-28 h-1 bg-gradient-to-r from-red-600 to-black mx-auto mt-6 rounded-full" />
        </div>

        {loadingCities ? (
          <p className="text-center text-gray-600">Loading cities...</p>
        ) : cities.length === 0 ? (
          <p className="text-center text-gray-600">No cities found in database.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 max-w-6xl mx-auto">
            {cities.map((city) => {
              const isSelected = selectedCity === city.name;
              return (
                <div
                  key={city.id}
                  onClick={() => setSelectedCity(city.name)}
                  className={`relative group cursor-pointer transition-all duration-500
                    rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2
                    ${isSelected ? "ring-4 ring-red-500" : "ring-0"}`}
                >
                  <div className="relative w-full h-56">
                    <img
                      src={
                        city.image ||
                        "https://placehold.co/400x250/9ca3af/ffffff?text=City+Image"
                      }
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 opacity-90" />
                  </div>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <h3 className="text-2xl font-extrabold uppercase tracking-wide drop-shadow-lg">
                      {city.name}
                    </h3>
                    {isSelected && (
                      <p className="mt-2 text-sm text-red-300 font-medium">
                        Selected ✓
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 🧹 Services */}
      {selectedCity && (
        <section className="py-20 px-6 md:px-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center text-gray-900">
              Our Services in{" "}
              <span className="text-red-600 capitalize">{selectedCity}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {Object.entries(services).map(([category, details]) => {
                if (category === "Note") return null;
                const options = details.OPTIONS?.split(",") || [];
                const pricing = Object.entries(details)
                  .filter(([k]) => k !== "OPTIONS" && k !== "Description")
                  .map(([hours, price]) => ({ hours, price }));

                return (
                  <div
                    key={category}
                    className={`bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg hover:shadow-2xl p-8 border-2 transition-all duration-500 ${
                      selectedServices.includes(category)
                        ? "border-red-600 scale-[1.02]"
                        : "border-gray-100 hover:border-red-200"
                    } cursor-pointer`}
                    onClick={() => toggleService(category)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {category}
                      </h3>
                      {selectedServices.includes(category) && (
                        <CheckCircle className="h-6 w-6 text-red-600 fill-red-100 animate-pulse" />
                      )}
                    </div>

                    {details.Description && (
                      <p className="mb-4 text-sm text-gray-600">
                        {details.Description}
                      </p>
                    )}

                    <ul className="mb-6 space-y-2">
                      {options.map((opt, i) => (
                        <li key={i} className="flex items-center space-x-2 text-sm text-gray-700">
                          <CheckCircle className="text-red-600 h-5 w-5" />
                          <span>{opt}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      {pricing.map((p, i) => (
                        <div
                          key={i}
                          className="bg-red-50 rounded-xl p-3 text-center border border-red-100 hover:bg-red-100 transition"
                        >
                          <p className="font-semibold text-gray-800">{p.hours}</p>
                          <p className="text-red-700 font-bold text-xl">
                            ₹
                            {p.price
                              ?.replace(/[^0-9]/g, "")
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-sm text-gray-500 mt-12 italic">
              {services.Note}
            </p>
          </div>
        </section>
      )}

      {/* 💳 Subscription Plans */}
      {selectedServices.length > 0 && (
        <section className="bg-gradient-to-r from-red-700 via-black to-red-700 text-white py-20 px-6 md:px-20 text-center">
          <h2 className="text-4xl font-extrabold mb-12">Subscription Plans</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {Object.entries(subscriptionPrice).map(([duration, price]) => (
              <div
                key={duration}
                className="bg-white text-gray-900 rounded-3xl shadow-xl hover:shadow-2xl hover:border-red-600 border-4 border-transparent transform hover:scale-[1.02] transition-all duration-300 p-8"
              >
                <h3 className="text-2xl font-bold mb-2 text-red-600">
                  {duration}
                </h3>
                <p className="text-5xl font-extrabold mb-4 text-black">
                  ₹{price.toLocaleString()}
                </p>
                <ul className="text-left space-y-3 border-t pt-4">
                  {data.subscriptionModel.benefits.map((b, i) => (
                    <li key={i} className="flex items-center text-gray-700 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {b}
                    </li>
                  ))}
                </ul>
                <button className="mt-6 w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition">
                  Subscribe Now
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Pricing;
