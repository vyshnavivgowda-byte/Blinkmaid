"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    location: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.from("users").insert([formData]);

    if (error) setMessage("❌ " + error.message);
    else setMessage("✅ Registration successful!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} className="border p-2 w-full mb-2" required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} className="border p-2 w-full mb-2" required />
        <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} className="border p-2 w-full mb-2" />
        <input type="text" name="address" placeholder="Address" onChange={handleChange} className="border p-2 w-full mb-2" />
        <input type="text" name="location" placeholder="Location" onChange={handleChange} className="border p-2 w-full mb-2" />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} className="border p-2 w-full mb-4" required />

        <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded">Register</button>

        <p className="text-sm mt-2 text-center">{message}</p>

        <p className="text-sm mt-4 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600">Login</Link>
        </p>
      </form>
    </div>
  );
}
