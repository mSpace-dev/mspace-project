'use client';

import { useState } from 'react';

export default function TestSubscriber() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          preferences: {
            priceAlerts: true,
            weeklyDigest: true,
            marketNews: true,
            forecastUpdates: true,
          },
        }),
      });

      if (response.ok) {
        setMessage('✅ Successfully subscribed!');
        setEmail('');
      } else {
        const error = await response.json();
        setMessage(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      setMessage('❌ Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Add Test Subscriber</h1>
        
        <form onSubmit={handleSubscribe} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="test@example.com"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 rounded-md bg-gray-100 text-sm">
            {message}
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Purpose:</strong> This page helps you add test subscribers to test the email campaign feature.</p>
          <p className="mt-2"><strong>After subscribing:</strong> Go to <code>/admin</code> and try the email campaign.</p>
        </div>
      </div>
    </div>
  );
}
