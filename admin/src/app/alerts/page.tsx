"use client";
import { useState, useEffect } from "react";

interface Alert {
  id: string;
  userId: string;
  crop: string;
  priceThreshold: number;
  condition: 'above' | 'below' | 'change';
  district: string;
  phone: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Mock alerts data
  useEffect(() => {
    const mockAlerts: Alert[] = [
      {
        id: 'alert_1',
        userId: 'user_123',
        crop: 'Rice',
        priceThreshold: 90,
        condition: 'above',
        district: 'Colombo',
        phone: '+94771234567',
        email: 'farmer1@example.com',
        isActive: true,
        createdAt: '2025-01-01T10:00:00Z',
        lastTriggered: '2025-01-03T14:30:00Z'
      },
      {
        id: 'alert_2',
        userId: 'user_456',
        crop: 'Coconut',
        priceThreshold: 45,
        condition: 'below',
        district: 'Gampaha',
        phone: '+94701234567',
        isActive: true,
        createdAt: '2025-01-02T09:15:00Z'
      },
      {
        id: 'alert_3',
        userId: 'user_789',
        crop: 'Vegetables',
        priceThreshold: 5,
        condition: 'change',
        district: 'Kandy',
        phone: '+94781234567',
        email: 'farmer3@example.com',
        isActive: false,
        createdAt: '2025-01-01T16:20:00Z',
        lastTriggered: '2025-01-02T11:45:00Z'
      }
    ];
    setAlerts(mockAlerts);
  }, []);

  const handleTriggerAlert = async (alert: Alert) => {
    setIsLoading(true);
    setNotification({
      type: 'info',
      message: `Triggering ${alert.crop} price alert...`
    });

    try {
      // Send SMS alert
      const smsResponse = await fetch('/api/messages/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `🔔 AgriLink Alert: ${alert.crop} price threshold reached! Current market conditions meet your ${alert.condition} Rs.${alert.priceThreshold} criteria in ${alert.district}.`,
          recipient: 'specific',
          phoneNumber: alert.phone
        })
      });

      if (smsResponse.ok) {
        // Update last triggered time
        setAlerts(prev => prev.map(a => 
          a.id === alert.id 
            ? { ...a, lastTriggered: new Date().toISOString() }
            : a
        ));

        setNotification({
          type: 'success',
          message: `Alert sent successfully to ${alert.phone}`
        });
      } else {
        throw new Error('Failed to send SMS alert');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to send alert. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId 
        ? { ...alert, isActive: !alert.isActive }
        : alert
    ));
    
    setNotification({
      type: 'success',
      message: 'Alert status updated successfully'
    });
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Price Alerts Manager
        </h1>
        <p className="text-gray-600">
          Monitor and manually trigger SMS/USSD alerts. Manage user price alert subscriptions.
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-lg border-l-4 flex justify-between items-center ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-400 text-green-700'
              : notification.type === 'error'
              ? 'bg-red-50 border-red-400 text-red-700'
              : 'bg-blue-50 border-blue-400 text-blue-700'
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-800">
            {alerts.filter(a => a.isActive).length}
          </div>
          <div className="text-green-600 text-sm">Active Alerts</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-800">
            {alerts.filter(a => a.lastTriggered).length}
          </div>
          <div className="text-blue-600 text-sm">Recently Triggered</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-800">
            {alerts.filter(a => a.condition === 'above').length}
          </div>
          <div className="text-yellow-600 text-sm">Price Rise Alerts</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-800">
            {alerts.filter(a => a.condition === 'below').length}
          </div>
          <div className="text-purple-600 text-sm">Price Drop Alerts</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/messages?tab=sms&template=price_alert'}
            className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-left"
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">📈</span>
              <span className="font-medium">Send Price Alert</span>
            </div>
            <p className="text-sm text-gray-600">Manually send price alerts to all users</p>
          </button>
          
          <button
            onClick={() => window.location.href = '/messages?tab=sms&template=weather_alert'}
            className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">🌦️</span>
              <span className="font-medium">Weather Alert</span>
            </div>
            <p className="text-sm text-gray-600">Send emergency weather notifications</p>
          </button>
          
          <button
            onClick={() => window.location.href = '/messages?tab=sms&template=market_update'}
            className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">📊</span>
              <span className="font-medium">Market Update</span>
            </div>
            <p className="text-sm text-gray-600">Broadcast market opportunities</p>
          </button>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">User Alert Subscriptions</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User & Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alert Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Triggered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {alert.phone}
                      </div>
                      {alert.email && (
                        <div className="text-sm text-gray-500">{alert.email}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {alert.crop}
                      </div>
                      <div className="text-sm text-gray-500">
                        {alert.condition} Rs.{alert.priceThreshold}
                        {alert.crop === 'Rice' || alert.crop === 'Coconut' ? '/kg' : 
                         alert.crop === 'Vegetables' ? '% change' : ''}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {alert.district}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      alert.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {alert.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {alert.lastTriggered 
                      ? new Date(alert.lastTriggered).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleTriggerAlert(alert)}
                      disabled={isLoading || !alert.isActive}
                      className={`px-3 py-1 rounded text-white ${
                        alert.isActive && !isLoading
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? 'Sending...' : 'Trigger'}
                    </button>
                    <button
                      onClick={() => handleToggleAlert(alert.id)}
                      className={`px-3 py-1 rounded text-white ${
                        alert.isActive 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {alert.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          🔔 Alert Management Guide
        </h3>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• <strong>Trigger:</strong> Manually send alert to user immediately</li>
          <li>• <strong>Enable/Disable:</strong> Control whether alerts are automatically sent</li>
          <li>• <strong>Quick Actions:</strong> Send broadcast alerts to all users</li>
          <li>• <strong>Status:</strong> Green = Active alerts, Gray = Disabled alerts</li>
          <li>• <strong>Integration:</strong> Alerts work with SMS and email messaging systems</li>
        </ul>
      </div>
    </div>
  );
}