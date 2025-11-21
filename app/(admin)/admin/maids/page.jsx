"use client";

import { useEffect, useState } from "react";
import { ToastProvider } from "@/app/components/toast/ToastContext";
import { useToast } from "@/app/components/toast/ToastContext";
import { supabase } from "@/lib/supabaseClient";
import {
  Users,
  Briefcase,
  DollarSign,
  Trash2,
  Search,
} from "lucide-react";
import StatsCard from "../../../components/StatsCard";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { XCircle } from "lucide-react";

export default function MaidDashboard() {
  const [maids, setMaids] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMaidId, setSelectedMaidId] = useState(null);
  const { showToast } = useToast();

  // 🔹 Filter (Name + Address + Work Types)
  const filteredMaids = maids.filter((maid) => {
    const searchText = search.toLowerCase();

    const nameMatch = maid.name?.toLowerCase().includes(searchText);
    const addressMatch = maid.address?.toLowerCase().includes(searchText);
    const workTypesMatch = maid.work_types
      ?.join(" ")
      .toLowerCase()
      .includes(searchText);

    return nameMatch || addressMatch || workTypesMatch;
  });

  // 🔹 Fetch maids
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

  // 🔹 Delete maid
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this maid?")) return;
    const { error } = await supabase.from("maids").delete().eq("id", id);
    if (!error) {
      alert("✅ Maid deleted successfully!");
      fetchMaids();
    }
  };

  // 🔹 Filter


  // 🔹 Download as Excel
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      maids.map((maid) => ({
        Name: maid.name,
        Number: maid.number,
        Address: maid.address,
        Experience: `${maid.experience} yrs`,
        Salary: `₹${maid.salary}`,
        Work_Types: maid.work_types?.join(", ") || "—",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Maids");
    XLSX.writeFile(workbook, "maids_data.xlsx");
  };

  // 🔹 Download as PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Maid List", 14, 15);
    const tableColumn = [
      "Name",
      "Number",
      "Address",
      "Experience",
      "Salary",
      "Work Types",
    ];
    const tableRows = maids.map((maid) => [
      maid.name,
      maid.number,
      maid.address,
      `${maid.experience} yrs`,
      `₹${maid.salary}`,
      maid.work_types?.join(", ") || "—",
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 10 },
    });

    doc.save("maids_data.pdf");
  };


  // 🔹 Stats
  const totalMaids = maids.length;
  const avgExperience =
    maids.length > 0
      ? (maids.reduce((sum, m) => sum + (m.experience || 0), 0) / maids.length).toFixed(1)
      : 0;
  const avgSalary =
    maids.length > 0
      ? Math.round(maids.reduce((sum, m) => sum + (m.salary || 0), 0) / maids.length)
      : 0;

  return (
    <div className="min-h-screen w-full flex flex-col overflow-hidden bg-gray-100 text-gray-900">
      {/* 🔴 Header Section */}
      <header className="bg-gradient-to-r from-red-700 to-black px-8 py-6 flex-shrink-0 rounded-b-2xl shadow-md text-white">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Maid <span className="text-white">Dashboard</span>
        </h1>
        <p className="text-gray-300 mt-1">
          Manage and monitor all registered maids — view stats, search, and perform actions.
        </p>
      </header>

      {/* 🧾 Main Content */}
      <main className="flex-grow px-8 py-10 bg-gray-100 space-y-10">
        {/* 🔹 Stats Section (Red Icons, Gray Background) */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Users, title: "Total Maids", value: totalMaids },
            { icon: Briefcase, title: "Avg Experience", value: `${avgExperience} yrs` },
            { icon: DollarSign, title: "Avg Salary", value: `₹${avgSalary.toLocaleString()}` },
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

        {/* 📋 Maid Table Section */}
        <section className="bg-white border border-gray-300 rounded-2xl p-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
              <Users className="text-red-600 w-6 h-6" />
              Maid List
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 items-center">

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or address..."
                  className="border border-gray-300 rounded-xl pl-10 pr-4 py-2 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-red-400 outline-none w-full sm:w-80"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* 🔥 Location Filter */}
              <select
                className="border border-gray-300 rounded-xl py-2 px-4 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-red-400 outline-none"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "all") {
                    setSearch(""); // show all maids
                  } else {
                    setSearch(value); // filter by location
                  }
                }}
              >
                <option value="all">All Locations</option>
                {[...new Set(maids.map((m) => m.address))].map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))}
              </select>

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
                  {filteredMaids.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500">
                        <Search className="inline-block w-5 h-5 mr-2 text-gray-400" />
                        No maids found
                      </td>
                    </tr>
                  ) : (
                    filteredMaids.map((maid) => (
                      <tr
                        key={maid.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">{maid.name}</td>
                        <td className="px-6 py-4">{maid.number}</td>
                        <td className="px-6 py-4">{maid.address}</td>
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

          {/* 🔴 Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">

                <h2 className="text-xl font-bold text-gray-900 mb-3">Delete Maid?</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this maid? This action cannot be undone.
                </p>

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
