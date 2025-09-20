"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalCustomers: number;
  totalSMS: number;
  smsToday: number;
  recentAlerts: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalSMS: 0,
    smsToday: 0,
    recentAlerts: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch customer count
      const customerResponse = await fetch('/api/customers/count');
      const customerData = await customerResponse.json();

      // Fetch SMS stats
      const smsResponse = await fetch('/api/send-sms/stats');
      const smsData = await smsResponse.json();

      setStats({
        totalCustomers: customerData.count || 0,
        totalSMS: smsData.totalSMS || 0,
        smsToday: smsData.smsToday || 0,
        recentAlerts: smsData.recentAlerts || 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Send SMS",
      description: "Send price updates to customers",
      href: "/send-sms",
      icon: "📱",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "View Users",
      description: "Manage customer database",
      href: "/users",
      icon: "👥",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Price Alerts",
      description: "Monitor and send alerts",
      href: "/alerts",
      icon: "🚨",
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "Settings",
      description: "Configure system settings",
      href: "/settings",
      icon: "⚙️",
      color: "bg-purple-500 hover:bg-purple-600"
    }
  ];

  // Color palette from attached image
  const cardColors = [
    'bg-[#edd7c3]', // light beige
    'bg-[#6a6ba7]', // muted blue
    'bg-[#d3cfe0]', // pale lavender
    'bg-[#a07b9c]', // muted mauve
    'bg-[#d8b5bc]'  // soft pink
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome to AgriLink Admin Panel</p>
        </div>

        {/* Stats Cards with custom colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-lg shadow p-6 ${cardColors[0]}`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : stats.totalCustomers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg shadow p-6 ${cardColors[1]}`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <span className="text-2xl">📱</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total SMS Sent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : stats.totalSMS.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg shadow p-6 ${cardColors[2]}`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">SMS Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : stats.smsToday}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg shadow p-6 ${cardColors[3]}`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <span className="text-2xl">🚨</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : stats.recentAlerts}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`block p-6 rounded-lg shadow-lg text-white transition-transform hover:scale-105 ${action.color}`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{action.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-lg">📱</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">SMS Campaign Sent</p>
                <p className="text-sm text-gray-600">Price update sent to 250 customers</p>
              </div>
              <div className="text-sm text-gray-500">2 hours ago</div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-lg">👤</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">New Customer Registered</p>
                <p className="text-sm text-gray-600">Customer from Colombo joined the platform</p>
              </div>
              <div className="text-sm text-gray-500">4 hours ago</div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-lg">🚨</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Price Alert Triggered</p>
                <p className="text-sm text-gray-600">Rice prices increased by 8%</p>
              </div>
              <div className="text-sm text-gray-500">1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
