"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Eye,
  Trash2,
  Wrench,
  X,
  Building2,
  Layers,
  Edit2,
  FileDown,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useToast } from "@/app/components/toast/ToastContext";

export default function ServiceListPage() {
  const { showToast } = useToast();

  const [services, setServices] = useState([]);
  const [cities, setCities] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [subServiceQuestions, setSubServiceQuestions] = useState({});

  // Services modal state
  const [viewService, setViewService] = useState(null);
  const [viewCity, setViewCity] = useState(null);
  const [viewSubServices, setViewSubServices] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);

  // Plans modal state
  const [viewSubService, setViewSubService] = useState(null);
  const [showViewSubModal, setShowViewSubModal] = useState(false);

  // Delete modal - general for both services and Plans
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState({ id: null, type: null }); // type: "service" | "subService"
  const [editQuestions, setEditQuestions] = useState([]);

  // Edit modal states for service & Plans
  const [showEditModal, setShowEditModal] = useState(false);
  const [editServiceData, setEditServiceData] = useState({
    id: null,
    name: "",
    price: "",
    city_id: null,
  });

  const [showEditSubModal, setShowEditSubModal] = useState(false);
  const [editSubServiceData, setEditSubServiceData] = useState({
    id: null,
    service_id: null,
    name: "",
    price: "",
  });

  // 🔹 Fetch data
  const fetchData = async () => {
    const { data: cityData } = await supabase.from("cities").select("*");
    const { data: serviceData } = await supabase.from("services").select("*");
    const { data: subData } = await supabase.from("sub_services").select("*");
    const { data: questionData } = await supabase.from("sub_service_questions").select("*");

    setCities(cityData || []);
    setServices(serviceData || []);
    setSubServices(subData || []);

    // Organize questions by sub_service_id
    const questionsMap = {};
    (questionData || []).forEach((q) => {
      if (!questionsMap[q.sub_service_id]) {
        questionsMap[q.sub_service_id] = [];
      }

      questionsMap[q.sub_service_id].push({
        id: q.id,
        question: q.question,
        type: q.type || "text",
        options: Array.isArray(q.options)
          ? q.options.map((o) => {
            // If it's an object with 'option', return that
            if (typeof o === "object" && o.option) return `${o.option} (${o.price || "-"})`;
            return o;
          })
          : [],
      });

    });

    setSubServiceQuestions(questionsMap);

  };


  useEffect(() => {
    fetchData();
  }, []);

  // --- Service Handlers ---

  // View service
  const handleView = (id) => {
    const service = services.find((s) => s.id === id);
    const city = cities.find((c) => c.id === service.city_id);
    const subs = subServices.filter((ss) => ss.service_id === id);

    setViewService(service);
    setViewCity(city);
    setViewSubServices(subs);
    setShowViewModal(true);
  };

  // Delete service/Plans
  const handleDelete = (id, type) => {
    setDeleteItem({ id, type });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteItem.type === "service") {
      const { error } = await supabase.from("services").delete().eq("id", deleteItem.id);
      setShowDeleteModal(false);

      if (!error) {
        showToast("Service deleted successfully", "success");
        fetchData();
      } else {
        showToast("Failed to delete service", "error");
      }
    } else if (deleteItem.type === "subService") {
      const { error } = await supabase.from("sub_services").delete().eq("id", deleteItem.id);
      setShowDeleteModal(false);

      if (!error) {
        showToast("Plans deleted successfully", "success");
        fetchData();
      } else {
        showToast("Failed to delete Plans", "error");
      }
    }
  };

  // Edit service
  const handleEditOpen = (id) => {
    const service = services.find((s) => s.id === id);
    if (service) {
      setEditServiceData({
        id: service.id,
        name: service.name,
        price: service.price,
        city_id: service.city_id,
      });
      setShowEditModal(true);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditServiceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const { id, name, price, city_id } = editServiceData;

    if (!name.trim()) {
      showToast("Service name is required", "error");
      return;
    }
    if (!price || isNaN(price) || Number(price) < 0) {
      showToast("Valid price is required", "error");
      return;
    }
    if (!city_id) {
      showToast("City must be selected", "error");
      return;
    }

    const { error } = await supabase
      .from("services")
      .update({ name: name.trim(), price: Number(price), city_id })
      .eq("id", id);

    if (!error) {
      showToast("Service updated successfully", "success");
      fetchData();
      setShowEditModal(false);
    } else {
      showToast("Failed to update service", "error");
    }
  };

  // --- Plans Handlers ---

  // View plans details
  const handleViewSubService = (id) => {
    const sub = subServices.find((ss) => ss.id === id);
    if (sub) {
      setViewSubService(sub);
      setShowViewSubModal(true);
    }
  };

  // Edit Plans open
  const handleEditSubOpen = (id) => {
    const sub = subServices.find((ss) => ss.id === id);
    if (sub) {
      setEditSubServiceData({
        id: sub.id,
        service_id: sub.service_id,
        name: sub.name,
        price: sub.price,
      });

      // 🔹 Set questions for this Plans with proper options objects
      setEditQuestions(
        (subServiceQuestions[sub.id] || []).map((q) => ({
          id: q.id,
          question: q.question,
          type: q.type || "text",
          options: Array.isArray(q.options)
            ? q.options.map((o) => {
              // If stored as "Option Name (Price)", split it
              if (typeof o === "string" && o.includes("(") && o.includes(")")) {
                const match = o.match(/(.*)\s*\((.*)\)/);
                return {
                  option: match ? match[1].trim() : o,
                  price: match ? match[2].trim() : "",
                };
              } else if (typeof o === "object") {
                return {
                  option: o.option || "",
                  price: o.price || "",
                };
              }
              return { option: o, price: "" };
            })
            : [],
        }))
      );

      setShowEditSubModal(true);
    }
  };

  const handleEditSubChange = (e) => {
    const { name, value } = e.target;
    setEditSubServiceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubSubmit = async (e) => {
    e.preventDefault();

    const { id, service_id, name, price } = editSubServiceData;

    if (!name.trim()) {
      showToast("Plans name is required", "error");
      return;
    }
    if (!price || isNaN(price) || Number(price) < 0) {
      showToast("Valid price is required", "error");
      return;
    }
    if (!service_id) {
      showToast("Parent service must be selected", "error");
      return;
    }

    const { error } = await supabase
      .from("sub_services")
      .update({
        name: name.trim(),
        price: Number(price),
        service_id,
      })
      .eq("id", id);

    if (error) {
      showToast("Failed to update Plan", "error");
      return;
    }

    // 🔹 Update questions
    await supabase
      .from("sub_service_questions")
      .delete()
      .eq("sub_service_id", id);

    if (editQuestions.length > 0) {
      await supabase.from("sub_service_questions").insert(
        editQuestions.map((q) => ({
          sub_service_id: id,
          question: q.question,
          type: q.type,
          options: q.options,
        }))
      );
    }

    showToast("Plan updated successfully", "success");
    fetchData();
    setShowEditSubModal(false);
  };

  const handleEditSubService = (sub) => {
    setEditSubServiceData(sub);

    // 👇 ADD THIS LINE HERE
    setEditQuestions(subServiceQuestions[sub.id] || []);

    setShowEditSubModal(true);
  };

  // --- Excel & PDF for Plans ---

  const downloadExcelSubServices = () => {
    const sheet = XLSX.utils.json_to_sheet(
      subServices.map((ss, i) => {
        const service = services.find((s) => s.id === ss.service_id);
        return {
          "#": i + 1,
          Service: service?.name || "—",
          SubService: ss.name,
          Price: ss.price,
        };
      })
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Plans");
    XLSX.writeFile(wb, "sub_services.xlsx");
  };

  const downloadPDFSubServices = () => {
    const doc = new jsPDF();
    doc.text("Plan List", 14, 15);

    doc.autoTable({
      head: [["#", "Service", "Plan", "Price", "Working Hours"]],
      body: subServices.map((ss, i) => {
        const service = services.find((s) => s.id === ss.service_id);
        return [
          i + 1,
          service?.name || "—",
          ss.name,
          `₹${ss.price}`,
          ss.working_hours || "—",
        ];
      }),
      startY: 20,
    });

    doc.save("sub_services.pdf");
  };

  return (
    <div className="min-h-screen pb-16">
      {/* --- Top Header --- */}
      <header className="bg-gradient-to-r from-red-700 to-gray-900 text-white px-8 py-10 rounded-b-3xl shadow-lg">
        <h1 className="text-4xl font-extrabold tracking-tight">Services List</h1>
        <p className="text-gray-300 mt-2 text-lg">
          Update, track, and organize all your services and Plans efficiently.
        </p>
      </header>

      {/* --- Stats Cards --- */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 px-8">
        {[
          { icon: Building2, title: "Total Cities", value: cities.length },
          { icon: Wrench, title: "Total Services", value: services.length },
          { icon: Layers, title: "Total Plans", value: subServices.length },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="relative group bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-300"
            >
              {/* Hover Red Glow Layer */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500 to-red-700 opacity-0 group-hover:opacity-10 transition duration-300"></div>

              <div className="flex items-center justify-between">
                {/* Icon Style */}
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

      {/* --- Service List Section --- */}
      <div className="flex justify-between items-center mb-6 px-8 mt-12">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wrench className="text-red-600" /> Service List
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => downloadExcel()}
            className="bg-green-600 text-white px-4 py-2 rounded-xl flex gap-2 hover:bg-green-700 transition"
            aria-label="Download Excel"
          >
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button
            onClick={() => downloadPDF()}
            className="bg-red-600 text-white px-4 py-2 rounded-xl flex gap-2 hover:bg-red-700 transition"
            aria-label="Download PDF"
          >
            <FileDown size={18} /> PDF
          </button>
        </div>
      </div>

      {/* --- Service Table --- */}
      <div className="bg-white rounded-xl shadow border overflow-x-auto mx-8">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">#</th>
              <th className="px-6 py-3 text-left">City</th>
              <th className="px-6 py-3 text-left">Service</th>
              <th className="px-6 py-3 text-left">Price</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {services.map((s, i) => {
              const city = cities.find((c) => c.id === s.city_id);
              return (
                <tr key={s.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-6 py-3">{i + 1}</td>
                  <td className="px-6 py-3">{city?.name || "—"}</td>
                  <td className="px-6 py-3 font-semibold">{s.name}</td>
                  <td className="px-6 py-3">₹{s.price}</td>
                  <td className="px-6 py-3 flex justify-center gap-3">
                    <button
                      onClick={() => handleView(s.id)}
                      className="text-blue-600 hover:text-blue-800"
                      aria-label={`View details of ${s.name}`}
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEditOpen(s.id)}
                      className="text-yellow-600 hover:text-yellow-800"
                      aria-label={`Edit ${s.name}`}
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id, "service")}
                      className="text-red-600 hover:text-red-800"
                      aria-label={`Delete ${s.name}`}
                      title="Delete"
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

      {/* --- Plans List Section --- */}
      <div className="flex justify-between items-center mb-6 px-8 mt-16">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Layers className="text-red-600" /> Plans List
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => downloadExcelSubServices()}
            className="bg-green-600 text-white px-4 py-2 rounded-xl flex gap-2 hover:bg-green-700 transition"
            aria-label="Download Plans Excel"
          >
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button
            onClick={() => downloadPDFSubServices()}
            className="bg-red-600 text-white px-4 py-2 rounded-xl flex gap-2 hover:bg-red-700 transition"
            aria-label="Download Plans PDF"
          >
            <FileDown size={18} /> PDF
          </button>
        </div>
      </div>

      {/* --- Plans Table --- */}
      <div className="bg-white rounded-xl shadow border overflow-x-auto mx-8 mb-16">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">#</th>
              <th className="px-6 py-3 text-left">Service</th>
              <th className="px-6 py-3 text-left">Plan</th>
              <th className="px-6 py-3 text-left">Price</th>
              <th className="px-6 py-3 text-left">Questions</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {subServices.map((ss, i) => {
              const service = services.find((s) => s.id === ss.service_id);
              return (
                <tr key={ss.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-6 py-3">{i + 1}</td>
                  <td className="px-6 py-3">{service?.name || "—"}</td>
                  <td className="px-6 py-3 font-semibold">{ss.name}</td>
                  <td className="px-6 py-3">₹{ss.price}</td>
                  <td className="px-6 py-3">
                    {subServiceQuestions[ss.id]?.length || 0}
                  </td>

                  <td className="px-6 py-3 flex justify-center gap-3">
                    <button
                      onClick={() => handleViewSubService(ss.id)}
                      className="text-blue-600 hover:text-blue-800"
                      aria-label={`View details of Plan ${ss.name}`}
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEditSubOpen(ss.id)}
                      className="text-yellow-600 hover:text-yellow-800"
                      aria-label={`Edit Plan ${ss.name}`}
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(ss.id, "subService")}
                      className="text-red-600 hover:text-red-800"
                      aria-label={`Delete Plan ${ss.name}`}
                      title="Delete"
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

      {/* --- View Service Modal --- */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full relative shadow-xl">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close view modal"
            >
              <X size={24} />
            </button>

            <h2 className="text-xl font-bold mb-4">Service Details</h2>
            <p>
              <b>City:</b> {viewCity?.name}
            </p>
            <p>
              <b>Service:</b> {viewService?.name}
            </p>
            <p>
              <b>Price:</b> ₹{viewService?.price}
            </p>

            <h3 className="mt-4 font-semibold">Plan</h3>
            {viewSubServices.length ? (
              <ul className="list-disc ml-5">
                {viewSubServices.map((ss) => (
                  <li key={ss.id}>
                    {ss.name} – ₹{ss.price}{" "}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No Plan</p>
            )}
          </div>
        </div>
      )}

      {/* --- View Plans Modal --- */}
      {showViewSubModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg relative overflow-y-auto max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={() => setShowViewSubModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
              aria-label="Close Plan view modal"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Plan Details</h2>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-4">
              {/* Parent Service */}
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Parent Service:</span>
                <span className="text-gray-900 font-medium">
                  {services.find((s) => s.id === viewSubService?.service_id)?.name || "—"}
                </span>
              </div>

              {/* Location / City */}
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Location:</span>
                <span className="text-gray-900 font-medium">
                  {cities.find(
                    (c) => c.id === services.find((s) => s.id === viewSubService?.service_id)?.city_id
                  )?.name || "—"}
                </span>
              </div>

              {/* Plans Name */}
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Plan Name:</span>
                <span className="text-gray-900 font-medium">{viewSubService?.name}</span>
              </div>

              {/* Price */}
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Price:</span>
                <span className="text-gray-900 font-bold">₹{viewSubService?.price}</span>
              </div>

              {/* Questions */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Questions</h3>
                {subServiceQuestions[viewSubService?.id]?.length ? (
                  <div className="space-y-3">
                    {subServiceQuestions[viewSubService.id].map((q) => (
                      <div key={q.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <p className="font-medium text-gray-800 mb-1">
                          {q.question} <span className="text-sm text-gray-500">({q.type})</span>
                        </p>
                        {q.options.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {q.options.map((opt, i) => {
                              if (typeof opt === "object" && opt.option && opt.price) {
                                return (
                                  <span
                                    key={i}
                                    className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-medium"
                                  >
                                    {opt.option} ₹{opt.price}
                                  </span>
                                );
                              }
                              return (
                                <span
                                  key={i}
                                  className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-medium"
                                >
                                  {opt}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No questions added</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Delete Modal (for service & Plans) --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full shadow-lg">
            <h3 className="font-bold mb-3">
              Delete {deleteItem.type === "service" ? "Service" : "Plans"}?
            </h3>
            <p className="mb-6 text-gray-600">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Edit Service Modal --- */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full relative shadow-xl">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close edit modal"
            >
              <X size={24} />
            </button>

            <h2 className="text-xl font-bold mb-4">Edit Service</h2>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block font-semibold mb-1">
                  Service Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={editServiceData.name}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="price" className="block font-semibold mb-1">
                  Price (₹)
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editServiceData.price}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="city_id" className="block font-semibold mb-1">
                  City
                </label>
                <select
                  id="city_id"
                  name="city_id"
                  value={editServiceData.city_id ?? ""}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="" disabled>
                    Select city
                  </option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
{/* --- Edit Plans Modal --- */}
{showEditSubModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-y-auto max-h-[90vh]">
      
      {/* Close Button */}
      <button
        onClick={() => setShowEditSubModal(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
        aria-label="Close edit plan modal"
      >
        <X size={24} />
      </button>

      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800">Edit Plan</h2>
        <p className="text-gray-500 mt-1">Update Plan details, questions, and options.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleEditSubSubmit} className="px-8 py-6 space-y-6">
        
        {/* Plan Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Plan Name</label>
            <input
              type="text"
              name="name"
              value={editSubServiceData.name}
              onChange={handleEditSubChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter plan name"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={editSubServiceData.price}
              min="0"
              step="0.01"
              onChange={handleEditSubChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter price"
              required
            />
          </div>
        </div>

        {/* Parent Service */}
        <div>
          <label className="block font-semibold mb-1">Parent Service</label>
          <select
            name="service_id"
            value={editSubServiceData.service_id ?? ""}
            onChange={handleEditSubChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          >
            <option value="" disabled>Select service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </select>
        </div>

{/* Questions Section */}
<div>
  <div className="flex items-center justify-between mb-2">
    <label className="block font-semibold text-gray-800">Questions</label>
    <button
      type="button"
      onClick={() =>
        setEditQuestions([
          ...editQuestions,
          { question: "", type: "text", options: [] },
        ])
      }
      className="text-green-600 hover:text-green-800 font-semibold"
    >
      + Add Question
    </button>
  </div>

  <div className="space-y-4">
    {editQuestions.map((q, qIndex) => (
      <div
        key={qIndex}
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm"
      >
        {/* Question Header */}
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">
            Question {qIndex + 1}
          </span>
          <button
            type="button"
            onClick={() => {
              const newQuestions = [...editQuestions];
              newQuestions.splice(qIndex, 1);
              setEditQuestions(newQuestions);
            }}
            className="text-red-600 hover:text-red-800 font-semibold"
          >
            Delete
          </button>
        </div>

        {/* Question Text */}
        <input
          type="text"
          value={q.question}
          onChange={(e) => {
            const newQuestions = [...editQuestions];
            newQuestions[qIndex].question = e.target.value;
            setEditQuestions(newQuestions);
          }}
          placeholder="Enter question text"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
        />

      {/* Question Type */}
<select
  value={q.type}
  onChange={(e) => {
    const newQuestions = [...editQuestions];
    newQuestions[qIndex].type = "select"; // always "select"
    setEditQuestions(newQuestions);
  }}
  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
>
  <option value="select">Multiple Choice</option>
</select>

{/* Options (always enabled) */}
<div className="space-y-2">
  {q.options.map((opt, oIndex) => (
    <div key={oIndex} className="flex gap-2 items-center">
      <input
        type="text"
        value={opt.option}
        onChange={(e) => {
          const newQuestions = [...editQuestions];
          newQuestions[qIndex].options[oIndex].option = e.target.value;
          setEditQuestions(newQuestions);
        }}
        placeholder="Option"
        className="flex-1 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
      <input
        type="number"
        min="0"
        value={opt.price}
        onChange={(e) => {
          const newQuestions = [...editQuestions];
          newQuestions[qIndex].options[oIndex].price = e.target.value;
          setEditQuestions(newQuestions);
        }}
        placeholder="Price"
        className="w-24 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
      <button
        type="button"
        onClick={() => {
          const newQuestions = [...editQuestions];
          newQuestions[qIndex].options.splice(oIndex, 1);
          setEditQuestions(newQuestions);
        }}
        className="text-red-600 hover:text-red-800 font-semibold"
      >
        Delete
      </button>
    </div>
  ))}

  <button
    type="button"
    onClick={() => {
      const newQuestions = [...editQuestions];
      newQuestions[qIndex].options.push({ option: "", price: "" });
      setEditQuestions(newQuestions);
    }}
    className="text-blue-600 hover:text-blue-800 font-semibold mt-1"
  >
    + Add Option
  </button>
</div>

      </div>
    ))}
  </div>
</div>


        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setShowEditSubModal(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
)}


    </div>
  );
}
