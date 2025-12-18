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
import { useToast } from "@/app/components/toast/ToastContext";

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [cities, setCities] = useState([]);
  const { showToast } = useToast();
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
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState(null);
  const [selectedSubServiceId, setSelectedSubServiceId] = useState("");
  const [questionDetails, setQuestionDetails] = useState({
    question: "",
    type: "text",
    options: []
  });

  // Validation error states
  const [errors, setErrors] = useState({
    selectedCity: "",
    serviceName: "",
    servicePrice: "",
    serviceDescription: "",
    selectedService: "",
    subServiceName: "",
    subServicePrice: "",
    subServiceDescription: "",
    question: "",
    options: "",
  });

  // New states for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleAddQuestion = async () => {
    const { error } = await supabase
      .from("sub_service_questions")
      .insert({
        sub_service_id: selectedSubServiceId,
        question: questionDetails.question,
        type: questionType,
        options: questionDetails.options
      });

    if (error) {
      alert("Error adding question");
    } else {
      alert("Question added!");
      setShowAddQuestionModal(false);
    }
  };

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

  // Validation functions
  const validateServiceForm = () => {
    const newErrors = {
      selectedCity: "",
      serviceName: "",
      servicePrice: "",
      serviceDescription: "",
    };
    if (!selectedCity) newErrors.selectedCity = "Please select a city.";
    if (!serviceName.trim()) newErrors.serviceName = "Service name is required.";
    if (!servicePrice || parseFloat(servicePrice) <= 0) newErrors.servicePrice = "Price must be greater than 0.";
    const wordCount = serviceDescription.trim().split(/\s+/).filter(word => word).length;
    if (wordCount <= 1) newErrors.serviceDescription = "Description must be more than 10 words.";
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.values(newErrors).every(error => !error);
  };

  const validateSubServiceForm = () => {
    const newErrors = {
      selectedService: "",
      subServiceName: "",
      subServicePrice: "",
      subServiceDescription: "",
    };
    if (!selectedService) newErrors.selectedService = "Please select a service.";
    if (!subServiceName.trim()) newErrors.subServiceName = "Sub-service name is required.";
    if (!subServicePrice || parseFloat(subServicePrice) <= 0) newErrors.subServicePrice = "Price must be greater than 0.";
    const wordCount = subServiceDescription.trim().split(/\s+/).filter(word => word).length;
    if (wordCount <= 1) newErrors.subServiceDescription = "Description must be more than 10 words.";
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.values(newErrors).every(error => !error);
  };

  const validateQuestion = () => {
    const newErrors = { question: "", options: "" };
    if (!newQuestion.trim()) newErrors.question = "Question text is required.";
    if (questionType === "multiple") {
      const validOptions = options.filter(opt => opt.option.trim() && opt.price !== "" && !isNaN(parseFloat(opt.price)) && parseFloat(opt.price) >= 0);
      if (validOptions.length < 2) newErrors.options = "At least 2 options are required, each with text and a price (0 or more).";
    }
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.values(newErrors).every(error => !error);
  };

  // --- Add Service ---
  const addService = async () => {
    if (!validateServiceForm()) return;
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
      showToast("Service added successfully!", "success");
      setServiceName("");
      setServicePrice("");
      setServiceDescription("");
      setSelectedCity("");
      setErrors(prev => ({ ...prev, selectedCity: "", serviceName: "", servicePrice: "", serviceDescription: "" }));
      fetchData();
    }
  };

  // --- Add Sub-Service ---
  const addSubService = async () => {
    if (!validateSubServiceForm()) return;

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
      showToast("Error adding sub-service", "error");
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

    showToast("Sub-Service added successfully!", "success");
    setSubServiceName("");
    setSubServicePrice("");
    setSubServiceDescription("");
    setSelectedService("");
    setQuestions([]);
    setErrors(prev => ({ ...prev, selectedService: "", subServiceName: "", subServicePrice: "", subServiceDescription: "" }));
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

  // Open modal for adding or editing
  const openQuestionModal = (index = null) => {
    if (index !== null) {
      // Editing
      setEditingIndex(index);
      setEditData(questions[index]);
      setNewQuestion(questions[index].text);
      setQuestionType(questions[index].type);
      setOptions(questions[index].options.length > 0 ? questions[index].options : [{ option: "", price: "" }]);
    } else {
      // Adding new
      setEditingIndex(null);
      setEditData(null);
      setNewQuestion("");
      setQuestionType("text");
      setOptions([{ option: "", price: "" }]);
    }
    setShowQuestionModal(true);
  };

  const saveQuestion = () => {
    if (!validateQuestion()) return;

    const newQ = {
      text: newQuestion,
      type: questionType,
      options: questionType === "multiple" ? options.filter((opt) => opt.option.trim() !== "" && opt.price !== "" && !isNaN(parseFloat(opt.price)) && parseFloat(opt.price) >= 0) : [],
    };

    if (editingIndex !== null) {
      // Update existing
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = newQ;
      setQuestions(updatedQuestions);
    } else {
      // Add new
      setQuestions([...questions, newQ]);
    }

    // Reset
    setNewQuestion("");
    setQuestionType("text");
    setOptions([{ option: "", price: "" }]);
    setEditingIndex(null);
    setEditData(null);
    setShowQuestionModal(false);
    setErrors(prev => ({ ...prev, question: "", options: "" }));
  };

  // --- Delete Service (with confirmation modal and toast) ---
  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteFinal = async () => {
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", deleteId);

    setShowDeleteModal(false);

    if (!error) {
      showToast("Service deleted successfully!", "success");
      fetchData();
    } else {
      showToast("Failed to delete service!", "error");
    }
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

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 px-8">
        {[
          { icon: Building2, title: "Total Cities", value: cities.length },
          { icon: Wrench, title: "Total Services", value: services.length },
          { icon: Layers, title: "Total Sub-Services", value: subServices.length },
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
                {/* Icon Style Matching Previous Section */}
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

      {/* 🔹 Forms Section */}
      <main className="px-8 py-12 space-y-14">
        {/* 🟥 Add New Service – Block Card UI */}
        <section className="bg-white border border-gray-200 rounded-3xl shadow-md p-8">
          <div className="mb-8 border-l-4 border-red-600 pl-4">
            <h3 className="text-2xl font-bold text-gray-900">Add New Service</h3>
            <p className="text-gray-600">Fill the details below to add a new service.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: "Select City",
                type: "select",
                value: selectedCity,
                onChange: (e) => setSelectedCity(e.target.value),
                options: cities,
                error: errors.selectedCity,
              },
              {
                label: "Service Name",
                type: "text",
                value: serviceName,
                onChange: (e) =>setServiceName(e.target.value),
                error: errors.serviceName,
              },
              {
                label: "Price (₹)",
                type: "number",
                value: servicePrice,
                onChange: (e) => setServicePrice(e.target.value),
                error: errors.servicePrice,
              },
              {
                label: "Description",
                type: "text",
                value: serviceDescription,
                onChange: (e) => setServiceDescription(e.target.value),
                error: errors.serviceDescription,
              },
            ].map((field, idx) => (
              <div key={idx} className="flex flex-col">
                <label className="text-gray-700 font-medium mb-2">{field.label}</label>

                {field.type === "select" ? (
                  <select
                    value={field.value}
                    onChange={field.onChange}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select</option>
                    {field.options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={`Enter ${field.label}`}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-red-500"
                  />
                )}
                {field.error && <p className="text-red-500 text-sm mt-1">{field.error}</p>}
              </div>
            ))}
          </div>

          <div className="mt-8 text-right">
            <button
              onClick={addService}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow"
            >
              + Add Service
            </button>
          </div>
        </section>

        {/* 🟥 Add Sub-Service – Block Card UI */}
        <section className="bg-white border border-gray-200 rounded-3xl shadow-md p-8">
          {/* Header */}
          <div className="mb-8 border-l-4 border-red-600 pl-4">
            <h3 className="text-2xl font-bold text-gray-900">Add Sub-Service</h3>
            <p className="text-gray-600">Fill the details below to create a sub-service.</p>
          </div>

          {/* Form Grid */}
          <div className="flex gap-6 overflow-x-auto pb-4">

            {/* Select Service */}
            <div className="flex flex-col min-w-[250px]">
              <label className="text-gray-700 font-medium mb-2">Select Service (with City)</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="p-3 rounded-xl bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-red-500"
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
              {errors.selectedService && <p className="text-red-500 text-sm mt-1">{errors.selectedService}</p>}
            </div>

            {/* Sub-Service Name */}
            <div className="flex flex-col min-w-[250px]">
              <label className="text-gray-700 font-medium mb-2">Sub-Service Name</label>
              <input
                type="text"
                value={subServiceName}
                onChange={(e) => setSubServiceName(e.target.value)}
                placeholder="Enter Sub-Service Name"
                className="p-3 rounded-xl bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-red-500"
              />
              {errors.subServiceName && <p className="text-red-500 text-sm mt-1">{errors.subServiceName}</p>}
            </div>

            {/* Price */}
            <div className="flex flex-col min-w-[200px]">
              <label className="text-gray-700 font-medium mb-2">Price (₹)</label>
              <input
                type="number"
                value={subServicePrice}
                onChange={(e) => setSubServicePrice(e.target.value)}
                placeholder="Enter Price"
                className="p-3 rounded-xl bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-red-500"
              />
              {errors.subServicePrice && <p className="text-red-500 text-sm mt-1">{errors.subServicePrice}</p>}
            </div>

            {/* Description */}
            <div className="flex flex-col min-w-[350px]">
              <label className="text-gray-700 font-medium mb-2">Description</label>
              <input
                type="text"
                value={subServiceDescription}
                onChange={(e) => setSubServiceDescription(e.target.value)}
                placeholder="Enter Description"
                className="p-3 rounded-xl bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-red-500"
              />
              {errors.subServiceDescription && <p className="text-red-500 text-sm mt-1">{errors.subServiceDescription}</p>}
            </div>

          </div>


          {/* 📝 Questions Section */}
          <div className="mt-12 bg-white border border-gray-200 rounded-3xl p-8 shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-2xl font-bold text-gray-900">Questions</h4>
                <p className="text-gray-600 text-sm">Add custom questions for users to answer.</p>
              </div>

              <button
                type="button"
                onClick={() => openQuestionModal()}
                className="border border-red-600 text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                + Add Question
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.length === 0 ? (
                <p className="text-gray-500 text-center py-6 border border-dashed border-gray-300 rounded-xl">
                  No questions added yet.
                </p>
              ) : (
                questions.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm"
                  >
                    <div>
                      <p className="text-gray-900 font-medium">{q.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {q.type === "multiple" ? "Multiple Choice" : "Text Answer"}
                      </p>
                    </div>

                    {/* Edit + Remove Buttons */}
                    <div className="flex items-center gap-3">
                      {/* EDIT BUTTON */}
                      <button
                        onClick={() => openQuestionModal(i)}
                        className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-all"
                      >
                        Edit
                      </button>

                      {/* REMOVE BUTTON */}
                      <button
                        onClick={() => {
                          const updated = questions.filter((_, idx) => idx !== i);
                          setQuestions(updated);
                        }}
                        className="border border-red-600 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-600 hover:text-white transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="text-right mt-10">
            <button
              onClick={addSubService}
              className="px-10 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow"
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
              onClick={() => {
                setShowQuestionModal(false);
                setEditingIndex(null);
                setEditData(null);
                setNewQuestion("");
                setQuestionType("text");
                setOptions([{ option: "", price: "" }]);
                setErrors(prev => ({ ...prev, question: "", options: "" }));
              }}
              className="absolute top-4 right-4 text-gray-600 hover:text-black"
            >
              <X />
            </button>

            <h3 className="text-2xl font-bold mb-4">
              {editingIndex !== null ? "Edit Question" : "Add Question"}
            </h3>

            {/* Question Text */}
            <input
              type="text"
              placeholder="Enter question text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-red-500 outline-none"
            />
            {errors.question && <p className="text-red-500 text-sm mb-4">{errors.question}</p>}

            {/* Question Type */}
            <label className="block mb-2 text-sm font-semibold">Question Type</label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-red-500 outline-none"
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
                      className="w-2/3 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={opt.price}
                      onChange={(e) => handleOptionPriceChange(i, e.target.value)}
                      className="w-1/3 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setOptions([...options, { option: "", price: "" }])}
                  className="text-green-700 text-sm font-semibold mt-1 hover:text-green-800"
                >
                  + Add Option
                </button>
                {errors.options && <p className="text-red-500 text-sm mt-2">{errors.options}</p>}
              </div>
            )}

            <button
              onClick={saveQuestion}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all"
            >
              {editingIndex !== null ? "Update Question" : "Save Question"}
            </button>
          </div>
        </div>
      )}

      {/* 🧾 Service List Table */}
      <section className="px-8 mt-6 mb-10">
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
                      <Eye className="inline-block w-5 h-5 mr-2 text-gray-400" />
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
                            <Eye size={18} />
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-3">DeleteService?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this service? This action cannot be undone.
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
                onClick={handleDeleteFinal}
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