"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ClipboardList, Mail, Trash2, Search, User } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FileDown, FileSpreadsheet } from "lucide-react";

export default function EnquiriesDashboard() {
  const [enquiries, setEnquiries] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch enquiries
  const fetchEnquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("id", { ascending: false });
    if (!error) setEnquiries(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // 🔹 Delete enquiry
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;
    const { error } = await supabase.from("enquiries").delete().eq("id", id);
    if (!error) {
      alert("✅ Enquiry deleted successfully!");
      fetchEnquiries();
    }
  };


  // 🔹 Download as Excel
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      enquiries.map((enq, index) => ({
        "#": index + 1,
        Name: enq.full_name,
        Email: enq.email,
        Message: enq.message,
        Date: new Date(enq.created_at).toLocaleDateString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Enquiries");
    XLSX.writeFile(workbook, "enquiries_data.xlsx");
  };

  // 🔹 Download as PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Enquiries Report", 14, 15);

    const tableColumn = ["#", "Name", "Email", "Message", "Date"];
    const tableRows = enquiries.map((enq, index) => [
      index + 1,
      enq.full_name,
      enq.email,
      enq.message,
      new Date(enq.created_at).toLocaleDateString(),
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 3: { cellWidth: 70 } }, // limit message column width
    });

    doc.save("enquiries_data.pdf");
  };

  // 🔹 Filtered list
  const filteredEnquiries = enquiries.filter((enq) =>
    [enq.full_name, enq.email, enq.message]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // 🔹 Stats
  const totalEnquiries = enquiries.length;
  const recentEnquiries = enquiries.filter(
    (enq) =>
      new Date(enq.created_at) >
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  const uniqueUsers = new Set(enquiries.map((e) => e.email)).size;

  return (
    <div className="min-h-screen w-full flex flex-col overflow-hidden bg-gray-100 text-gray-900">
      {/* 🔴 Header */}
      <header className="bg-gradient-to-r from-red-700 to-black px-8 py-6 rounded-b-2xl shadow-md text-white">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Enquiries <span className="text-white">Dashboard</span>
        </h1>
        <p className="text-gray-300 mt-1">
          Track, search, and manage all user enquiries efficiently.
        </p>
      </header>

      <main className="flex-grow px-8 py-10 bg-gray-100 space-y-10">
        {/* 🔹 Stats Section (Gray cards, red icons) */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: ClipboardList, title: "Total Enquiries", value: totalEnquiries },
            { icon: Mail, title: "Recent (7 Days)", value: recentEnquiries },
            { icon: User, title: "Unique Users", value: uniqueUsers },
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
                <p className="mt-3 text-gray-700 font-semibold text-lg">
                  {item.title}
                </p>
              </div>
            );
          })}
        </section>

        {/* 📋 Enquiries Table Section */}
        <section className="bg-white border border-gray-300 rounded-2xl p-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardList className="text-red-600" /> Enquiries List
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, email, or message..."
                  className="border border-gray-300 rounded-xl pl-10 pr-4 py-2 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-red-400 outline-none w-full sm:w-80"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

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
                <p>Loading enquiries...</p>
              </div>
            ) : (
              <table className="min-w-full text-sm text-gray-800">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold border-b">
                  <tr>
                    <th className="px-6 py-3 text-left">#</th>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Message</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnquiries.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        <Search className="inline-block w-5 h-5 mr-2 text-gray-400" />
                        No enquiries found
                      </td>
                    </tr>
                  ) : (
                    filteredEnquiries.map((enq, i) => (
                      <tr
                        key={enq.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">{i + 1}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {enq.full_name}
                        </td>
                        <td className="px-6 py-4">{enq.email}</td>
                        <td className="px-6 py-4 max-w-xs truncate">
                          {enq.message}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(enq.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 flex justify-center gap-3">
                          <button
                            className="text-red-600 hover:text-red-500"
                            onClick={() =>
                              alert(`View details for ${enq.full_name}`)
                            }
                          >
                            <Mail size={18} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-500"
                            onClick={() => handleDelete(enq.id)}
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
        </section>
      </main>
    </div>
  );
}
