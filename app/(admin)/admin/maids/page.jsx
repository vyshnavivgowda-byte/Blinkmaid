"use client";

import { useEffect, useState } from "react";
import { ToastProvider } from "@/app/components/toast/ToastContext";
import { useToast } from "@/app/components/toast/ToastContext";
import { supabase } from "@/lib/supabaseClient";
import { Users, Briefcase, DollarSign, Trash2, Search } from "lucide-react";
import StatsCard from "../../../components/StatsCard";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FileDown, FileSpreadsheet } from "lucide-react";

export default function MaidDashboard() {
  const [maids, setMaids] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMaidId, setSelectedMaidId] = useState(null);
  const { showToast } = useToast();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // adjust as needed

  // Fetch maids
  const fetchMaids = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("maids")
      .select("*")
      .order("id", { ascending: false });
    if (!error) setMaids(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMaids();
  }, []);

  // Format addresses
  const formattedMaids = maids.map((maid) => {
    let addressText = "";
    let city = "";
    try {
      const addr = typeof maid.address === "string" ? JSON.parse(maid.address) : maid.address;
      addressText = `${addr.house || ""}, ${addr.street || ""}, ${addr.area || ""}, ${addr.city || ""}, ${addr.pincode || ""}`;
      city = addr.city || "";
    } catch {
      addressText = maid.address || "";
    }
    return { ...maid, formattedAddress: addressText, city };
  });

  // Filter maids
  const filteredMaids = formattedMaids.filter((maid) => {
    const searchText = search.toLowerCase();
    const nameMatch = maid.name?.toLowerCase().includes(searchText);
    const cityMatch = maid.city?.toLowerCase().includes(searchText);
    const workTypesMatch = maid.work_types?.join(" ").toLowerCase().includes(searchText);
    return nameMatch || cityMatch || workTypesMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredMaids.length / itemsPerPage);
  const paginatedMaids = filteredMaids.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Delete maid
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this maid?")) return;
    const { error } = await supabase.from("maids").delete().eq("id", id);
    if (!error) {
      showToast("Maid deleted successfully!", "success");
      fetchMaids();
    }
  };

  // Download Excel
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      formattedMaids.map((maid) => ({
        Name: maid.name,
        Number: maid.number,
        Address: maid.formattedAddress,
        Experience: `${maid.experience} yrs`,
        Salary: `₹${maid.salary}`,
        Work_Types: maid.work_types?.join(", ") || "—",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Maids");
    XLSX.writeFile(workbook, "maids_data.xlsx");
  };

  // Download PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Maid List", 14, 15);
    const tableColumn = ["Name", "Number", "Address", "Experience", "Salary", "Work Types"];
    const tableRows = formattedMaids.map((maid) => [
      maid.name,
      maid.number,
      maid.formattedAddress,
      `${maid.experience} yrs`,
      `₹${maid.salary}`,
      maid.work_types?.join(", ") || "—",
    ]);
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20, styles: { fontSize: 10 } });
    doc.save("maids_data.pdf");
  };

  // Stats
  const totalMaids = formattedMaids.length;
  const avgExperience =
    formattedMaids.length > 0
      ? (formattedMaids.reduce((sum, m) => sum + (m.experience || 0), 0) / formattedMaids.length).toFixed(1)
      : 0;
  const avgSalary =
    formattedMaids.length > 0
      ? Math.round(formattedMaids.reduce((sum, m) => sum + (m.salary || 0), 0) / formattedMaids.length)
      : 0;

  return (
    <div className="min-h-screen w-full flex flex-col overflow-hidden  text-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-700 to-black px-8 py-6 flex-shrink-0 rounded-b-2xl shadow-md text-white">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Maid <span className="text-white">Dashboard</span>
        </h1>
        <p className="text-gray-300 mt-1">
          Manage and monitor all registered maids — view stats, search, and perform actions.
        </p>
      </header>

      <main className="flex-grow px-8 py-10 space-y-10">
        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[{ icon: Users, title: "Total Maids", value: totalMaids },
            { icon: Briefcase, title: "Avg Experience", value: `${avgExperience} yrs` },
            { icon: DollarSign, title: "Avg Salary", value: `₹${avgSalary.toLocaleString()}` },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="relative group  p-6 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-300">
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

        {/* Maid Table Section */}
        <section className="bg-white border border-gray-300 rounded-2xl p-8 shadow-md">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 sm:gap-6">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
              <Users className="text-red-600 w-6 h-6" /> Maid List
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or city..."
                  className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-red-400 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="border border-gray-300 rounded-xl py-2 px-4 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-red-400 outline-none w-[150px]"
                onChange={(e) => {
                  const value = e.target.value;
                  setSearch(value === "all" ? "" : value);
                }}
              >
                <option value="all">All Cities</option>
                {[...new Set(formattedMaids.map((m) => m.city))].map((location, index) => (
                  <option key={index} value={location}>{location}</option>
                ))}
              </select>

              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <button onClick={handleDownloadExcel} className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition w-full sm:w-auto">
                  <FileSpreadsheet size={18} /> Excel
                </button>
                <button onClick={handleDownloadPDF} className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition w-full sm:w-auto">
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
                <p>Loading maids...</p>
              </div>
            ) : (
              <table className="min-w-full text-sm text-gray-800">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold border-b">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Number</th>
                    <th className="px-6 py-3 text-left">Address</th>
                    <th className="px-6 py-3 text-left">Experience</th>
                    <th className="px-6 py-3 text-left">Salary</th>
                    <th className="px-6 py-3 text-left">Work Types</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMaids.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500">
                        <Search className="inline-block w-5 h-5 mr-2 text-gray-400" />
                        No maids found
                      </td>
                    </tr>
                  ) : (
                    paginatedMaids.map((maid) => (
                      <tr key={maid.id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">{maid.name}</td>
                        <td className="px-6 py-4">{maid.number}</td>
                        <td className="px-6 py-4">{maid.formattedAddress}</td>
                        <td className="px-6 py-4">{maid.experience} yrs</td>
                        <td className="px-6 py-4">₹{maid.salary}</td>
                        <td className="px-6 py-4">{maid.work_types?.join(", ") || "—"}</td>
                        <td className="px-6 py-4 flex justify-center gap-3">
                          <button
                            className="text-red-600 hover:text-red-500"
                            onClick={() => {
                              setSelectedMaidId(maid.id);
                              setShowDeleteModal(true);
                            }}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="px-3 py-1 border rounded-lg hover:bg-gray-100"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 border rounded-lg ${currentPage === i + 1 ? "bg-red-600 text-white" : "hover:bg-gray-100"}`}
                  onClick={() => goToPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-3 py-1 border rounded-lg hover:bg-gray-100"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}

          {/* Delete Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Delete Maid?</h2>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this maid? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                    onClick={async () => {
                      const { error } = await supabase
                        .from("maids")
                        .delete()
                        .eq("id", selectedMaidId);

                      if (!error) {
                        showToast("Maid deleted successfully!", "success");
                        fetchMaids();
                      }
                      setShowDeleteModal(false);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
