"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", formData.email)
      .eq("password", formData.password)
      .single();

    if (error || !data) setMessage("❌ Invalid login credentials");
    else setMessage("✅ Login successful!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <input type="email" name="email" placeholder="Email" onChange={handleChange} className="border p-2 w-full mb-2" required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} className="border p-2 w-full mb-4" required />

        <button type="submit" className="bg-green-600 text-white w-full py-2 rounded">Login</button>

        <p className="text-sm mt-2 text-center">{message}</p>

        <p className="text-sm mt-4 text-center">
          Don’t have an account?{" "}
          <Link href="/register" className="text-blue-600">Register</Link>
        </p>
      </form>
    </div>
  );
}
