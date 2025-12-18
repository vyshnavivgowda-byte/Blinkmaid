"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet, FileDown, Search, Users, CheckCircle, XCircle } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function AdminUsersTable() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Fetch Users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const res = await fetch("/api/get-users");
      const data = await res.json();
      setUsers(data.users || []);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter((u) => {
    const name = u.user_metadata?.name || "";
    const email = u.email || "";
    return `${name} ${email}`.toLowerCase().includes(search.toLowerCase());
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Excel Download
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      users.map((u) => ({
        Name: u.user_metadata?.name || "—",
        Email: u.email,
        Phone: u.user_metadata?.phone || "—",
        Location: u.user_metadata?.location || "—",
        Subscribed: u.subscribed ? "YES" : "NO",
        Created_At: new Date(u.created_at).toLocaleString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users_data.xlsx");
  };

  // PDF Download
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("User List", 14, 15);

    const tableColumn = [
      "Name",
      "Email",
      "Phone",
      "Location",
      "Subscribed",
      "Created At",
    ];

    const tableRows = users.map((u) => [
      u.user_metadata?.name || "—",
      u.email,
      u.user_metadata?.phone || "—",
      u.user_metadata?.location || "—",
      u.subscribed ? "YES" : "NO",
      new Date(u.created_at).toLocaleString(),
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 10 },
    });

    doc.save("users_data.pdf");
  };

  // Stats
  const totalUsers = users.length;
  const subscribedUsers = users.filter((u) => u.subscribed).length;

  return (
    <div className="min-h-screen w-full flex flex-col text-gray-900">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-red-700 to-black px-8 py-6 rounded-b-2xl shadow-md text-white">
        <h1 className="text-4xl font-extrabold tracking-tight">
          User <span className="text-white">Dashboard</span>
        </h1>
        <p className="text-gray-300 mt-1">
          View and manage all registered users — search, filter, export data.
        </p>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow px-8 py-10 space-y-10">
        {/* STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { title: "Total Users", value: totalUsers },
            { title: "Subscribed Users", value: subscribedUsers },
            { title: "Non-Subscribed", value: totalUsers - subscribedUsers },
          ].map((item, i) => (
            <div
              key={i}
              className="relative group  p-6 rounded-2xl 
              shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-300"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500 to-red-700 
                opacity-0 group-hover:opacity-10 transition duration-300"></div>

              <div className="flex items-center justify-between">
                <div className="bg-red-100 p-3 rounded-xl text-red-600 shadow-sm group-hover:bg-red-200 transition">
                  <Users size={28} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{item.value}</p>
              </div>

              <p className="mt-3 text-gray-700 font-semibold text-lg">{item.title}</p>
            </div>
          ))}
        </section>

        {/* USER TABLE */}
        <section className="bg-white border border-gray-300 rounded-2xl p-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
              <Users className="text-red-600 w-6 h-6" />
              User List
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="border border-gray-300 rounded-xl pl-10 pr-4 py-2 bg-gray-100 
                    text-gray-900 focus:ring-2 focus:ring-red-400 outline-none w-full sm:w-80"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1); // Reset page on search
                  }}
                />
              </div>

              {/* Download Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadExcel}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 
                  rounded-lg hover:bg-green-700 transition"
                >
                  <FileSpreadsheet size={18} /> Excel
                </button>

                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 
                  rounded-lg hover:bg-red-700 transition"
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
                <p>Loading users...</p>
              </div>
            ) : (
              <table className="min-w-full text-sm text-gray-800">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold border-b">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Phone</th>
                    <th className="px-6 py-3 text-left">Location</th>
                    <th className="px-6 py-3 text-left">Subscribed</th>
                    <th className="px-6 py-3 text-left">Created At</th>
                  </tr>
                </thead>

                <tbody>
                  {currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        <Search className="inline-block w-5 h-5 mr-2 text-gray-400" />
                        No users found
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {u.user_metadata?.name || "—"}
                        </td>
                        <td className="px-6 py-4">{u.email}</td>
                        <td className="px-6 py-4">{u.user_metadata?.phone || "—"}</td>
                        <td className="px-6 py-4">{u.user_metadata?.location || "—"}</td>
                        <td className="px-6 py-4">
                          {u.subscribed ? (
                            <span className="flex items-center gap-1 text-green-600 font-semibold">
                              <CheckCircle size={16} /> YES
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600 font-semibold">
                              <XCircle size={16} /> NO
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(u.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded border transition ${currentPage === 1 ? "bg-gray-200 cursor-not-allowed" : "hover:bg-gray-100"
                  }`}
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={i}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 rounded border transition ${currentPage === pageNum
                        ? "bg-red-600 text-white border-red-600"
                        : "hover:bg-gray-100"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded border transition ${currentPage === totalPages ? "bg-gray-200 cursor-not-allowed" : "hover:bg-gray-100"
                  }`}
              >
                Next
              </button>
            </div>
          )}


          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 rounded-lg ${currentPage === i + 1
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                    }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
