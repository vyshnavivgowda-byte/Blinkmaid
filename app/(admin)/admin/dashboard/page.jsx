"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  Users,
  ClipboardList,
  DollarSign,
  Activity,
  Bell,
  CheckCircle2,
  UserCheck,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    maids: 0,
    enquiries: 0,
    subscribers: 0,
    users: 0,
    bookings: 0, // ⭐ NEW
  });

  useEffect(() => {
    async function fetchStats() {
      const { count: maidCount } = await supabase
        .from("maids")
        .select("*", { count: "exact", head: true });

      const { count: enquiryCount } = await supabase
        .from("enquiries")
        .select("*", { count: "exact", head: true });

      const { count: subscriberCount } = await supabase
        .from("subscribers")
        .select("*", { count: "exact", head: true });

      const { count: bookingCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true });

      const response = await fetch("/api/admin/users");
      const userData = await response.json();

      setStats({
        maids: maidCount || 0,
        enquiries: enquiryCount || 0,
        subscribers: subscriberCount || 0,
        users: userData?.users || 0,
        bookings: bookingCount || 0, // ⭐ NEW
      });
    }

    fetchStats();
  }, []);

  return (
    <div className="w-full flex flex-col overflow-hidden bg-gray-100">

      {/* 🔴 HEADER */}
      <header className="bg-gradient-to-r from-red-700 to-black px-8 py-6 flex-shrink-0 rounded-b-2xl shadow-md text-white">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Admin <span className="text-white">Dashboard</span>
        </h1>
        <p className="text-gray-300 mt-1">
          Monitor your Blinkmaid performance — maids, enquiries, bookings, subscribers & users.
        </p>
      </header>

      {/* MAIN */}
      <main className="flex-grow px-8 py-8 bg-gray-100 text-gray-900 overflow-y-auto">

        {/* 🔹 MODERN STATS SECTION */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {[
            {
              icon: Users,
              title: "Total Maids",
              value: stats.maids,
            },
            {
              icon: ClipboardList,
              title: "Total Enquiries",
              value: stats.enquiries,
            },
            {
              icon: DollarSign,
              title: "Total Subscribers",
              value: stats.subscribers,
            },
            {
              icon: UserCheck,
              title: "Registered Users",
              value: stats.users,
            },
            {
              icon: Activity,
              title: "Total Bookings", // ⭐ NEW
              value: stats.bookings,
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="relative group bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-300 hover:border-gray-400"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500 to-red-700 opacity-0 group-hover:opacity-10 transition duration-300"></div>

                <div className="flex items-center justify-between">
                  <div className="bg-red-100 p-3 rounded-xl text-red-600 shadow-sm group-hover:bg-red-200 transition">
                    <Icon size={28} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                </div>

                <p className="mt-3 text-gray-700 font-semibold text-lg">
                  {item.title}
                </p>
              </div>
            );
          })}
        </section>

        {/* 📊 RECENT ACTIVITY (COMPACT) */}
        <section className="bg-white border border-gray-300 rounded-xl p-5 shadow-md mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-red-700" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Activity
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">

            {/* ⭐ New Enquiries */}
            <Link
              href="/admin/enquiries"
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2 hover:shadow-md hover:-translate-y-1 transition duration-200"
            >
              <Bell className="text-red-700" size={24} />
              <h3 className="font-semibold text-base">New Enquiries</h3>
              <p className="text-sm text-gray-600">
                View the latest customer enquiries.
              </p>
            </Link>

            {/* ⭐ New Maids */}
            <Link
              href="/admin/maids"
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2 hover:shadow-md hover:-translate-y-1 transition duration-200"
            >
              <Users className="text-red-700" size={24} />
              <h3 className="font-semibold text-base">New Maids</h3>
              <p className="text-sm text-gray-600">
                Check newly registered maids.
              </p>
            </Link>

            {/* ⭐ New Bookings */}
            <Link
              href="/admin/service-bookings"
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2 hover:shadow-md hover:-translate-y-1 transition duration-200"
            >
              <ClipboardList className="text-red-700" size={24} />
              <h3 className="font-semibold text-base">New Bookings</h3>
              <p className="text-sm text-gray-600">
                Track recent service bookings.
              </p>
            </Link>

          </div>
        </section>


      </main>
    </div>
  );
}
