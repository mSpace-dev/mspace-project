"use client";
import { useEffect, useState } from "react";

interface SMSAlert {
  _id: string;
  userId: string;
  userName: string;
  phone: string;
  message: string;
  sentAt: string;
}

interface Insights {
  totalSMS: number;
  totalUsers: number;
  topSenders: { userName: string; sentCount: number }[];
  busiestDay: string;
}

export default function SMSAlertsPage() {
  const [alerts, setAlerts] = useState<SMSAlert[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlertsAndInsights();
  }, []);

  const fetchAlertsAndInsights = async () => {
    setIsLoading(true);
    try {
      // Fetch SMS alerts
      const alertsRes = await fetch("/api/sms-alerts");
      const alertsData = await alertsRes.json();
      setAlerts(alertsData.alerts || []);
      // Fetch business insights
      const insightsRes = await fetch("/api/business-insights");
      const insightsData = await insightsRes.json();
      setInsights(insightsData);
    } catch {
      setAlerts([]);
      setInsights(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">SMS Alerts & Business Insights</h1>
        {/* Insights Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-lg font-semibold text-gray-700 mb-2">Total SMS Sent</div>
            <div className="text-3xl font-bold text-blue-700">{insights?.totalSMS ?? '-'}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-lg font-semibold text-gray-700 mb-2">Total Users</div>
            <div className="text-3xl font-bold text-green-700">{insights?.totalUsers ?? '-'}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-lg font-semibold text-gray-700 mb-2">Busiest Day</div>
            <div className="text-2xl font-bold text-orange-700">{insights?.busiestDay ?? '-'}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-lg font-semibold text-gray-700 mb-2">Top Senders</div>
            <ul className="text-sm text-gray-800">
              {insights?.topSenders?.length ? (
                insights.topSenders.map(s => (
                  <li key={s.userName}>{s.userName}: <span className="font-bold">{s.sentCount}</span></li>
                ))
              ) : <li>-</li>}
            </ul>
          </div>
        </div>
        {/* Alerts Table */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All SMS Alerts</h2>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : alerts.length === 0 ? (
            <p className="text-gray-500">No SMS alerts found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-700 font-semibold">User</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-semibold">Phone</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-semibold">Message</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-semibold">Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map(alert => (
                    <tr key={alert._id} className="border-b">
                      <td className="px-4 py-2 text-gray-900 font-bold">{alert.userName}</td>
                      <td className="px-4 py-2 text-gray-700">{alert.phone}</td>
                      <td className="px-4 py-2 text-gray-800">{alert.message}</td>
                      <td className="px-4 py-2 text-gray-600">{new Date(alert.sentAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
