"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  ClipboardList,
  DollarSign,
  Percent,
  Trash2,
  Search,
  FileDown,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ServiceBookings() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch all bookings
  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // 🔹 Delete booking
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (!error) {
      alert("✅ Booking deleted successfully!");
      fetchBookings();
    }
  };

  // 🔹 Filter bookings
  const filteredBookings = bookings.filter((b) =>
    [
      b.service_name,
      b.sub_service_name,
      b.city,
      b.final_amount,
      b.total_price,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // 🔹 Download Excel
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      bookings.map((b) => ({
        "Service Name": b.service_name,
        "Sub-Service": b.sub_service_name,
        City: b.city,
        "Service Price": `₹${b.service_price}`,
        "Sub-Service Price": `₹${b.sub_service_price}`,
        "Total Price": `₹${b.total_price}`,
        "Discount Applied": b.discount_applied ? "Yes" : "No",
        "Final Amount": `₹${b.final_amount}`,
        "Date": new Date(b.created_at).toLocaleString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
    XLSX.writeFile(workbook, "service_bookings.xlsx");
  };

  // 🔹 Download PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Service Bookings", 14, 15);
    const tableColumn = [
      "Service",
      "Sub-Service",
      "City",
      "Total Price",
      "Discount",
      "Final Amount",
      "Date",
    ];
    const tableRows = bookings.map((b) => [
      b.service_name,
      b.sub_service_name,
      b.city,
      `₹${b.total_price}`,
      b.discount_applied ? "Yes" : "No",
      `₹${b.final_amount}`,
      new Date(b.created_at).toLocaleDateString(),
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 10 },
    });

    doc.save("service_bookings.pdf");
  };

  // 🔹 Stats
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce(
    (sum, b) => sum + (b.final_amount || 0),
    0
  );
  const avgAmount =
    totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(2) : 0;

  return (
    <div className="min-h-screen w-full flex flex-col overflow-hidden bg-gray-100 text-gray-900">
      {/* 🔴 Header */}
      <header className="bg-gradient-to-r from-red-700 to-black px-8 py-6 flex-shrink-0 rounded-b-2xl shadow-md text-white">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Service <span className="text-white">Bookings</span>
        </h1>
        <p className="text-gray-300 mt-1">
          View and manage all service bookings with detailed analytics.
        </p>
      </header>

      {/* 🧾 Main Content */}
      <main className="flex-grow px-8 py-10 bg-gray-100 space-y-10">
        {/* 🔹 Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: ClipboardList, title: "Total Bookings", value: totalBookings },
            { icon: DollarSign, title: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}` },
            { icon: Percent, title: "Avg Amount", value: `₹${avgAmount}` },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="relative group bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-300"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500 to-red-700 opacity-0 group-hover:opacity-10 transition duration-300"></div>
                <div className="flex items-center justify-between">
                  <div className="bg-red-100 p-3 rounded-xl text-red-600 shadow-sm group-hover:bg-red-200 transition">
                    <Icon size={28} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                </div>
                <p className="mt-3 text-gray-700 font-semibold text-lg">{item.title}</p>
              </div>
            );
          })}
        </section>

        {/* 📋 Bookings Table */}
        <section className="bg-white border border-gray-300 rounded-2xl p-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
              <ClipboardList className="text-red-600 w-6 h-6" />
              Booking List
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by service, city..."
                  className="border border-gray-300 rounded-xl pl-10 pr-4 py-2 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-red-400 outline-none w-full sm:w-80"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Download Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadExcel}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <FileSpreadsheet size={18} /> Excel
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  <FileDown size={18} /> PDF
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-inner">
            {loading ? (
              <div className="text-center py-12 text-gray-700">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-3"></div>
                <p>Loading bookings...</p>
              </div>
            ) : (
              <table className="min-w-full text-sm text-gray-800">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold border-b">
                  <tr>
                    <th className="px-6 py-3 text-left">Service</th>
                    <th className="px-6 py-3 text-left">Sub-Service</th>
                    <th className="px-6 py-3 text-left">City</th>
                    <th className="px-6 py-3 text-left">Total Price</th>
                    <th className="px-6 py-3 text-left">Discount</th>
                    <th className="px-6 py-3 text-left">Final Amount</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-gray-500">
                        <Search className="inline-block w-5 h-5 mr-2 text-gray-400" />
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">{b.service_name}</td>
                        <td className="px-6 py-4">{b.sub_service_name || "—"}</td>
                        <td className="px-6 py-4">{b.city}</td>
                        <td className="px-6 py-4">₹{b.total_price}</td>
                        <td className="px-6 py-4">{b.discount_applied ? "Yes" : "No"}</td>
                        <td className="px-6 py-4">₹{b.final_amount}</td>
                        <td className="px-6 py-4">
                          {new Date(b.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 flex justify-center">
                          <button
                            className="text-red-600 hover:text-red-500"
                            onClick={() => handleDelete(b.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
