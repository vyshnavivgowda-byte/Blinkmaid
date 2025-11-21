"use client";

import AdminSidebar from "../../components/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-white text-black overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-300 flex-shrink-0 h-screen overflow-y-auto">
        <AdminSidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto bg-white p-8 text-black">
        {children}
      </main>
    </div>
  );
}
