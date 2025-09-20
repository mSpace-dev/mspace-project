"use client";
import { useState, useEffect } from 'react';

interface SMSLog {
  _id: string;
  phone: string;
  message: string;
  status: 'sent' | 'failed';
  sentAt: string;
  category?: string;
  error?: string;
}

export default function SendSMSPage() {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('all');
  const [customRecipients, setCustomRecipients] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  // Price templates
  const priceTemplates = [
    "🚜 AgriLink Price Update: Rice prices have increased by 5% this week. Check our app for details!",
    "🌾 AgriLink Alert: Vegetable prices are stable. Best time to buy fresh produce!",
    "🥕 AgriLink Price Info: Coconut prices have dropped 10%. Great opportunity for buyers!",
    "🍅 AgriLink Update: Tomato prices are high due to demand. Plan your purchases accordingly."
  ];

  useEffect(() => {
    if (showLogs) {
      fetchLogs();
    }
  }, [showLogs]);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/send-sms');
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const payload: any = {
        message,
        category: category === 'custom' ? null : category
      };

      if (category === 'custom' && customRecipients) {
        payload.recipients = customRecipients.split(',').map((phone: string) => phone.trim());
      }

      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        setMessage('');
        setCustomRecipients('');
        fetchLogs(); // Refresh logs
      }
    } catch (error) {
      setResult({ error: 'Failed to send SMS. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const insertTemplate = (template: string) => {
    setMessage(template);
  };

  // Dashboard color palette
  const cardColors = [
    'bg-[#edd7c3]', // light beige
    'bg-[#6a6ba7]', // muted blue
    'bg-[#d3cfe0]', // pale lavender
    'bg-[#a07b9c]', // muted mauve
    'bg-[#d8b5bc]'  // soft pink
  ];

  return (
    <div className={`min-h-screen ${cardColors[2]} p-6`}>
      <div className="max-w-4xl mx-auto">
        <div className={`rounded-xl shadow-lg p-8 ${cardColors[0]}`}> {/* Main card */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              📱 Send SMS to Customers
            </h1>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className={`px-4 py-2 ${cardColors[1]} text-white rounded-lg hover:bg-[#a07b9c] transition-colors`}
            >
              {showLogs ? 'Hide Logs' : 'View Logs'}
            </button>
          </div>

          <form onSubmit={handleSendSMS} className="space-y-6">
            {/* Recipient Selection */}
            <div className={`p-6 rounded-lg ${cardColors[4]}`}> {/* soft pink */}
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📞 Select Recipients</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}

                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6a6ba7] focus:border-transparent"

                  >
                    <option value="all">All Customers</option>
                    <option value="farmers">Farmers Only</option>
                    <option value="buyers">Buyers Only</option>
                    <option value="premium">Premium Members</option>
                    <option value="custom">Custom Recipients</option>
                  </select>
                </div>

                {category === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Numbers (comma-separated)
                    </label>
                    <textarea
                      value={customRecipients}
                      onChange={(e) => setCustomRecipients(e.target.value)}
                      placeholder="0771234567, 0779876543, 0712345678"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6a6ba7] focus:border-transparent"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Message Templates */}
            <div className={`p-6 rounded-lg ${cardColors[2]}`}> {/* pale lavender */}
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Quick Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {priceTemplates.map((template, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => insertTemplate(template)}

                    className={`text-left p-3 bg-white border border-gray-200 rounded-lg hover:${cardColors[3]} hover:border-[#a07b9c] transition-colors text-sm text-gray-800`}

                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Composition */}
            <div className={`p-6 rounded-lg ${cardColors[3]}`}> {/* muted mauve */}
              <h3 className="text-lg font-semibold text-gray-800 mb-4">✍️ Compose Message</h3>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your SMS message here..."

                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6a6ba7] focus:border-transparent"

                rows={6}
                maxLength={160}
                required
              />
              <div className="text-sm text-gray-500 mt-2">
                {message.length}/160 characters
              </div>
            </div>

            {/* Send Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className={`px-8 py-4 ${cardColors[1]} text-white text-lg font-semibold rounded-lg hover:bg-[#a07b9c] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>📤 Send SMS</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Result Display */}
          {result && (
            <div className={`mt-6 p-6 rounded-lg ${result.success ? cardColors[4] + ' border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h4 className={`text-lg font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? '✅ SMS Sent Successfully!' : '❌ Error Sending SMS'}
              </h4>
              <p className={`mt-2 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.message || result.error}
              </p>
              {result.results && (
                <div className="mt-4">
                  <h5 className="font-medium text-gray-700">Detailed Results:</h5>
                  <div className="mt-2 space-y-1">
                    {result.results.slice(0, 5).map((r: any, index: number) => (
                      <div key={index} className="text-sm text-gray-600">
                        {r.phone}: {r.status} {r.error && `(${r.error})`}
                      </div>
                    ))}
                    {result.results.length > 5 && (
                      <div className="text-sm text-gray-500">
                        ... and {result.results.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SMS Logs */}
          {showLogs && (
            <div className={`mt-8 p-6 rounded-lg ${cardColors[2]}`}> {/* pale lavender */}
              <h3 className="text-xl font-semibold text-gray-800 mb-4">📋 Recent SMS Logs</h3>
              {logs.length === 0 ? (
                <p className="text-gray-500">No SMS logs found.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log._id} className="bg-white p-4 rounded-lg border">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{log.phone}</p>
                          <p className="text-sm text-gray-800 mt-1">{log.message}</p>
                          <p className="text-xs text-gray-700 mt-2">
                            {new Date(log.sentAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            log.status === 'sent'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status}
                          </span>
                          {log.category && (
                            <p className="text-xs text-gray-700 mt-1">{log.category}</p>
                          )}
                          {log.error && (
                            <p className="text-xs text-red-600 mt-1">{log.error}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
