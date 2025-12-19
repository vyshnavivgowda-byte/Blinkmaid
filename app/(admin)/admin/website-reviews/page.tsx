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
  const [reviews, setReviews] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewReview, setViewReview] = useState<any>(null);

  const { showToast } = useToast();

  /* ================= FETCH ================= */
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

  /* ================= DELETE ================= */
  const deleteReview = async (id: number) => {
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

  /* ================= STATUS TOGGLE (MAX 3) ================= */
  const toggleReviewStatus = async (id: number, currentStatus: string) => {
    const activeCount = reviews.filter(r => r.status === "active").length;

    // 🚫 Block activating more than 3
    if (currentStatus === "inactive" && activeCount >= 3) {
      showToast("Only 3 reviews can be active at a time", "error");
      return;
    }

    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const { error } = await supabase
      .from("website_reviews")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      showToast(`Review marked as ${newStatus}`, "success");
      fetchReviews();
    } else {
      showToast("Failed to update status", "error");
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
  const activeReviews = reviews.filter(r => r.status === "active").length;
  const pendingReviews = totalReviews - activeReviews;

  return (
    <div className="min-h-screen w-full flex flex-col text-gray-900">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-red-700 to-black px-8 py-6 rounded-b-2xl shadow-md text-white">
        <h1 className="text-4xl font-extrabold">Website Reviews</h1>
        <p className="text-gray-300 mt-1">
          Only 3 reviews can be active at a time
        </p>
      </header>

      {/* MAIN */}
      <main className="flex-grow px-8 py-10 space-y-10">
        {/* STATS */}
        <section className="grid sm:grid-cols-3 gap-6">
          {[
            { title: "Total Reviews", value: totalReviews, icon: Star },
            { title: "Active Reviews", value: activeReviews, icon: CheckCircle },
            { title: "Inactive Reviews", value: pendingReviews, icon: Clock },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white border shadow-md hover:shadow-xl transition"
              >
                <div className="flex justify-between items-center">
                  <div className="bg-red-100 p-3 rounded-xl text-red-600">
                    <Icon size={28} />
                  </div>
                  <span className="text-3xl font-bold">{item.value}</span>
                </div>
                <p className="mt-3 text-lg font-bold text-gray-800">
                  {item.title}
                </p>
              </div>
            );
          })}
        </section>

        {/* LIST */}
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          {/* TOP BAR */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex gap-2 items-center">
              <Star className="text-red-600" />
              Reviews List
              <span className="text-sm text-gray-500 font-normal">— Only 3 can be active</span>
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

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-xs uppercase">
                <tr>
                  <th className="p-3 text-center">#</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Rating</th>
                  <th className="p-3 text-left">Review</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : filteredReviews.map((r, i) => {
                  const isDisabled =
                    r.status === "inactive" && activeReviews >= 3;

                  return (
                    <tr key={r.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 text-center">{i + 1}</td>
                      <td className="p-3 font-medium">{r.name}</td>
                      <td className="p-3">{"⭐".repeat(r.rating)}</td>
                      <td className="p-3 truncate max-w-xs">{r.review}</td>

                      {/* STATUS */}
                      <td className="px-4 py-3">
                        {(() => {
                          const activeCount = reviews.filter(r => r.status === "active").length;
                          const isDisabled = r.status === "inactive" && activeCount >= 3;

                          return (
                            <button
                              disabled={isDisabled}
                              onClick={() => toggleReviewStatus(r.id, r.status)}
                              className={`relative w-14 h-7 rounded-full transition-all duration-300
          ${r.status === "active" ? "bg-green-500" : "bg-gray-300"}
          ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        `}
                            >
                              <span
                                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md
            transition-transform duration-300
            ${r.status === "active" ? "translate-x-7" : "translate-x-0"}
          `}
                              />
                            </button>
                          );
                        })()}
                      </td>
                      <td className="p-3">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>

                      <td className="p-3 flex justify-center gap-3">
                        <button
                          onClick={() => setViewReview(r)}
                          className="text-blue-600"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => deleteReview(r.id)}
                          className="text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* VIEW MODAL */}
      {viewReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl max-w-lg w-full">
            <h2 className="text-xl font-bold mb-2">{viewReview.name}</h2>
            <p className="mb-2">Rating: {"⭐".repeat(viewReview.rating)}</p>
            <p className="bg-gray-100 p-3 rounded">{viewReview.review}</p>
            <div className="text-right mt-4">
              <button
                onClick={() => setViewReview(null)}
                className="bg-red-600 text-white px-4 py-2 rounded"
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
