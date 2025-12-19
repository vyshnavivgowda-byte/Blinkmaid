"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  ClipboardList,
  Trash2,
  Search,
  User,
  RefreshCcw,
  Eye,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";
import { useToast } from "@/app/components/toast/ToastContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function MaidChangeDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { showToast } = useToast();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch maid change requests
  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("maid_changes")
      .select("*")
      .order("changed_at", { ascending: false });
    if (!error) setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Delete request
  const handleDeleteFinal = async () => {
    const { error } = await supabase
      .from("maid_changes")
      .delete()
      .eq("id", deleteId);
    setShowDeleteModal(false);
    if (!error) {
      showToast("Request deleted successfully!", "success");
      fetchRequests();
    } else {
      showToast("Failed to delete request!", "error");
    }
  };

  // Filtered requests
  const filteredRequests = requests.filter((r) =>
    [r.booking_id, r.new_maid_id, r.previous_maid_id, r.change_reason]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Download Excel
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredRequests.map((r) => ({
        "Booking ID": r.booking_id,
        "Maid Name": r.previous_maid_id,
        "Changed At": new Date(r.changed_at).toLocaleString(),
        "Reason": r.change_reason || "—",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MaidChanges");
    XLSX.writeFile(workbook, "maid_changes.xlsx");
  };

  // Download PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Maid Change Requests", 14, 15);
    const tableColumn = ["Booking ID", "Maid Name", "Date", "Reason"];
    const tableRows = filteredRequests.map((r) => [
      r.booking_id,
      r.previous_maid_id || "-",
      new Date(r.changed_at).toLocaleDateString(),
      r.change_reason || "—",
    ]);
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20, styles: { fontSize: 10 } });
    doc.save("maid_changes.pdf");
  };

  // Stats
  const totalRequests = requests.length;
  const recentRequests = requests.filter(
    (r) => new Date(r.changed_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  const uniqueBookings = new Set(requests.map((r) => r.booking_id)).size;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-700 to-black px-8 py-6 text-white">
        <h1 className="text-4xl font-bold">Maid Change Dashboard</h1>
        <p className="text-gray-300">Track all maid replacement actions</p>
      </header>

      <main className="px-8 py-10 space-y-10">
        {/* Stats */}
        <section className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: ClipboardList, label: "Total Requests", value: totalRequests },
            { icon: RefreshCcw, label: "Last 7 Days", value: recentRequests },
            { icon: User, label: "Unique Bookings", value: uniqueBookings },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="relative p-6 rounded-xl shadow-md bg-white transition-all duration-300 transform hover:scale-[1.03] hover:shadow-xl cursor-pointer group overflow-hidden"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700 opacity-0 group-hover:opacity-10 transition-all duration-300 rounded-xl"></div>
                <div className="flex items-center justify-between relative z-10">
                  {/* Icon with background */}
                  <div className="bg-red-100 p-3 rounded-xl text-red-600 shadow-sm group-hover:bg-red-200 transition">
                    <Icon size={28} />
                  </div>

                  {/* Value */}
                  <span className="text-3xl font-bold text-gray-900">
                    {item.value}
                  </span>
                </div>

                <p className="mt-2 text-xl font-bold text-gray-800 tracking-wide relative z-10">
                  {item.label}
                </p>
              </div>
            );
          })}
        </section>

        {/* ===== Maid Changes Table ===== */}
        <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
              <ClipboardList className="text-red-600" size={22} />
              Maid Change Reasons
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Search booking or reason..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Download Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadExcel}
                  className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition"
                >
                  <FileSpreadsheet size={16} />
                  Excel
                </button>

                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition"
                >
                  <FileDown size={16} />
                  PDF
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <p className="text-center py-12 text-gray-500">
              Loading maid change reasons...
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wide">
                      <th className="p-4 text-left">#</th>
                      <th className="p-4 text-left">Booking ID</th>
                      <th className="p-4 text-left">Change Reason</th>
                      <th className="p-4 text-left">Date</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedRequests.map((r, i) => (
                      <tr
                        key={r.id}
                        className="border-b hover:bg-red-50/40 transition"
                      >
                        <td className="p-4 font-medium text-gray-700">
                          {(currentPage - 1) * itemsPerPage + i + 1}
                        </td>

                        <td className="p-4 text-gray-700">
                          <span className="bg-gray-100 px-3 py-1 rounded-lg text-xs">
                            {r.booking_id}
                          </span>
                        </td>

                        <td className="p-4 text-gray-600 max-w-md">
                          {r.change_reason}
                        </td>

                        <td className="p-4 text-gray-500">
                          {new Date(r.changed_at).toLocaleDateString()}
                        </td>

                        <td className="p-4">
                          <div className="flex justify-center gap-4">
                            <button
                              onClick={() => {
                                setSelectedRequest(r);
                                setShowModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 transition"
                              title="View"
                            >
                              <Eye size={18} />
                            </button>

                            <button
                              onClick={() => {
                                setDeleteId(r.id);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-800 transition"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border disabled:opacity-40 hover:bg-gray-100"
                  >
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToPage(i + 1)}
                      className={`px-4 py-2 rounded-lg border transition ${currentPage === i + 1
                        ? "bg-red-600 text-white border-red-600"
                        : "hover:bg-gray-100"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border disabled:opacity-40 hover:bg-gray-100"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>

      </main>

      {/* View Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-3">Change Details</h2>
            <p><b>Booking:</b> {selectedRequest.booking_id}</p>
            <p><b>Maid Name:</b> {selectedRequest.previous_maid_id}</p>
            <p className="mt-3">
              <b>Reason:</b>
              <span className="block bg-gray-100 p-3 mt-1 rounded">{selectedRequest.change_reason || "—"}</span>
            </p>
            <div className="text-right mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl">
            <h2 className="font-bold mb-2">Delete this record?</h2>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button
                onClick={handleDeleteFinal}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
