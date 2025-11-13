"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Wrench, Layers, Building2, X } from "lucide-react";
import StatsCard from "../../../components/StatsCard";
import { Eye, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FileDown, FileSpreadsheet } from "lucide-react";

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [subServices, setSubServices] = useState([]);
  const [serviceDescription, setServiceDescription] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [subServiceName, setSubServiceName] = useState("");
  const [subServicePrice, setSubServicePrice] = useState("");
  const [subServiceDescription, setSubServiceDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [questionType, setQuestionType] = useState("text");
  const [options, setOptions] = useState([{ option: "", price: "" }]);
  const [viewService, setViewService] = useState(null);
  const [viewSubServices, setViewSubServices] = useState([]);
  const [viewCity, setViewCity] = useState(null);
  const [selectedServiceView, setSelectedServiceView] = useState(false);

  const handleViewService = (id) => {
    const service = services.find((s) => s.id === id);
    const city = cities.find((c) => c.id === service.city_id);
    const subs = subServices.filter((ss) => ss.service_id === id);
    setViewService(service);
    setViewCity(city);
    setViewSubServices(subs);
    setSelectedServiceView(true);
  };

  const fetchData = async () => {
    const { data: cityData } = await supabase.from("cities").select("*");
    setCities(cityData || []);
    const { data: serviceData } = await supabase.from("services").select("*");
    setServices(serviceData || []);
    const { data: subServiceData } = await supabase
      .from("sub_services")
      .select("*");
    setSubServices(subServiceData || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Download Services as Excel
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      services.map((service, index) => {
        const city = cities.find((c) => c.id === service.city_id);
        return {
          "#": index + 1,
          City: city ? city.name : "—",
          Service: service.name,
          Price: service.price,
          Description: service.description,
        };
      })
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Services");
    XLSX.writeFile(workbook, "services_data.xlsx");
  };

  // 🔹 Download Services as PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Service Management Report", 14, 15);

    const tableColumn = ["#", "City", "Service", "Price (₹)", "Description"];
    const tableRows = services.map((service, index) => {
      const city = cities.find((c) => c.id === service.city_id);
      return [
        index + 1,
        city ? city.name : "—",
        service.name,
        service.price,
        service.description,
      ];
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 4: { cellWidth: 60 } }, // limit Description width
    });

    doc.save("services_data.pdf");
  };

  // --- Add Service ---
  const addService = async () => {
    if (!selectedCity || !serviceName || !servicePrice || !serviceDescription) {
      alert("⚠️ Please fill all fields!");
      return;
    }
    const { error } = await supabase.from("services").insert([
      {
        name: serviceName,
        city_id: selectedCity,
        price: parseFloat(servicePrice),
        description: serviceDescription,
      },
    ]);
    if (error) console.error(error);
    else {
      alert("✅ Service added successfully!");
      setServiceName("");
      setServicePrice("");
      setServiceDescription("");
      fetchData();
    }
  };

  // --- Add Sub-Service ---
  const addSubService = async () => {
  if (!selectedService || !subServiceName || !subServicePrice) {
    alert("⚠️ Please fill all sub-service fields!");
    return;
  }

  // Insert sub-service
  const { data: insertedSub, error: subErr } = await supabase
    .from("sub_services")
    .insert([
      {
        service_id: selectedService,
        name: subServiceName,
        price: parseFloat(subServicePrice),
        description: subServiceDescription,
      },
    ])
    .select()
    .single();

  if (subErr) {
    console.error(subErr);
    return alert("❌ Error adding sub-service");
  }

  // Insert related questions
  if (questions.length > 0) {
    const formattedQuestions = questions.map((q) => ({
      sub_service_id: insertedSub.id,
      question: q.text,
      type: q.type,
options: q.type === "multiple" ? q.options : null,
    }));

    const { error: qError } = await supabase
      .from("sub_service_questions")
      .insert(formattedQuestions);

    if (qError) {
      console.error(qError);
      alert("⚠️ Sub-service added, but failed to save questions!");
    }
  }

  alert("✅ Sub-Service and questions saved successfully!");
  setSubServiceName("");
  setSubServicePrice("");
  setSubServiceDescription("");
  setQuestions([]);
};


  // Add new option
  const addOptionField = () => {
    setOptions([...options, { option: "", price: "" }]);
  };

  // Handle change for option text
  const handleOptionChange = (i, val) => {
    const updated = [...options];
    updated[i].option = val;
    setOptions(updated);
  };

  // Handle change for option price
  const handleOptionPriceChange = (i, val) => {
    const updated = [...options];
    updated[i].price = val;
    setOptions(updated);
  };


  const saveQuestion = () => {
    if (!newQuestion.trim()) {
      alert("Please enter a question");
      return;
    }
const newQ = {
  text: newQuestion,
  type: questionType,
  options:
    questionType === "multiple"
      ? options.filter((opt) => opt.option.trim() !== "")
      : [],
};


    setQuestions([...questions, newQ]);
    setNewQuestion("");
    setQuestionType("text");
setOptions([{ option: "", price: "" }]);
    setShowQuestionModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-700 to-gray-900 text-white px-8 py-10 rounded-b-3xl shadow-lg">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Service Management
        </h1>
        <p className="text-gray-300 mt-2 text-lg">
          Add, track, and organize all your services and sub-services
          efficiently.
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 px-8">
        <StatsCard
          icon={Building2}
          title="Total Cities"
          value={cities.length}
          gradient="from-red-700 to-gray-900"
        />
        <StatsCard
          icon={Wrench}
          title="Total Services"
          value={services.length}
          gradient="from-red-700 to-gray-900"
        />
        <StatsCard
          icon={Layers}
          title="Total Sub-Services"
          value={subServices.length}
          gradient="from-red-700 to-gray-900"
        />
      </section>

      {/* 🔹 Forms Section */}
      <main className="px-8 py-12 space-y-14">
        {/* 🔧 Add New Service */}
        <section className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-md rounded-3xl p-10 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-100 text-red-600 p-3 rounded-xl">
              <Wrench size={24} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">Add New Service</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Select City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="">Choose City</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Service Name</label>
              <input
                type="text"
                placeholder="Enter Service Name"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Price (₹)</label>
              <input
                type="number"
                placeholder="Enter Price"
                value={servicePrice}
                onChange={(e) => setServicePrice(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <input
                type="text"
                placeholder="Enter Description"
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>

          <div className="text-right mt-8">
            <button
              onClick={addService}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition-all"
            >
              + Add Service
            </button>
          </div>
        </section>

        {/* 🧱 Add Sub-Service */}
        <section className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-md rounded-3xl p-10 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-100 text-red-600 p-3 rounded-xl">
              <Layers size={24} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">Add Sub-Service</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Select Service (with City)</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="">Choose Service</option>
                {services.map((s) => {
                  const city = cities.find((c) => c.id === s.city_id);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} {city ? `(${city.name})` : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Sub-Service Name</label>
              <input
                type="text"
                placeholder="Enter Sub-Service Name"
                value={subServiceName}
                onChange={(e) => setSubServiceName(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Price (₹)</label>
              <input
                type="number"
                placeholder="Enter Price"
                value={subServicePrice}
                onChange={(e) => setSubServicePrice(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <input
                type="text"
                placeholder="Enter Description"
                value={subServiceDescription}
                onChange={(e) => setSubServiceDescription(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>

          {/* 🧩 Question Section */}
          <div className="mt-8">
            <label className="block text-gray-800 font-semibold mb-3">
              Questions ({questions.length})
            </label>

            <button
              type="button"
              onClick={() => setShowQuestionModal(true)}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-5 py-2 rounded-xl text-white font-semibold shadow-md transition-all"
            >
              + Add Question
            </button>

            <ul className="mt-5 space-y-2 text-sm">
              {questions.map((q, i) => (
                <li
                  key={i}
                  className="bg-gray-100 border border-gray-200 p-3 rounded-xl flex justify-between items-center"
                >
                  <span>
                    {q.text}{" "}
                    <span className="text-xs text-gray-500">
                      ({q.type === "multiple" ? "Multiple Choice" : "Text"})
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-right mt-10">
            <button
              onClick={addSubService}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition-all"
            >
              + Add Sub-Service
            </button>
          </div>
        </section>
      </main>

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/60 z-50">
          <div className="bg-white text-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowQuestionModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-black"
            >
              <X />
            </button>

            <h3 className="text-2xl font-bold mb-4">Add Question</h3>

            {/* Question Text */}
            <input
              type="text"
              placeholder="Enter question text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl mb-4"
            />

            {/* Question Type */}
            <label className="block mb-2 text-sm font-semibold">Question Type</label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl mb-4"
            >
              <option value="text">Text Answer</option>
              <option value="multiple">Multiple Choice (with prices)</option>
            </select>

            {/* Multiple Choice Options with Prices */}
            {questionType === "multiple" && (
              <div>
                <label className="block mb-2 text-sm font-semibold">Options</label>
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-3 mb-2 items-center">
                    <input
                      type="text"
                      placeholder={`Option ${i + 1}`}
                      value={opt.option}
                      onChange={(e) => handleOptionChange(i, e.target.value)}
                      className="w-2/3 p-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={opt.price}
                      onChange={(e) => handleOptionPriceChange(i, e.target.value)}
                      className="w-1/3 p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setOptions([...options, { option: "", price: "" }])}
                  className="text-green-700 text-sm font-semibold mt-1"
                >
                  + Add Option
                </button>
              </div>
            )}

            <button
              onClick={() => {
                if (!newQuestion.trim()) {
                  alert("Please enter a question");
                  return;
                }

                const newQ = {
                  text: newQuestion,
                  type: questionType,
                  options:
                    questionType === "multiple"
                      ? options.filter((opt) => opt.option.trim() !== "")
                      : [],
                };
                setQuestions([...questions, newQ]);
                setNewQuestion("");
                setQuestionType("text");
                setOptions([{ option: "", price: "" }]);
                setShowQuestionModal(false);
              }}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl"
            >
              Save Question
            </button>
          </div>
        </div>
      )}


      {/* 🧾 Service List Table */}
      <section className="px-8 mt-6 mb-10"> {/* Added bottom margin with mb-10 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          {/* 🔹 Table Header with Title + Export Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-8 py-4 rounded-t-2xl">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Wrench className="text-red-600 bg-red-100 p-2 rounded-lg" size={28} />
              Service List
            </h2>

            <div className="flex gap-3 mt-4 sm:mt-0">
              <button
                onClick={handleDownloadExcel}
                disabled={services.length === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${services.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
              >
                <FileSpreadsheet size={18} />
                Excel
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={services.length === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${services.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
              >
                <FileDown size={18} />
                PDF
              </button>
            </div>
          </div>



          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-50">
            <table className="min-w-full text-sm text-gray-800">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold border-b">
                <tr>
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">City</th>
                  <th className="px-6 py-3 text-left">Service Name</th>
                  <th className="px-6 py-3 text-left">Price</th>
                  <th className="px-6 py-3 text-left">Description</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {services.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      <Eye className="inline-block w-5 h-5 mr-2 text-gray-400" /> {/* 👁️ replaced Search with Eye */}
                      No services found
                    </td>
                  </tr>
                ) : (
                  services.map((service, i) => {
                    const city = cities.find((c) => c.id === service.city_id);
                    return (
                      <tr
                        key={service.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {i + 1}
                        </td>
                        <td className="px-6 py-4">{city ? city.name : "—"}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {service.name}
                        </td>
                        <td className="px-6 py-4">₹{service.price}</td>
                        <td className="px-6 py-4">{service.description}</td>
                        <td className="px-6 py-4 flex justify-center gap-3">
                          <button
                            className="text-blue-600 hover:text-blue-500"
                            onClick={() => handleViewService(service.id)}
                          >
                            <Eye size={18} /> {/* 👁️ replaced Search with Eye */}
                          </button>
                          <button
                            className="text-red-600 hover:text-red-500"
                            onClick={() => handleDelete(service.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* White footer gap */}
      <div className="bg-white h-24 mt-10 rounded-t-2xl"></div>

      {/* 🔍 View Service Modal */}
      {selectedServiceView && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl p-8 relative">
            <button
              onClick={() => setSelectedServiceView(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-600"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
              <Wrench className="text-red-600" /> Service Details
            </h2>

            <div className="space-y-3 mb-6">
              <p><strong>City:</strong> {viewCity?.name || "—"}</p>
              <p><strong>Service:</strong> {viewService?.name}</p>
              <p><strong>Price:</strong> ₹{viewService?.price}</p>
              <p><strong>Description:</strong> {viewService?.description}</p>
            </div>

            <h3 className="text-lg font-semibold mb-2 text-gray-800">Sub-Services</h3>
            {viewSubServices.length > 0 ? (
              <ul className="list-disc ml-5 space-y-1">
                {viewSubServices.map((ss) => (
                  <li key={ss.id}>
                    <strong>{ss.name}</strong> – ₹{ss.price}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No sub-services found.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
