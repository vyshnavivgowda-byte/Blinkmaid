"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  ClipboardList,
  Building2,
  BookOpenCheck, // ✅ new icon
  LogOut,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // 🔹 Logout Function
  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    router.push("/admin-login/login");
  };

  // 🔹 Sidebar Links
  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/maids", label: "Maid Registrations", icon: Users },
    { href: "/admin/enquiries", label: "Enquiries", icon: ClipboardList },
    { href: "/admin/admin-services", label: "City Services", icon: Building2 },
    { href: "/admin/service-bookings", label: "Service Bookings", icon: BookOpenCheck }, // ✅ new tab
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col justify-between shadow-xl border-r border-gray-800 z-50">
      {/* 🔹 Logo Section */}
      <div className="flex flex-col items-center px-6 py-8 border-b border-gray-800">
        <div className="relative w-32 h-12 mb-3">
          <Image
            src="/LOGOADMIN.jpg"
            alt="Blinkmaid Admin Logo"
            fill
            className="object-contain rounded-lg"
            priority
          />
        </div>
        <h2 className="text-2xl font-extrabold tracking-wide">
          <span className="text-red-500">Admin Panel</span>
        </h2>
        <p className="text-gray-400 text-sm mt-1">BlinkMaid Management</p>
      </div>

      {/* 🔹 Navigation Links */}
      <nav className="flex flex-col px-4 py-6 space-y-2 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                isActive
                  ? "bg-red-600 text-white shadow-md scale-[1.02]"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={18} className={isActive ? "text-white" : "text-red-400"} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 🔹 Logout Button */}
      <div className="px-4 pb-6 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-md"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
