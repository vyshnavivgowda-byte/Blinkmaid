"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  ClipboardList,
  IndianRupee,
  Percent,
  Trash2,
  Search,
  FileDown,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useToast } from "@/app/components/toast/ToastContext";

export default function ServiceBookings() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Delete Popup State
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { showToast } = useToast();

  // Fetch all bookings
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

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeletePopup(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("bookings").delete().eq("id", deleteId);
    if (!error) {
      showToast("Booking deleted successfully!", "success");
      fetchBookings();
    } else {
      showToast("Failed to delete booking!", "error");
    }
    setShowDeletePopup(false);
    setDeleteId(null);
  };

  // Filter bookings
  const filteredBookings = bookings.filter((b) =>
    [b.service_name, b.sub_service_name, b.city, b.final_amount, b.total_price]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Download Excel
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
        Date: new Date(b.created_at).toLocaleString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
    XLSX.writeFile(workbook, "service_bookings.xlsx");
    showToast("Excel downloaded!", "success");
  };

  // Download PDF
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
    showToast("PDF downloaded!", "success");
  };

  // Stats
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.final_amount || 0), 0);
  const avgAmount = totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(2) : 0;

  return (
    <div className="min-h-screen w-full flex flex-col overflow-hidden  text-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-700 to-black px-8 py-6 flex-shrink-0 rounded-b-2xl shadow-md text-white">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Service <span className="text-white">Bookings</span>
        </h1>
        <p className="text-gray-300 mt-1">
          View and manage all service bookings with detailed analytics.
        </p>
      </header>

      <main className="flex-grow px-8 py-10 space-y-10">
        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[{ icon: ClipboardList, title: "Total Bookings", value: totalBookings },
            { icon: IndianRupee, title: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}` },
            { icon: Percent, title: "Avg Amount", value: `₹${avgAmount}` }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="relative group p-6 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-300"
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

        {/* Bookings Table */}
        <section className="bg-white border border-gray-300 rounded-2xl p-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
              <ClipboardList className="text-red-600 w-6 h-6" /> Booking List
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by service, city..."
                  className="border border-gray-300 rounded-xl pl-10 pr-4 py-2 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-red-400 outline-none w-full sm:w-80"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleDownloadExcel} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                  <FileSpreadsheet size={18} /> Excel
                </button>
                <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                  <FileDown size={18} /> PDF
                </button>
              </div>
            </div>
          </div>

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
                  {paginatedBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        <Search className="inline-block w-5 h-5 mr-2 text-gray-400" />
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    paginatedBookings.map((b) => (
                      <tr key={b.id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium">{b.service_name}</td>
                        <td className="px-6 py-4">{b.sub_service_name || "—"}</td>
                        <td className="px-6 py-4">{b.city}</td>
                        <td className="px-6 py-4">₹{b.total_price}</td>
                        <td className="px-6 py-4">{b.discount_applied ? "Yes" : "No"}</td>
                        <td className="px-6 py-4">₹{b.final_amount}</td>
                        <td className="px-6 py-4">{new Date(b.created_at).toLocaleString()}</td>
                        <td className="px-6 py-4 flex justify-center">
                          <button className="text-red-600 hover:text-red-500" onClick={() => confirmDelete(b.id)}>
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
          {/* Pagination */}
{totalPages > 1 && (
  <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
    <button
      onClick={() => goToPage(currentPage - 1)}
      disabled={currentPage === 1}
      className={`px-3 py-1 rounded border transition ${
        currentPage === 1 ? "bg-gray-200 cursor-not-allowed" : "hover:bg-gray-100"
      }`}
    >
      Previous
    </button>

    {[...Array(totalPages)].map((_, i) => {
      const pageNum = i + 1;
      return (
        <button
          key={i}
          onClick={() => goToPage(pageNum)}
          className={`px-3 py-1 rounded border transition ${
            currentPage === pageNum
              ? "bg-red-600 text-white border-red-600"
              : "hover:bg-gray-100"
          }`}
        >
          {pageNum}
        </button>
      );
    })}

    <button
      onClick={() => goToPage(currentPage + 1)}
      disabled={currentPage === totalPages}
      className={`px-3 py-1 rounded border transition ${
        currentPage === totalPages ? "bg-gray-200 cursor-not-allowed" : "hover:bg-gray-100"
      }`}
    >
      Next
    </button>
  </div>
)}


          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button className="px-3 py-1 border rounded hover:bg-gray-100" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-red-600 text-white" : "hover:bg-gray-100"}`} onClick={() => goToPage(i + 1)}>
                  {i + 1}
                </button>
              ))}
              <button className="px-3 py-1 border rounded hover:bg-gray-100" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
            </div>
          )}
        </section>

        {/* Delete Popup */}
        {showDeletePopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-[350px] animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-900">Delete Booking?</h2>
              <p className="mt-2 text-gray-600">
                Are you sure you want to delete this booking? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowDeletePopup(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
