"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  ClipboardList,
  IndianRupee,
  Wrench,
  MapPin,
  Percent,
  Trash2,
  Search,
  FileDown,
  FileSpreadsheet,
  Eye,
  X,
  Calendar,
  Clock,
  User,
  CreditCard,
  FileText,
  Tag,
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

  // View Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewBooking, setViewBooking] = useState(null);

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

  const handleView = (booking) => {
    setViewBooking(booking);
    setShowViewModal(true);
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
    <div className="min-h-screen w-full flex flex-col overflow-hidden text-gray-900">
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
                        <td className="px-6 py-4">₹{b.final_amount}</td>
                        <td className="px-6 py-4">{new Date(b.created_at).toLocaleString()}</td>
                        <td className="px-6 py-4 flex justify-center gap-3">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleView(b)}
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button className="text-red-600 hover:text-red-500" onClick={() => confirmDelete(b.id)} title="Delete">
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
        </section>

        {/* 🔹 View Booking Modal - Complete Details */}
        {showViewModal && viewBooking && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 flex flex-col max-h-[90vh]">
              
              {/* Header with Status Indicator */}
              <div className="bg-gray-50 border-b border-gray-200 px-8 py-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <Eye size={22} className="text-red-600" /> Complete Booking Details
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                    Ref: #{viewBooking.id.toString().slice(-6).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-white border border-transparent hover:border-gray-200 p-2 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-grow">
                {/* Service & Location Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Main Service</label>
                      <div className="flex items-center gap-3">
                        <div className="bg-red-50 p-2 rounded-lg text-red-600"><Wrench size={18}/></div>
                        <p className="text-lg font-bold text-gray-900">{viewBooking.service_name}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Selected Plan</label>
                      <p className="text-gray-700 font-semibold ml-10">{viewBooking.sub_service_name || "—"}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Service Location</label>
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><MapPin size={18}/></div>
                        <p className="text-lg font-bold text-gray-900">{viewBooking.city}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Booking Date</label>
                      <div className="flex items-center gap-3">
                        <div className="bg-green-50 p-2 rounded-lg text-green-600"><Calendar size={18}/></div>
                        <p className="text-lg font-bold text-gray-900">{viewBooking.booking_date ? new Date(viewBooking.booking_date).toLocaleDateString() : "—"}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Work Time</label>
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Clock size={18}/></div>
                        <p className="text-lg font-bold text-gray-900">{viewBooking.work_time || "—"}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Created At</label>
                      <p className="text-gray-500 text-sm font-medium ml-10">
                        {new Date(viewBooking.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Financial Summary</label>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">Base Service Price</span>
                      <span className="text-gray-900 font-bold">₹{viewBooking.service_price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">Sub-Service/Add-ons Price</span>
                      <span className="text-gray-900 font-bold">₹{viewBooking.sub_service_price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">Total Price</span>
                      <span className="text-gray-900 font-bold">₹{viewBooking.total_price}</span>
                    </div>
                    {viewBooking.discount_applied && (
                      <div className="flex justify-between text-sm text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg">
                        <span>Discount Applied</span>
                        <span>- {((viewBooking.total_price - viewBooking.final_amount) / viewBooking.total_price * 100).toFixed(0)}%</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-gray-900 font-black text-lg">Final Amount Paid</span>
                      <span className="text-2xl font-black text-red-600">₹{viewBooking.final_amount}</span>
                    </div>
                  </div>
                </div>

                {/* Assignment & Scheduling Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Assigned Maid</label>
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><User size={18}/></div>
                        <p className="text-lg font-bold text-gray-900">{viewBooking.assigned_maid || "Not Assigned"}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Maid ID</label>
                      <p className="text-gray-700 font-semibold ml-10">{viewBooking.maid_id || "—"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Booking Date</label>
                      <div className="flex items-center gap-3">
                        <div className="bg-green-50 p-2 rounded-lg text-green-600"><Calendar size={18}/></div>
                        <p className="text-lg font-bold text-gray-900">{viewBooking.booking_date ? new Date(viewBooking.booking_date).toLocaleDateString() : "—"}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Work Time</label>
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Clock size={18}/></div>
                        <p className="text-lg font-bold text-gray-900">{viewBooking.work_time || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment & Order Section */}
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 mb-8">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-4">Payment & Order Details</label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">Payment Status</span>
                        <span className={`font-bold px-2 py-1 rounded-full text-xs uppercase ${
                          viewBooking.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          viewBooking.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {viewBooking.payment_status}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">Payment ID</span>
                        <span className="text-gray-900 font-bold">{viewBooking.payment_id || "—"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">Order ID</span>
                        <span className="text-gray-900 font-bold">{viewBooking.order_id || "—"}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Notes</label>
                        <div className="flex items-start gap-3">
                          <div className="bg-gray-50 p-2 rounded-lg text-gray-600"><FileText size={18}/></div>
                          <p className="text-gray-700 font-medium flex-1">{viewBooking.notes || "No notes provided."}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Details Section */}
                {viewBooking.customer_details && (
                  <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 mb-8">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-4">Customer Details</label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(viewBooking.customer_details).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="text-gray-900 font-bold">{value || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Additional Information</label>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">User ID</span>
                      <span className="text-gray-900 font-bold">{viewBooking.user_id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Booking ID</span>
                      <span className="text-gray-900 font-bold">{viewBooking.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Created At</span>
                      <span className="text-gray-900 font-bold">{new Date(viewBooking.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-white px-8 py-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-8 py-3 bg-gray-900 text-white text-sm rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}

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