"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPricing() {
  const [plans, setPlans] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);

  // Load all plans
  const loadPlans = async () => {
    const { data, error } = await supabase.from("pricing").select("*").order("id", { ascending: false });
    if (error) console.error("Error loading plans:", error);
    else setPlans(data || []);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  // Upload image to Supabase
  const uploadImage = async (file) => {
    if (!file) return null;
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from("pricing-images").upload(fileName, file);
    if (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image!");
      return null;
    }
    const { data: publicUrlData } = supabase.storage.from("pricing-images").getPublicUrl(fileName);
    return publicUrlData?.publicUrl;
  };

  // Add new pricing plan
  const addPlan = async () => {
    if (!title.trim()) return alert("Enter plan title!");

    let imageUrl = null;
    if (imageFile) imageUrl = await uploadImage(imageFile);

    const { error } = await supabase.from("pricing").insert([
      {
        title,
        description,
        price,
        image: imageUrl,
      },
    ]);

    if (error) {
      console.error("Error adding plan:", error);
      alert("Failed to add pricing plan!");
    } else {
      alert("Pricing plan added successfully!");
      setTitle("");
      setDescription("");
      setPrice("");
      setImageFile(null);
      loadPlans();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">
        <span className="text-red-500">Pricing</span> Management
      </h1>

      {/* Add Pricing Form */}
      <div className="bg-gray-900 p-5 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Pricing Plan</h2>
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Plan Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-gray-800 p-2 rounded w-1/4"
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="bg-gray-800 p-2 rounded w-1/4"
          />
          <input
            type="file"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="bg-gray-800 p-2 rounded w-1/4"
          />
          <button
            onClick={addPlan}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
          >
            Add Plan
          </button>
        </div>

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-gray-800 p-2 rounded mt-4 w-full h-24"
        />
      </div>

      {/* Display Pricing Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Pricing Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.length === 0 ? (
            <p className="text-gray-500">No pricing plans added yet.</p>
          ) : (
            plans.map((plan) => (
              <div key={plan.id} className="bg-gray-900 rounded-xl p-4 shadow hover:scale-105 transition">
                {plan.image && (
                  <img
                    src={plan.image}
                    alt={plan.title}
                    className="rounded-lg mb-3 h-40 w-full object-cover"
                  />
                )}
                <h3 className="text-lg font-semibold mb-2">{plan.title}</h3>
                <p className="text-gray-400 mb-2">{plan.description}</p>
                <p className="text-red-400 font-bold">₹ {plan.price}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
