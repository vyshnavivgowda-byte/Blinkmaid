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
} from "lucide-react";
import { useToast } from "@/app/components/toast/ToastContext";

export default function MaidChangeDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { showToast } = useToast();

  // 🔹 Fetch maid change requests
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

  // 🔹 Delete request
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

  // 🔹 Search filter
  const filteredRequests = requests.filter((r) =>
    [
      r.booking_id,
      r.new_maid_id,
      r.previous_maid_id,
      r.change_reason,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // 🔹 Stats
  const totalRequests = requests.length;
  const recentRequests = requests.filter(
    (r) =>
      new Date(r.changed_at) >
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const uniqueBookings = new Set(requests.map((r) => r.booking_id)).size;

  return (
    <div className="min-h-screen bg-gray-100">
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
              <div key={i} className="bg-white p-6 rounded-xl shadow">
                <div className="flex justify-between items-center">
                  <Icon className="text-red-600" />
                  <span className="text-3xl font-bold">{item.value}</span>
                </div>
                <p className="mt-2 text-gray-600">{item.label}</p>
              </div>
            );
          })}
        </section>

        {/* Table */}
        <section className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold flex gap-2">
              <ClipboardList className="text-red-600" />
              Maid Changes
            </h2>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                className="pl-10 pr-4 py-2 border rounded-lg"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p className="text-center py-10">Loading...</p>
          ) : (
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
                {filteredRequests.map((r, i) => (
                  <tr key={r.id} className="border-b">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3">{r.booking_id}</td>
                    <td className="p-3">{r.previous_maid_id || "-"}</td>
                    <td className="p-3">{r.new_maid_id}</td>
                    <td className="p-3">
                      {new Date(r.changed_at).toLocaleDateString()}
                    </td>
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
              <span className="block bg-gray-100 p-3 mt-1 rounded">
                {selectedRequest.change_reason || "—"}
              </span>
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
