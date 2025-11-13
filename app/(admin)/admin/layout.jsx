"use client";

import AdminSidebar from "../../components/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-black via-gray-900 to-red-950 border-r border-gray-800 flex-shrink-0 h-screen overflow-y-auto">
        <AdminSidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#0a0a0a] p-8">
        {children}
      </main>
    </div>
  );
}
