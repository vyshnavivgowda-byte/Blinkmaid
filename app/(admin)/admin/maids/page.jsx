"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/app/components/toast/ToastContext";
import { supabase } from "@/lib/supabaseClient";
import {
  Users,
  Briefcase,
  IndianRupee,
  Trash2,
  Search,
  Eye,
  X,
  MapPin,
  Phone,
  FileDown,
  FileSpreadsheet
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function MaidDashboard() {
  const [maids, setMaids] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMaidId, setSelectedMaidId] = useState(null);
  const [viewingMaid, setViewingMaid] = useState(null); // State for the View Popup
  const { showToast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  const filteredMaids = formattedMaids.filter((maid) => {
    const searchText = search.toLowerCase();
    return (
      maid.name?.toLowerCase().includes(searchText) ||
      maid.city?.toLowerCase().includes(searchText) ||
      maid.work_types?.join(" ").toLowerCase().includes(searchText)
    );
  });

  const totalPages = Math.ceil(filteredMaids.length / itemsPerPage);
  const paginatedMaids = filteredMaids.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

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

  const totalMaids = formattedMaids.length;
  const avgExperience = totalMaids > 0 ? (formattedMaids.reduce((sum, m) => sum + (m.experience || 0), 0) / totalMaids).toFixed(1) : 0;
  const avgSalary = totalMaids > 0 ? Math.round(formattedMaids.reduce((sum, m) => sum + (m.salary || 0), 0) / totalMaids) : 0;

  return (
    <div className="min-h-screen w-full flex flex-col overflow-hidden text-gray-900 bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-700 to-black px-8 py-6 flex-shrink-0 rounded-b-2xl shadow-md text-white">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Maid <span className="text-white">Dashboard</span>
        </h1>
        <p className="text-gray-300 mt-1">Manage and monitor all registered maids.</p>
      </header>

      <main className="flex-grow px-8 py-10 space-y-10">
        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[{ icon: Users, title: "Total Maids", value: totalMaids },
          { icon: Briefcase, title: "Avg Experience", value: `${avgExperience} yrs` },
          { icon: IndianRupee, title: "Avg Salary", value: `₹${avgSalary.toLocaleString()}` },
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-medium">{item.title}</p>
                <p className="text-3xl font-bold text-gray-900">{item.value}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-xl text-red-600">
                <item.icon size={28} />
              </div>
            </div>
          ))}
        </section>

        {/* Table Section */}
        <section className="bg-white border border-gray-300 rounded-2xl p-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
              <Users className="text-red-600 w-6 h-6" /> Maid List
            </h2>
            <div className="flex flex-wrap gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full border rounded-xl pl-10 pr-4 py-2 bg-gray-100 focus:ring-2 focus:ring-red-400 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button onClick={handleDownloadExcel} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                <FileSpreadsheet size={18} /> Excel
              </button>
              <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                <FileDown size={18} /> PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm text-gray-800">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Number</th>
                  <th className="px-6 py-3 text-left">Experience</th>
                  <th className="px-6 py-3 text-left">Salary</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMaids.map((maid) => (
                  <tr key={maid.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium">{maid.name}</td>
                    <td className="px-6 py-4">{maid.number}</td>
                    <td className="px-6 py-4">{maid.experience} yrs</td>
                    <td className="px-6 py-4">₹{maid.salary}</td>
                    <td className="px-6 py-4 flex justify-center gap-4">
                      <button onClick={() => setViewingMaid(maid)} className="text-blue-600 hover:text-blue-800">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => { setSelectedMaidId(maid.id); setShowDeleteModal(true); }} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-6">
            <button disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)} className="px-4 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50">Prev</button>
            <span className="px-4 py-1 font-bold text-red-600">{currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)} className="px-4 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50">Next</button>
          </div>
        </section>
      </main>

      {/* --- VIEW MODAL (Horizontal Design) --- */}
      {viewingMaid && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200">

            {/* Modal Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Users size={20} className="text-gray-500" /> Maid Profile
              </h3>
              <button
                onClick={() => setViewingMaid(null)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row">
              {/* Left Side: Photo (Gray Rectangular Space) */}
              <div className="w-full md:w-1/3 bg-gray-50 p-6 flex flex-col items-center justify-start border-b md:border-b-0 md:border-r border-gray-200">
                <div className="w-32 h-44 bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm flex items-center justify-center">
                  {viewingMaid.photo_base64 ? (
                    <img
                      src={viewingMaid.photo_base64}
                      alt={viewingMaid.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users size={40} className="text-gray-200" />
                  )}
                </div>
                <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Experience</p>
                <p className="text-gray-700 font-semibold">{viewingMaid.experience} Years</p>
              </div>

              {/* Right Side: Details */}
              <div className="w-full md:w-2/3 p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 leading-none">{viewingMaid.name}</h2>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin size={14} /> Registered Professional
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Contact */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Contact</label>
                    <p className="text-gray-800 font-medium flex items-center gap-2 mt-0.5">
                      <Phone size={14} className="text-gray-400" /> {viewingMaid.number}
                    </p>
                  </div>

                  {/* Salary */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Daily Salary</label>
                    <p className="text-gray-900 font-bold flex items-center gap-2 mt-0.5">
                      <IndianRupee size={14} className="text-gray-400" /> ₹{viewingMaid.salary}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Location Details</label>
                  <p className="text-gray-700 text-sm mt-0.5 leading-relaxed">
                    {viewingMaid.formattedAddress}
                  </p>
                </div>

                {/* Work Types */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">Services</label>
                  <div className="flex flex-wrap gap-2">
                    {viewingMaid.work_types?.map((type, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded text-[11px] font-bold border border-gray-200 uppercase">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Close Button */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setViewingMaid(null)}
                className="px-6 py-2 bg-gray-800 text-white text-sm rounded-lg font-bold hover:bg-black transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- DELETE MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-xl">
            <h2 className="text-xl font-bold mb-2">Delete Record?</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to remove this maid from the database?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button
                onClick={async () => {
                  const { error } = await supabase.from("maids").delete().eq("id", selectedMaidId);
                  if (!error) { showToast("Deleted successfully", "success"); fetchMaids(); }
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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