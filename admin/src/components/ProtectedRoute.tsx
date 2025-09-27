"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminAccessToken");
    if (!token) {
      router.replace("/"); // Redirect to home/login
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("adminRefreshToken");
    router.replace("/");
  };

  return (
    <div className="relative">
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700 transition-colors"
      >
        Logout
      </button>
      {children}
    </div>
  );
}
