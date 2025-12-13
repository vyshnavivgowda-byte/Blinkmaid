"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/"); // redirect to homepage or change to /login if you want
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-600">
          Email Verified Successfully!
        </h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
