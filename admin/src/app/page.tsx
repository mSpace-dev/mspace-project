"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load stats");
        return res.json();
      })
      .then(setStats)
      .catch(() => setError("Could not load dashboard data."));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white font-sans">
      <main className="flex flex-col gap-8 items-center w-full max-w-2xl">
        <Image
          className="dark:invert mb-4"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        {error && (
          <div className="bg-red-700 text-white p-4 rounded w-full text-center">
            {error}
          </div>
        )}
        {!stats && !error && (
          <div className="text-lg text-green-200 animate-pulse">
            Loading dashboard...
          </div>
        )}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            <div className="bg-green-800 rounded-lg p-6 shadow text-center">
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-green-200">Total Users</div>
            </div>
            <div className="bg-green-800 rounded-lg p-6 shadow text-center">
              <div className="text-2xl font-bold">{stats.smsSentToday}</div>
              <div className="text-green-200">SMS Sent Today</div>
            </div>
            <div className="bg-green-800 rounded-lg p-6 shadow text-center">
              <div className="text-2xl font-bold">{stats.recentAlerts}</div>
              <div className="text-green-200">Recent Alerts</div>
            </div>
            <div className="bg-green-800 rounded-lg p-6 shadow text-center">
              <div className="text-2xl font-bold">{stats.nextSms}</div>
              <div className="text-green-200">Next Scheduled SMS</div>
            </div>
          </div>
        )}
      </main>
      <footer className="mt-12 text-green-300 text-sm">
        &copy; {new Date().getFullYear()} AgriLink Admin Dashboard
      </footer>
    </div>
  );
}
