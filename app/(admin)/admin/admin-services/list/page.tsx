"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  MapPin, Tag, IndianRupee, HelpCircle, Info, Briefcase, Edit3,
  Eye, Settings2, Plus,
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

// Define types for better TypeScript support
interface City {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
  city_id: number;
}

interface SubService {
  id: number;
  service_id: number;
  name: string;
  price: number;
  working_hours?: string;
}

interface QuestionOption {
  option: string;
  price: string;
}

interface Question {
  id: number;
  sub_service_id: number;
  question: string;
  type: "text" | "select" | "radio" | "checkbox";
  options: QuestionOption[];
}


export default function ServiceListPage() {
  const { showToast } = useToast();

  const [services, setServices] = useState<Service[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [subServices, setSubServices] = useState<SubService[]>([]);
  const [subServiceQuestions, setSubServiceQuestions] = useState<{ [key: number]: Question[] }>({});

  // Services modal state
  const [viewService, setViewService] = useState<Service | null>(null);
  const [viewCity, setViewCity] = useState<City | null>(null);
  const [viewSubServices, setViewSubServices] = useState<SubService[]>([]);
  const [showViewModal, setShowViewModal] = useState(false);

  // Plans modal state
  const [viewSubService, setViewSubService] = useState<SubService | null>(null);
  const [showViewSubModal, setShowViewSubModal] = useState(false);

  // Delete modal - general for both services and Plans
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ id: number | null; type: "service" | "subService" | null }>({ id: null, type: null });
  const [editQuestions, setEditQuestions] = useState<Question[]>([]);

  // Edit modal states for service & Plans
  const [showEditModal, setShowEditModal] = useState(false);
  const [editServiceData, setEditServiceData] = useState<{
    id: number | null;
    name: string;
    city_id: number | null;
  }>({
    id: null,
    name: "",
    city_id: null,
  });

  const [showEditSubModal, setShowEditSubModal] = useState(false);
  const [editSubServiceData, setEditSubServiceData] = useState<{
    id: number | null;
    service_id: number | null;
    name: string;
    price: string;
  }>({
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

    setCities(cityData as City[] || []);
    setServices(serviceData as Service[] || []);
    setSubServices(subData as SubService[] || []);

    // Organize questions by sub_service_id
    const questionsMap: { [key: number]: Question[] } = {};
    (questionData as Question[] || []).forEach((q) => {
      if (!questionsMap[q.sub_service_id]) {
        questionsMap[q.sub_service_id] = [];
      }

      questionsMap[q.sub_service_id].push({
        id: q.id,
        sub_service_id: q.sub_service_id,
        question: q.question,
        type: q.type || "text",
        options: Array.isArray(q.options)
          ? q.options.map((o): QuestionOption => {
            if (typeof o === "object" && o !== null) {
              return {
                option: o.option ?? "",
                price: o.price ?? "",
              };
            }

            // fallback if old string data exists in DB
            return {
              option: String(o),
              price: "",
            };
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
  const handleView = (id: number) => {
    const service = services.find((s) => s.id === id);
    const city = cities.find((c) => c.id === service?.city_id);
    const subs = subServices.filter((ss) => ss.service_id === id);

    setViewService(service || null);
    setViewCity(city || null);
    setViewSubServices(subs);
    setShowViewModal(true);
  };

  // Delete service/Plans
  const handleDelete = (id: number, type: "service" | "subService") => {
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
  const handleEditOpen = (id: number) => {
    const service = services.find((s) => s.id === id);
    if (service) {
      setEditServiceData({
        id: service.id,
        name: service.name,
        city_id: service.city_id,
      });
      setShowEditModal(true);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditServiceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { id, name, city_id } = editServiceData;

    if (!name.trim()) {
      showToast("Service name is required", "error");
      return;
    }
    if (!city_id) {
      showToast("City must be selected", "error");
      return;
    }

    const { error } = await supabase
      .from("services")
      .update({ name: name.trim(), city_id })
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
  const handleViewSubService = (id: number) => {
    const sub = subServices.find((ss) => ss.id === id);
    if (sub) {
      setViewSubService(sub);
      setShowViewSubModal(true);
    }
  };

  // Edit Plans open
  const handleEditSubOpen = (id: number) => {
    const sub = subServices.find((ss) => ss.id === id);
    if (sub) {
      setEditSubServiceData({
        id: sub.id,
        service_id: sub.service_id,
        name: sub.name,
        price: sub.price.toString(),
      });

      // 🔹 Set questions for this Plans with proper options objects
      setEditQuestions(
        (subServiceQuestions[sub.id] || []).map((q) => ({
          id: q.id,
          sub_service_id: q.sub_service_id,
          question: q.question,
          type: q.type || "text",
          options: Array.isArray(q.options)
            ? q.options.map((o) => ({
              option: o.option ?? "",
              price: o.price ?? "",
            }))
            : [],

        }))
      );

      setShowEditSubModal(true);
    }
  };

  const handleEditSubChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditSubServiceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { id, service_id, name, price } = editSubServiceData;

    if (!name.trim()) {
      showToast("Plans name is required", "error");
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
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
          sub_service_id: q.sub_service_id,
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

  // --- Excel & PDF for Services ---

  const downloadExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(
      services.map((s, i) => {
        const city = cities.find((c) => c.id === s.city_id);
        return {
          "#": i + 1,
          City: city?.name || "—",
          Service: s.name,
        };
      })
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Services");
    XLSX.writeFile(wb, "services.xlsx");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Service List", 14, 15);

    (doc as any).autoTable({
      head: [["#", "City", "Service"]],
      body: services.map((s, i) => {
        const city = cities.find((c) => c.id === s.city_id);
        return [
          i + 1,
          city?.name || "—",
          s.name,
        ];
      }),
      startY: 20,
    });

    doc.save("services.pdf");
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
      <section className="bg-white border border-gray-300 rounded-2xl p-8 shadow-md mt-8">
        <div className="flex justify-between items-center mb-6 px-8">
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
      </section>

      {/* --- Plans List Section --- */}
      <section className="bg-white border border-gray-300 rounded-2xl p-8 shadow-md mt-8">
        <div className="flex justify-between items-center mb-6 px-8">
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
      </section>

      {/* 🔹 View Service Modal (Horizontal Design) */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200">

            {/* Modal Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Info size={20} className="text-gray-500" /> Service Overview
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row">
              {/* Left Side: Summary & Location */}
              <div className="w-full md:w-1/3 bg-gray-50 p-6 flex flex-col items-center justify-start border-b md:border-b-0 md:border-r border-gray-200 text-center">
                <div className="w-20 h-20 bg-white rounded-2xl border border-gray-300 flex items-center justify-center shadow-sm mb-4 text-gray-400">
                  <Briefcase size={32} />
                </div>


                <div className="mt-8 w-full">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Service Location</label>
                  <p className="text-gray-700 font-semibold text-sm flex items-center justify-center gap-1">
                    <MapPin size={14} className="text-gray-400" /> {viewCity?.name}
                  </p>
                </div>
              </div>

              {/* Right Side: Service Name & Sub-Plans */}
              <div className="w-full md:w-2/3 p-6 space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Service Name</label>
                  <h2 className="text-2xl font-bold text-gray-900 leading-none mt-1">
                    {viewService?.name}
                  </h2>
                </div>

                <hr className="border-gray-100" />

                {/* Sub-Services / Plans Section */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2 mb-3">
                    <Layers size={14} /> Associated Plans ({viewSubServices.length})
                  </label>

                  {viewSubServices.length ? (
                    <div className="grid gap-2">
                      {viewSubServices.map((ss) => (
                        <div
                          key={ss.id}
                          className="flex justify-between items-center p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-sm font-bold text-gray-700">{ss.name}</span>
                          <span className="text-sm font-black text-gray-900">₹{ss.price}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                      <p className="text-gray-400 text-xs italic">No additional plans added to this service yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2 bg-gray-900 text-white text-sm rounded-lg font-bold hover:bg-black transition-all active:scale-95 shadow-md"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 View Plans Modal (Horizontal Design) */}
      {showViewSubModal && viewSubService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200 max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Layers size={20} className="text-gray-500" /> Plan Overview
              </h3>
              <button
                onClick={() => setShowViewSubModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row overflow-y-auto">
              {/* Left Side: Summary Info */}
              <div className="w-full md:w-1/3 bg-gray-50 p-6 flex flex-col items-center justify-start border-b md:border-b-0 md:border-r border-gray-200 text-center">
                <div className="w-20 h-20 bg-white rounded-2xl border border-gray-300 flex items-center justify-center shadow-sm mb-4">
                  <Tag size={32} className="text-gray-400" />
                </div>

                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Base Price</label>
                <p className="text-2xl font-black text-gray-900 flex items-center justify-center gap-1">
                  <IndianRupee size={18} /> {viewSubService.price}
                </p>

                <div className="mt-8 w-full space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Parent Service</label>
                    <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-[11px] font-bold block truncate">
                      {services.find((s) => s.id === viewSubService?.service_id)?.name || "—"}
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Availability</label>
                    <p className="text-gray-700 font-semibold text-xs flex items-center justify-center gap-1">
                      <MapPin size={12} /> {cities.find(
                        (c) => c.id === services.find((s) => s.id === viewSubService?.service_id)?.city_id
                      )?.name || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side: Detailed Details & Questions */}
              <div className="w-full md:w-2/3 p-6 space-y-8">
                {/* Plan Name Section */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Selected Plan</label>
                  <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                    {viewSubService.name}
                  </h2>
                </div>

                {/* Dynamic Questions Section */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
                    <HelpCircle size={14} /> Configured Questions
                  </label>

                  {subServiceQuestions[viewSubService?.id]?.length ? (
                    <div className="grid gap-3">
                      {subServiceQuestions[viewSubService.id].map((q) => (
                        <div key={q.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-bold text-gray-800 text-sm">{q.question}</p>
                            <span className="text-[9px] bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-500 uppercase font-bold">
                              {q.type}
                            </span>
                          </div>

                          {q.options?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {q.options.map((opt, i) => {
                                const isObj = typeof opt === "object";
                                const label = isObj ? opt.option : opt;
                                const addPrice = isObj && opt.price ? `+₹${opt.price}` : "";

                                return (
                                  <span key={i} className="bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded text-[10px] font-bold">
                                    {label} <span className="text-gray-400">{addPrice}</span>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                      <p className="text-gray-400 text-xs italic">No additional questions defined for this plan.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end shrink-0">
              <button
                onClick={() => setShowViewSubModal(false)}
                className="px-8 py-2.5 bg-gray-900 text-white text-sm rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
              >
                Close View
              </button>
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

      {/* 🔹 Edit Service Modal (Horizontal Design) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200">

            {/* Modal Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Edit3 size={20} className="text-gray-500" /> Edit Service
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="flex flex-col md:flex-row">
                {/* Left Side: Metadata & Icon */}
                <div className="w-full md:w-1/3 bg-gray-50 p-6 flex flex-col items-center justify-start border-b md:border-b-0 md:border-r border-gray-200">
                  <div className="w-20 h-20 bg-white rounded-2xl border border-gray-300 flex items-center justify-center shadow-sm mb-6 text-red-600">
                    <Briefcase size={32} />
                  </div>

                  <div className="w-full space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                        Assigned City
                      </label>
                      <select
                        name="city_id"
                        value={editServiceData.city_id ?? ""}
                        onChange={handleEditChange}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-red-500 outline-none transition"
                        required
                      >
                        <option value="" disabled>Select city</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                      </select>
                      <p className="text-[9px] text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin size={10} /> Determines visibility
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Form Fields */}
                <div className="w-full md:w-2/3 p-6 space-y-5">
                  <div>
                    <label htmlFor="name" className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">
                      Service Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="e.g. Deep Cleaning"
                      value={editServiceData.name}
                      onChange={handleEditChange}
                      className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition"
                      required
                    />
                  </div>


                  <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-[11px] text-red-700 font-medium leading-relaxed">
                      <b>Note:</b> Changing the service name or city will update how it appears to customers on the frontend immediately.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-red-600 text-white text-sm rounded-lg font-bold hover:bg-red-700 transition-all active:scale-95 shadow-md shadow-red-100"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Edit Plans Modal --- */}
      {/* 🔹 Edit Plans Modal (Horizontal & Scrollable Design) */}
      {showEditSubModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200 max-h-[90vh] flex flex-col">

            {/* Modal Header (Sticky) */}
            <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Settings2 size={20} className="text-gray-500" /> Edit Plan Details
              </h3>
              <button
                onClick={() => setShowEditSubModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubSubmit} className="flex flex-col overflow-hidden">
              <div className="overflow-y-auto p-6 space-y-8">

                {/* Section 1: Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">Plan Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editSubServiceData.name}
                      onChange={handleEditSubChange}
                      className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-2.5 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition"
                      placeholder="e.g. Premium Deep Clean"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">Base Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      value={editSubServiceData.price}
                      onChange={handleEditSubChange}
                      className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-2.5 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition"
                      required
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">Parent Service Category</label>
                    <div className="relative">
                      <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        name="service_id"
                        value={editSubServiceData.service_id ?? ""}
                        onChange={handleEditSubChange}
                        className="w-full border border-gray-200 bg-gray-50/50 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition appearance-none"
                        required
                      >
                        <option value="" disabled>Select service</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>{service.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Section 2: Questions Configuration */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
                      <HelpCircle size={14} /> Plan Questions
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setEditQuestions([
                          ...editQuestions,
                          {
                            id: Date.now(), // temporary unique ID
                            sub_service_id: editSubServiceData.id ?? 0,
                            question: "",
                            type: "select",
                            options: [],
                          },
                        ])
                      }
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 uppercase bg-blue-50 px-3 py-1.5 rounded-lg transition"
                    >
                      <Plus size={14} /> Add Question
                    </button>

                  </div>

                  <div className="space-y-4">
                    {editQuestions.map((q, qIndex) => (
                      <div key={qIndex} className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-4 relative group">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black text-gray-300 uppercase">Q. {qIndex + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newQuestions = [...editQuestions];
                              newQuestions.splice(qIndex, 1);
                              setEditQuestions(newQuestions);
                            }}
                            className="text-gray-400 hover:text-red-600 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => {
                            const newQuestions = [...editQuestions];
                            newQuestions[qIndex].question = e.target.value;
                            setEditQuestions(newQuestions);
                          }}
                          placeholder="Ask something (e.g., Square Footage?)"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-red-400 transition"
                        />

                        {/* Options List */}
                        <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Options & Price Modifiers</label>
                          {q.options.map((opt, oIndex) => (
                            <div key={oIndex} className="flex gap-2 items-center animate-in slide-in-from-left-2 duration-150">
                              <input
                                type="text"
                                value={opt.option}
                                onChange={(e) => {
                                  const newQuestions = [...editQuestions];
                                  newQuestions[qIndex].options[oIndex].option = e.target.value;
                                  setEditQuestions(newQuestions);
                                }}
                                placeholder="Label"
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-gray-400"
                              />
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">₹</span>
                                <input
                                  type="number"
                                  value={opt.price}
                                  onChange={(e) => {
                                    const newQuestions = [...editQuestions];
                                    newQuestions[qIndex].options[oIndex].price = e.target.value;
                                    setEditQuestions(newQuestions);
                                  }}
                                  placeholder="0"
                                  className="w-24 border border-gray-200 rounded-lg pl-5 pr-2 py-1.5 text-xs font-bold outline-none focus:border-gray-400"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newQuestions = [...editQuestions];
                                  newQuestions[qIndex].options.splice(oIndex, 1);
                                  setEditQuestions(newQuestions);
                                }}
                                className="p-1.5 text-gray-300 hover:text-red-500 transition"
                              >
                                <X size={14} />
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
                            className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 mt-2"
                          >
                            <Plus size={10} /> Add Option
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer (Sticky) */}
              <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditSubModal(false)}
                  className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-red-600 text-white text-sm rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-md"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}