'use client';

import { useState, useEffect } from 'react';

interface NewsletterMessage {
  _id: string;
  title: string;
  content: string;
  messageType: 'service_announcement' | 'platform_notice' | 'feature_update' | 'market_insight' | 'special_offer';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  emailSubject: string;
  isActive: boolean;
  createdAt: string;
}

interface NotificationData {
  _id: string;
  email: string;
  subject: string;
  content: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  createdAt: string;
}

export default function EmailNotificationManager() {
  const [activeTab, setActiveTab] = useState<'notifications' | 'newsletters'>('notifications');
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [newsletters, setNewsletters] = useState<NewsletterMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (error) {
      setError('Error fetching notifications');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch newsletters
  const fetchNewsletters = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/newsletter-messages');
      if (response.ok) {
        const data = await response.json();
        setNewsletters(data.messages || []);
      } else {
        setError('Failed to fetch newsletters');
      }
    } catch (error) {
      setError('Error fetching newsletters');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Seed dummy newsletters
  const seedNewsletters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/newsletter-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'seed' }),
      });

      if (response.ok) {
        setSuccess('Dummy newsletters seeded successfully!');
        await fetchNewsletters();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to seed newsletters');
      }
    } catch (error) {
      setError('Error seeding newsletters');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send newsletter to all subscribers
  const sendNewsletter = async (messageId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Newsletter sent successfully! Sent to ${data.sentCount} subscribers.`);
      } else {
        setError(data.error || 'Failed to send newsletter');
      }
    } catch (error) {
      setError('Error sending newsletter');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotifications();
    } else {
      fetchNewsletters();
    }
  }, [activeTab]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Email Management Dashboard</h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('newsletters')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'newsletters'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Newsletters
          </button>
        </nav>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mb-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Email Notifications</h2>
            <button
              onClick={fetchNotifications}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No notifications found
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <li key={notification._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.email}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {notification.subject}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          notification.status === 'sent' 
                            ? 'bg-green-100 text-green-800'
                            : notification.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {notification.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Newsletters Tab */}
      {activeTab === 'newsletters' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Newsletter Management</h2>
            <div className="flex space-x-3">
              <button
                onClick={seedNewsletters}
                disabled={isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                Seed Dummy Newsletters
              </button>
              <button
                onClick={fetchNewsletters}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
          </div>

          {newsletters.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No newsletters found</p>
              <p className="text-sm mt-2">Click "Seed Dummy Newsletters" to create sample newsletters</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {newsletters.map((newsletter) => (
                <div key={newsletter._id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {newsletter.title}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mb-3 ${
                        newsletter.messageType === 'service_announcement'
                          ? 'bg-red-100 text-red-800'
                          : newsletter.messageType === 'feature_update'
                          ? 'bg-blue-100 text-blue-800'
                          : newsletter.messageType === 'special_offer'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {newsletter.messageType.replace('_', ' ')}
                      </span>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {newsletter.content}
                      </p>
                      <p className="text-xs text-gray-400">
                        Created: {new Date(newsletter.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => sendNewsletter(newsletter._id)}
                        disabled={isLoading}
                        className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
                      >
                        Send to All Subscribers
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
