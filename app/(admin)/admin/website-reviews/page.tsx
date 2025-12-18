"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Star,
  Trash2,
  Search,
  Eye,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useToast } from "@/app/components/toast/ToastContext";

export default function WebsiteReviewsAdmin() {
  const [reviews, setReviews] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewReview, setViewReview] = useState(null);

  const { showToast } = useToast();

  /* ================= FETCH REVIEWS ================= */
  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("website_reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setReviews(data || []);
    else showToast("Failed to fetch reviews", "error");

    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  /* ================= SELECTION (MAX 3) ================= */
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 3) {
        showToast("You can approve only 3 reviews at a time", "error");
        return prev;
      }
      return [...prev, id];
    });
  };

  /* ================= BULK APPROVE ================= */
  const approveSelected = async () => {
    if (selectedIds.length === 0) return;

    const { error } = await supabase
      .from("website_reviews")
      .update({ status: "active" })
      .in("id", selectedIds);

    if (!error) {
      showToast("Selected reviews approved", "success");
      setSelectedIds([]);
      fetchReviews();
    } else {
      showToast("Approval failed", "error");
    }
  };

  /* ================= DELETE ================= */
  const deleteReview = async (id) => {
    const { error } = await supabase
      .from("website_reviews")
      .delete()
      .eq("id", id);

    if (!error) {
      showToast("Review deleted", "success");
      fetchReviews();
    } else {
      showToast("Delete failed", "error");
    }
  };

  /* ================= FILTER ================= */
  const filteredReviews = reviews.filter((r) =>
    `${r.name} ${r.review} ${r.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* ================= STATS ================= */
  const totalReviews = reviews.length;
  const approvedReviews = reviews.filter((r) => r.status === "active").length;
  const pendingReviews = totalReviews - approvedReviews;

  return (
    <div className="min-h-screen w-full flex flex-col  text-gray-900">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-red-700 to-black px-8 py-6 rounded-b-2xl shadow-md text-white">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Website <span className="text-white">Reviews</span>
        </h1>
        <p className="text-gray-300 mt-1">
          Approve and manage customer reviews (max 3 approvals at once)
        </p>
      </header>

      {/* MAIN */}
      <main className="flex-grow px-8 py-10 space-y-10">
        {/* STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { title: "Total Reviews", value: totalReviews, icon: Star },
            { title: "Approved Reviews", value: approvedReviews, icon: CheckCircle },
            { title: "Pending Reviews", value: pendingReviews, icon: Clock },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="relative group p-6 rounded-2xl border border-gray-300 shadow-md 
                hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-white"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500 to-red-700 
                  opacity-0 group-hover:opacity-10 transition duration-300" />

                <div className="flex items-center justify-between">
                  <div className="bg-red-100 p-3 rounded-xl text-red-600">
                    <Icon size={28} />
                  </div>
                  <p className="text-3xl font-bold">{item.value}</p>
                </div>

                <p className="mt-3 text-gray-700 font-semibold text-lg">
                  {item.title}
                </p>
              </div>
            );
          })}
        </section>

        {/* ACTION BAR */}
        {/* LIST CONTAINER */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          {/* HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Star className="text-red-600" size={24} />
              Website Reviews List
            </h2>

            <div className="flex flex-wrap gap-3 items-center">
              {/* SEARCH */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or review..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 
          focus:ring-2 focus:ring-red-400 outline-none w-72"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* EXCEL */}
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold">
                Excel
              </button>

              {/* PDF */}
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold">
                PDF
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3 text-center">#</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Rating</th>
                  <th className="px-4 py-3 text-left">Review</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center">
                      Loading reviews...
                    </td>
                  </tr>
                ) : filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      No reviews found
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((r, index) => (
                    <tr key={r.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 text-center">{index + 1}</td>

                      <td className="px-4 py-3 font-medium">{r.name}</td>

                      <td className="px-4 py-3">{"⭐".repeat(r.rating)}</td>

                      <td className="px-4 py-3 truncate max-w-xs">{r.review}</td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${r.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3 flex justify-center gap-3">
                        <button
                          onClick={() => setViewReview(r)}
                          className="text-blue-600 hover:text-blue-500"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => deleteReview(r.id)}
                          className="text-red-600 hover:text-red-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* VIEW MODAL */}
      {viewReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl max-w-lg w-full">
            <h2 className="text-xl font-bold mb-2">{viewReview.name}</h2>
            <p className="mb-2">Rating: {"⭐".repeat(viewReview.rating)}</p>
            <p className="bg-gray-100 p-3 rounded">{viewReview.review}</p>
            <div className="text-right mt-4">
              <button
                onClick={() => setViewReview(null)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
