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
  UserCheck,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    maids: 0,
    enquiries: 0,
    subscribers: 0,
    users: 0,
    bookings: 0,
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
        bookings: bookingCount || 0,
      });
    }

    fetchStats();
  }, []);

  return (
    <div className="w-full flex flex-col overflow-hidden">

      {/* HEADER */}
      <header className="bg-gradient-to-r from-red-700 to-black px-6 sm:px-8 py-6 flex-shrink-0 rounded-b-2xl shadow-md text-white">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Admin <span className="text-white">Dashboard</span>
        </h1>
        <p className="text-gray-300 mt-1 text-sm sm:text-base">
          Monitor your Blinkmaid performance — maids, enquiries, bookings, subscribers & users.
        </p>
      </header>

      <main className="flex-grow px-4 sm:px-8 py-6 text-gray-900 overflow-y-auto">

        

        {/* STATS SECTION */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { icon: Users, title: "Total Maids", value: stats.maids },
            { icon: ClipboardList, title: "Total Enquiries", value: stats.enquiries },
            { icon: DollarSign, title: "Total Subscribers", value: stats.subscribers },
            { icon: UserCheck, title: "Registered Users", value: stats.users },
            { icon: Activity, title: "Total Bookings", value: stats.bookings },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="relative group p-4 sm:p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-300 hover:border-gray-400">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500 to-red-700 opacity-0 group-hover:opacity-10 transition duration-300"></div>
                <div className="flex items-center justify-between">
                  <div className="bg-red-100 p-3 rounded-xl text-red-600 shadow-sm group-hover:bg-red-200 transition">
                    <Icon size={28} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{item.value}</p>
                </div>
                <p className="mt-3 text-gray-700 font-semibold text-sm sm:text-lg">{item.title}</p>
              </div>
            );
          })}
        </section>

        {/* RECENT ACTIVITY */}
        <section className="bg-white border border-gray-300 rounded-xl p-4 sm:p-5 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-red-700" size={24} />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Enquiries */}
            <Link href="/admin/enquiries" className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2 hover:shadow-md hover:-translate-y-1 transition duration-200">
              <Bell className="text-red-700" size={24} />
              <h3 className="font-semibold text-base">New Enquiries</h3>
              <p className="text-sm text-gray-600">View the latest customer enquiries.</p>
            </Link>
            {/* Maids */}
            <Link href="/admin/maids" className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2 hover:shadow-md hover:-translate-y-1 transition duration-200">
              <Users className="text-red-700" size={24} />
              <h3 className="font-semibold text-base">New Maids</h3>
              <p className="text-sm text-gray-600">Check newly registered maids.</p>
            </Link>
            {/* Bookings */}
            <Link href="/admin/service-bookings" className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2 hover:shadow-md hover:-translate-y-1 transition duration-200">
              <ClipboardList className="text-red-700" size={24} />
              <h3 className="font-semibold text-base">New Bookings</h3>
              <p className="text-sm text-gray-600">Track recent service bookings.</p>
            </Link>
            {/* Add Services & Plans */}
            <Link href="/admin/admin-services" className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2 hover:shadow-md hover:-translate-y-1 transition duration-200">
              <DollarSign className="text-red-700" size={24} />
              <h3 className="font-semibold text-base">Add Services & Plans</h3>
              <p className="text-sm text-gray-600">Create new services or subscription plans.</p>
            </Link>
            {/* List Services & Plans */}
            <Link href="/admin/admin-services/list" className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2 hover:shadow-md hover:-translate-y-1 transition duration-200">
              <ClipboardList className="text-red-700" size={24} />
              <h3 className="font-semibold text-base">List Services & Plans</h3>
              <p className="text-sm text-gray-600">View all services and subscription plans.</p>
            </Link>
            {/* User Lists */}
            <Link href="/admin/users-display" className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2 hover:shadow-md hover:-translate-y-1 transition duration-200">
              <UserCheck className="text-red-700" size={24} />
              <h3 className="font-semibold text-base">User Lists</h3>
              <p className="text-sm text-gray-600">Check all registered users.</p>
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
