"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SubscriberStats {
  totalSubscribers: number;
  totalInactive: number;
  recentSubscribers: number;
}

export default function EmailCampaignPage() {
  const [admin, setAdmin] = useState<any>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<SubscriberStats | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      router.push('/login');
      return;
    }
    
    try {
      const parsedAdmin = JSON.parse(adminData);
      setAdmin(parsedAdmin);
    } catch (error) {
      console.error('Error parsing admin data:', error);
      router.push('/login');
      return;
    }

    fetchSubscriberStats();
  }, [router]);

  const fetchSubscriberStats = async () => {
    try {
      const response = await fetch("/api/email/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch subscriber stats:", error);
    }
  };

  const handleSendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      setNotification({
        type: "error",
        message: "Please fill in both subject and message fields",
      });
      return;
    }

    setIsLoading(true);
    setNotification({
      type: "info",
      message: "Sending email to all subscribers...",
    });

    try {
      const response = await fetch("/api/email/send-campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          message,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setNotification({
          type: "success",
          message: `Email campaign sent successfully to ${result.sentCount} subscribers! Check the campaign history to view details.`,
        });
        setSubject("");
        setMessage("");
        fetchSubscriberStats(); // Refresh stats after sending
      } else {
        setNotification({
          type: "error",
          message: result.error || "Failed to send email",
        });
      }
    } catch (error) {
      setNotification({
        type: "error",
        message: "Network error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  const navigateToAdmin = () => {
    router.push('/admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    router.push('/home');
  };

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={navigateToAdmin}
                className="mr-4 text-green-600 hover:text-green-700"
              >
                ← Back to Admin Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Email Campaign</h1>
                <p className="text-gray-600">Send emails to all subscribed users</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/campaign-history')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View History
              </button>
              <span className="text-sm text-gray-600">Welcome, {admin.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Subscriber Stats */}
          {stats && (
            <div className="mb-6 flex gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-4">
                <div className="text-2xl font-bold text-green-800">{stats.totalSubscribers}</div>
                <div className="text-green-600 text-sm">Active Subscribers</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-4">
                <div className="text-2xl font-bold text-blue-800">{stats.recentSubscribers}</div>
                <div className="text-blue-600 text-sm">New This Month</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-6 py-4">
                <div className="text-2xl font-bold text-gray-800">{stats.totalInactive}</div>
                <div className="text-gray-600 text-sm">Inactive Subscribers</div>
              </div>
            </div>
          )}

          {/* Notification */}
          {notification && (
            <div
              className={`mb-6 p-4 rounded-lg border-l-4 flex justify-between items-center ${
                notification.type === "success"
                  ? "bg-green-50 border-green-400 text-green-700"
                  : notification.type === "error"
                  ? "bg-red-50 border-red-400 text-red-700"
                  : "bg-blue-50 border-blue-400 text-blue-700"
              }`}
            >
              <span>{notification.message}</span>
              <button
                onClick={dismissNotification}
                className="text-current hover:opacity-70"
              >
                ✕
              </button>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Subject Field */}
            <div className="mb-6">
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Subject *
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject (e.g., '🌾 Special Summer Offers from AgriLink!')"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={isLoading}
              />
            </div>

            {/* Message Field */}
            <div className="mb-6">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Message *
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here. You can include information about new services, special offers, platform updates, etc."
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
                disabled={isLoading}
              />
            </div>

            {/* Preview Section */}
            {(subject || message) && (
              <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
                <div className="bg-white p-4 rounded border">
                  <div className="font-semibold text-gray-900 mb-2">
                    Subject: {subject || "(No subject)"}
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {message || "(No message)"}
                  </div>
                </div>
              </div>
            )}

            {/* Send Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSendEmail}
                disabled={isLoading || !subject.trim() || !message.trim()}
                className={`px-6 py-3 rounded-md font-medium text-white transition-colors ${
                  isLoading || !subject.trim() || !message.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 active:bg-green-800"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send Email to All Subscribers"
                )}
              </button>
            </div>
          </div>

          {/* Information Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              📧 Email Campaign Information
            </h3>
            <ul className="text-blue-800 space-y-1">
              <li>• Emails will be sent to all active subscribers</li>
              <li>• Messages are sent in batches to ensure delivery</li>
              <li>• Subscribers can unsubscribe using the link in the email</li>
              <li>• Please ensure your message follows platform guidelines</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
