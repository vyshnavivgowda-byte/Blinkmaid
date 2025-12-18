"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Star,
  Trash2,
  Search,
  Eye,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/app/components/toast/ToastContext";

type Review = {
  id: number;
  name: string;
  rating: number;
  review: string;
  created_at: string;
  status: string;
};

export default function WebsiteReviewsAdmin() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewReview, setViewReview] = useState<Review | null>(null);

  const { showToast } = useToast();

  // 🔹 Fetch reviews
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

  // 🔹 Toggle checkbox (MAX 3)
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 3) {
        showToast("You can approve only 3 reviews at a time", "error");
        return prev;
      }
      return [...prev, id];
    });
  };

  // 🔹 Bulk approve
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

  // 🔹 Delete single review
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

  // 🔹 Filtered list based on search
  const filteredReviews = reviews.filter((r) =>
    [r.name, r.review, r.status]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-black to-red-700 px-8 py-6 text-white">
        <h1 className="text-4xl font-bold">Website Reviews</h1>
        <p className="text-gray-300">
          Approve maximum 3 reviews at a time
        </p>
      </header>

      <main className="px-8 py-8 space-y-6">
        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              className="pl-10 pr-4 py-2 border rounded-lg"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            disabled={selectedIds.length === 0}
            onClick={approveSelected}
            className={`px-5 py-2 rounded-lg font-semibold text-white flex gap-2 items-center
              ${
                selectedIds.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
          >
            <CheckCircle size={18} />
            Approve Selected ({selectedIds.length}/3)
          </button>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          {loading ? (
            <p className="text-center py-10">Loading...</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-center">Select</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Rating</th>
                  <th className="p-3 text-left">Review</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r.id)}
                        disabled={r.status === "active"}
                        onChange={() => toggleSelect(r.id)}
                      />
                    </td>
                    <td className="p-3 font-medium">{r.name}</td>
                    <td className="p-3">
                      {"⭐".repeat(r.rating)}
                    </td>
                    <td className="p-3 truncate max-w-xs">
                      {r.review}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold
                          ${
                            r.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-center flex justify-center gap-3">
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* View Modal */}
      {viewReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
