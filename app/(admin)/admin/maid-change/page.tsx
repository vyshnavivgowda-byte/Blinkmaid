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
        "Old Maid": r.previous_maid_id,
        "New Maid": r.new_maid_id,
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
    const tableColumn = ["Booking ID", "Old Maid", "New Maid", "Date", "Reason"];
    const tableRows = filteredRequests.map((r) => [
      r.booking_id,
      r.previous_maid_id || "-",
      r.new_maid_id,
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
                <div className="flex justify-between items-center relative z-10">
                  <Icon className="text-red-600" />
                  <span className="text-3xl font-bold">{item.value}</span>
                </div>
                <p className="mt-2 text-gray-600 relative z-10">{item.label}</p>
              </div>
            );
          })}
        </section>

    


        {/* Table */}
        <section className="bg-white p-6 rounded-xl shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <h2 className="text-xl font-semibold flex gap-2">
              <ClipboardList className="text-red-600" /> Maid Changes
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  className="pl-10 pr-4 py-2 border rounded-lg"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Download Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadExcel}
                  className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  <FileSpreadsheet size={16} /> Excel
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  <FileDown size={16} /> PDF
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-center py-10">Loading...</p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Booking ID</th>
                    <th className="p-3 text-left">Old Maid</th>
                    <th className="p-3 text-left">New Maid</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRequests.map((r, i) => (
                    <tr key={r.id} className="border-b">
                      <td className="p-3">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                      <td className="p-3">{r.booking_id}</td>
                      <td className="p-3">{r.previous_maid_id || "-"}</td>
                      <td className="p-3">{r.new_maid_id}</td>
                      <td className="p-3">{new Date(r.changed_at).toLocaleDateString()}</td>
                      <td className="p-3 flex justify-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedRequest(r);
                            setShowModal(true);
                          }}
                          className="text-blue-600"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(r.id);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-red-600 text-white" : "hover:bg-gray-100"}`}
                      onClick={() => goToPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
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
            <p><b>Old Maid:</b> {selectedRequest.previous_maid_id}</p>
            <p><b>New Maid:</b> {selectedRequest.new_maid_id}</p>
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
