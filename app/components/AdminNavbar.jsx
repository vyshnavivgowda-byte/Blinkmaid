"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  ClipboardList,
  Building2,
  DollarSign,
  Settings,
  LogOut,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/maids", label: "Maid Registrations", icon: Users },
    { href: "/admin/enquiries", label: "Enquiries", icon: ClipboardList },
    { href: "/admin/admin-services", label: "City Services", icon: Building2 },
    { href: "/admin/admin-pricing", label: "Pricing & Subscription", icon: DollarSign },
    { href: "/admin/categories", label: "Dynamic Service Editing", icon: Settings },
  ];

  return (
    <aside className="fixed h-screen w-64 bg-gray-900 text-white flex flex-col justify-between shadow-lg">
      {/* Logo / Title */}
      <div className="px-6 py-6 border-b border-gray-700">
        <h2 className="text-2xl font-extrabold text-center tracking-wide">
          Blinkmaid <span className="text-red-500">Admin</span>
        </h2>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col px-4 py-6 space-y-2">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                isActive
                  ? "bg-red-600 text-white shadow-md"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <Icon size={18} className={isActive ? "text-white" : "text-red-400"} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Logout Button */}
      <div className="px-4 pb-6 border-t border-gray-700">
        <button className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-md">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
