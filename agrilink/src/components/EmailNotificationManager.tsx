"use client";

import { useState, useEffect } from 'react';

interface SubscriptionStats {
  total: number;
  preferences: {
    priceAlerts: number;
    weeklyDigest: number;
    marketNews: number;
    forecastUpdates: number;
  };
}

interface NotificationData {
  type: string;
  data: any;
  preferences?: any;
}

export default function EmailNotificationManager() {
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Form data for different notification types
  const [priceAlertData, setPriceAlertData] = useState({
    product: '',
    price: '',
    location: '',
    change: ''
  });

  const [marketNewsData, setMarketNewsData] = useState({
    subject: '',
    content: ''
  });

  const [forecastData, setForecastData] = useState({
    forecast: ''
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications?type=stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (notification: NotificationData) => {
    setSending(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Successfully sent notification to ${data.sentCount} subscribers`);
        setMessageType('success');
        // Reset forms
        setPriceAlertData({ product: '', price: '', location: '', change: '' });
        setMarketNewsData({ subject: '', content: '' });
        setForecastData({ forecast: '' });
      } else {
        setMessage(`❌ ${data.error || 'Failed to send notification'}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      setMessage('❌ Network error. Please try again.');
      setMessageType('error');
    } finally {
      setSending(false);
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  };

  const handlePriceAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceAlertData.product || !priceAlertData.price || !priceAlertData.location) {
      setMessage('❌ Please fill in all required fields');
      setMessageType('error');
      return;
    }

    sendNotification({
      type: 'price_alert',
      data: {
        ...priceAlertData,
        price: parseFloat(priceAlertData.price),
        change: priceAlertData.change ? parseFloat(priceAlertData.change) : undefined
      }
    });
  };

  const handleMarketNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketNewsData.subject || !marketNewsData.content) {
      setMessage('❌ Please fill in subject and content');
      setMessageType('error');
      return;
    }

    sendNotification({
      type: 'market_news',
      data: marketNewsData
    });
  };

  const handleForecastUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forecastData.forecast) {
      setMessage('❌ Please enter forecast information');
      setMessageType('error');
      return;
    }

    sendNotification({
      type: 'forecast_update',
      data: forecastData
    });
  };

  const sendWeeklyDigest = () => {
    sendNotification({
      type: 'weekly_digest',
      data: {}
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📧 Email Notification Manager</h2>

      {/* Subscription Stats */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Subscriber Statistics</h3>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Subscribers</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{stats.preferences.priceAlerts}</div>
              <div className="text-sm text-gray-600">Price Alerts</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.preferences.weeklyDigest}</div>
              <div className="text-sm text-gray-600">Weekly Digest</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.preferences.marketNews}</div>
              <div className="text-sm text-gray-600">Market News</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.preferences.forecastUpdates}</div>
              <div className="text-sm text-gray-600">Forecast Updates</div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Failed to load stats</p>
        )}
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={sendWeeklyDigest}
            disabled={sending}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold disabled:bg-gray-400 transition-colors"
          >
            {sending ? 'Sending...' : 'Send Weekly Digest'}
          </button>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Refreshing...' : 'Refresh Stats'}
          </button>
        </div>
      </div>

      {/* Notification Forms */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Price Alert Form */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-4">🔔 Send Price Alert</h4>
          <form onSubmit={handlePriceAlert} className="space-y-3">
            <input
              type="text"
              placeholder="Product name"
              value={priceAlertData.product}
              onChange={(e) => setPriceAlertData({...priceAlertData, product: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price (Rs.)"
              value={priceAlertData.price}
              onChange={(e) => setPriceAlertData({...priceAlertData, price: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Location"
              value={priceAlertData.location}
              onChange={(e) => setPriceAlertData({...priceAlertData, location: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price change % (optional)"
              value={priceAlertData.change}
              onChange={(e) => setPriceAlertData({...priceAlertData, change: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold disabled:bg-gray-400 transition-colors"
            >
              Send Price Alert
            </button>
          </form>
        </div>

        {/* Market News Form */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-4">📰 Send Market News</h4>
          <form onSubmit={handleMarketNews} className="space-y-3">
            <input
              type="text"
              placeholder="News subject"
              value={marketNewsData.subject}
              onChange={(e) => setMarketNewsData({...marketNewsData, subject: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <textarea
              placeholder="News content"
              value={marketNewsData.content}
              onChange={(e) => setMarketNewsData({...marketNewsData, content: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
              required
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold disabled:bg-gray-400 transition-colors"
            >
              Send Market News
            </button>
          </form>
        </div>

        {/* Forecast Update Form */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-4">📈 Send Forecast Update</h4>
          <form onSubmit={handleForecastUpdate} className="space-y-3">
            <textarea
              placeholder="Forecast information"
              value={forecastData.forecast}
              onChange={(e) => setForecastData({...forecastData, forecast: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent h-32 resize-none"
              required
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg font-semibold disabled:bg-gray-400 transition-colors"
            >
              Send Forecast Update
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
