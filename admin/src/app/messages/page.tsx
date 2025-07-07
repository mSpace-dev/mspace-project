"use client";
import { useState, useEffect } from "react";

interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  type: 'sms' | 'email' | 'notification' | 'price_alert' | 'market_news';
  category: 'marketing' | 'alerts' | 'updates' | 'emergency';
  createdAt: string;
}

interface MessageStats {
  totalSent: number;
  todaySent: number;
  activeSubscribers: number;
  smsCredits: number;
}

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'templates' | 'history' | 'sms'>('create');
  const [messageType, setMessageType] = useState<'sms' | 'email' | 'notification'>('email');
  const [recipient, setRecipient] = useState<'all' | 'subscribers' | 'specific'>('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchStats();
    fetchTemplates();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/messages/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/messages/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setNotification({
        type: 'error',
        message: 'Message content is required'
      });
      return;
    }

    if (messageType === 'email' && !subject.trim()) {
      setNotification({
        type: 'error',
        message: 'Email subject is required'
      });
      return;
    }

    if (messageType === 'sms' && recipient === 'specific' && !phoneNumber.trim()) {
      setNotification({
        type: 'error',
        message: 'Phone number is required for specific SMS'
      });
      return;
    }

    setIsLoading(true);
    setNotification({
      type: 'info',
      message: `Sending ${messageType} message...`
    });

    try {
      const endpoint = messageType === 'sms' ? '/api/messages/send-sms' : '/api/messages/send-email';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: messageType === 'email' ? subject : undefined,
          message,
          recipient,
          phoneNumber: recipient === 'specific' ? phoneNumber : undefined,
          messageType
        })
      });

      const result = await response.json();

      if (response.ok) {
        setNotification({
          type: 'success',
          message: result.message || `${messageType.toUpperCase()} sent successfully!`
        });
        setSubject('');
        setMessage('');
        setPhoneNumber('');
        fetchStats(); // Refresh stats
      } else {
        setNotification({
          type: 'error',
          message: result.error || `Failed to send ${messageType}`
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Network error. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!subject.trim() || !message.trim()) {
      setNotification({
        type: 'error',
        message: 'Subject and message are required for templates'
      });
      return;
    }

    try {
      const response = await fetch('/api/messages/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: subject,
          content: message,
          type: messageType,
          category: 'marketing'
        })
      });

      if (response.ok) {
        setNotification({
          type: 'success',
          message: 'Template saved successfully!'
        });
        fetchTemplates();
      } else {
        setNotification({
          type: 'error',
          message: 'Failed to save template'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Network error. Please try again.'
      });
    }
  };

  const loadTemplate = (template: MessageTemplate) => {
    setSubject(template.title);
    setMessage(template.content);
    setMessageType(template.type as 'sms' | 'email' | 'notification');
    setActiveTab('create');
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  const TabButton = ({ tabKey, label, isActive, onClick }: {
    tabKey: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
        isActive
          ? 'bg-white text-green-600 border-b-2 border-green-600'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Message Center
        </h1>
        <p className="text-gray-600">
          Send SMS, emails, and notifications to users. Manage message templates and view sending history.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-800">{stats.totalSent}</div>
            <div className="text-green-600 text-sm">Total Messages Sent</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-800">{stats.todaySent}</div>
            <div className="text-blue-600 text-sm">Sent Today</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-800">{stats.activeSubscribers}</div>
            <div className="text-purple-600 text-sm">Active Subscribers</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-800">{stats.smsCredits}</div>
            <div className="text-orange-600 text-sm">SMS Credits Left</div>
          </div>
        </div>
      )}

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

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-1">
          <TabButton
            tabKey="create"
            label="📝 Create Message"
            isActive={activeTab === 'create'}
            onClick={() => setActiveTab('create')}
          />
          <TabButton
            tabKey="sms"
            label="📱 Quick SMS"
            isActive={activeTab === 'sms'}
            onClick={() => setActiveTab('sms')}
          />
          <TabButton
            tabKey="templates"
            label="📋 Templates"
            isActive={activeTab === 'templates'}
            onClick={() => setActiveTab('templates')}
          />
          <TabButton
            tabKey="history"
            label="📊 History"
            isActive={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
          />
        </div>
      </div>

      {/* Create Message Tab */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Message</h2>
          
          {/* Message Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="messageType"
                  value="email"
                  checked={messageType === 'email'}
                  onChange={(e) => setMessageType(e.target.value as any)}
                  className="mr-2"
                />
                📧 Email
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="messageType"
                  value="sms"
                  checked={messageType === 'sms'}
                  onChange={(e) => setMessageType(e.target.value as any)}
                  className="mr-2"
                />
                📱 SMS
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="messageType"
                  value="notification"
                  checked={messageType === 'notification'}
                  onChange={(e) => setMessageType(e.target.value as any)}
                  className="mr-2"
                />
                🔔 Push Notification
              </label>
            </div>
          </div>

          {/* Recipient Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipients
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="recipient"
                  value="all"
                  checked={recipient === 'all'}
                  onChange={(e) => setRecipient(e.target.value as any)}
                  className="mr-2"
                />
                👥 All Users
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="recipient"
                  value="subscribers"
                  checked={recipient === 'subscribers'}
                  onChange={(e) => setRecipient(e.target.value as any)}
                  className="mr-2"
                />
                ✉️ Subscribers Only
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="recipient"
                  value="specific"
                  checked={recipient === 'specific'}
                  onChange={(e) => setRecipient(e.target.value as any)}
                  className="mr-2"
                />
                🎯 Specific Contact
              </label>
            </div>
          </div>

          {/* Phone Number for specific SMS */}
          {messageType === 'sms' && recipient === 'specific' && (
            <div className="mb-6">
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+94771234567"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={isLoading}
              />
            </div>
          )}

          {/* Subject Field (for emails) */}
          {messageType === 'email' && (
            <div className="mb-6">
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter message subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={isLoading}
              />
            </div>
          )}

          {/* Message Content */}
          <div className="mb-6">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Message Content *
              {messageType === 'sms' && (
                <span className="text-gray-500 text-xs ml-2">
                  ({message.length}/160 characters)
                </span>
              )}
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                messageType === 'sms'
                  ? 'Enter SMS message (max 160 characters)'
                  : 'Enter your message content'
              }
              rows={messageType === 'sms' ? 4 : 8}
              maxLength={messageType === 'sms' ? 160 : undefined}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
              disabled={isLoading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              className={`px-6 py-3 rounded-md font-medium text-white transition-colors ${
                isLoading || !message.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isLoading ? 'Sending...' : `Send ${messageType.toUpperCase()}`}
            </button>
            <button
              onClick={handleSaveTemplate}
              disabled={isLoading || !subject.trim() || !message.trim()}
              className="px-6 py-3 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Save as Template
            </button>
          </div>
        </div>
      )}

      {/* Quick SMS Tab */}
      {activeTab === 'sms' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick SMS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick SMS Buttons */}
            <div>
              <h3 className="text-lg font-medium mb-3">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setMessage('🔔 Price Alert: Rice price has increased to Rs.95/kg in Colombo market. Check app for details.');
                    setActiveTab('create');
                    setMessageType('sms');
                  }}
                  className="w-full text-left p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <div className="font-medium">📈 Price Alert Template</div>
                  <div className="text-sm text-gray-600">Quick price change notification</div>
                </button>
                <button
                  onClick={() => {
                    setMessage('🌧️ Weather Alert: Heavy rainfall expected in your area. Secure your crops and harvest if ready.');
                    setActiveTab('create');
                    setMessageType('sms');
                  }}
                  className="w-full text-left p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="font-medium">🌦️ Weather Alert Template</div>
                  <div className="text-sm text-gray-600">Emergency weather notification</div>
                </button>
                <button
                  onClick={() => {
                    setMessage('🛒 Market Update: High demand for coconuts this week. Best prices at Pettah and Gampaha markets.');
                    setActiveTab('create');
                    setMessageType('sms');
                  }}
                  className="w-full text-left p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="font-medium">📊 Market Update Template</div>
                  <div className="text-sm text-gray-600">Market opportunity notification</div>
                </button>
              </div>
            </div>

            {/* SMS Guidelines */}
            <div>
              <h3 className="text-lg font-medium mb-3">SMS Guidelines</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Keep messages under 160 characters</li>
                  <li>• Use clear, simple language</li>
                  <li>• Include relevant emojis for visibility</li>
                  <li>• Add time-sensitive information first</li>
                  <li>• Include "AgriLink" identifier</li>
                  <li>• Provide unsubscribe option for marketing</li>
                </ul>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-xs font-medium text-blue-800">SMS Credits: {stats?.smsCredits || 0}</div>
                  <div className="text-xs text-blue-600">Contact admin to top up credits</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Message Templates</h2>
          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No templates saved yet. Create a message and save it as a template.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{template.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      template.type === 'sms' ? 'bg-blue-100 text-blue-800' :
                      template.type === 'email' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {template.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {template.content}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => loadTemplate(template)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Message History</h2>
          <div className="text-center py-8 text-gray-500">
            Message history feature coming soon...
            <br />
            <span className="text-sm">Track sent messages, delivery status, and analytics</span>
          </div>
        </div>
      )}
    </div>
  );
}
