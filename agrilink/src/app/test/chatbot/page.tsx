'use client';

import { useState } from 'react';
import ChatbotWidget from '@/components/ChatbotWidget';

export default function ChatbotTestPage() {
  const [userInfo, setUserInfo] = useState({
    userId: 'test_user_123',
    userPhone: '+94771234567'
  });

  const testQuestions = [
    "What services does AgriLink offer?",
    "What is the current rice price?",
    "Rice price in Colombo",
    "Tell me about demand forecasting",
    "How do price alerts work?",
    "Show me vegetable prices",
    "What is AgriLink market connection?",
    "Brinjal prices in Kandy",
    "Help me understand forecasting"
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🤖 Enhanced AgriLink Chatbot Test
          </h1>
          <p className="text-gray-600 mb-6">
            Test the enhanced chatbot with service information, database price queries, and intelligent responses.
            The chatbot widget is positioned in the bottom-right corner.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* User Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Test User Information</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID:</label>
                  <input
                    type="text"
                    value={userInfo.userId}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, userId: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone:</label>
                  <input
                    type="text"
                    value={userInfo.userPhone}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, userPhone: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Test Questions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Try These Test Questions</h3>
              <div className="space-y-1">
                {testQuestions.map((question, index) => (
                  <div key={index} className="text-sm text-gray-600 bg-white p-2 rounded border">
                    "{question}"
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Enhanced Chatbot Features</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">🌾 Service Information</h3>
              <p className="text-green-700 text-sm">
                Comprehensive information about AgriLink services including price alerts, 
                demand forecasting, market connections, and seller platforms.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">💰 Database Price Queries</h3>
              <p className="text-blue-700 text-sm">
                Real-time crop price data from the AgriLink database with location-based 
                filtering and product availability information.
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">🔍 Intelligent Search</h3>
              <p className="text-purple-700 text-sm">
                AI-powered responses using Google's Gemini model with context-aware 
                understanding and fallback web search capabilities.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">🚀 How to Test</h3>
            <ol className="text-yellow-700 text-sm space-y-1">
              <li>1. Click the chatbot icon in the bottom-right corner</li>
              <li>2. Try asking about AgriLink services or crop prices</li>
              <li>3. Test location-specific queries like "Rice price in Colombo"</li>
              <li>4. Ask about specific crops from the Sri Lankan database</li>
              <li>5. Check the conversation history and response analytics</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Enhanced Chatbot Widget */}
      <ChatbotWidget
        userId={userInfo.userId}
        userPhone={userInfo.userPhone}
        position="bottom-right"
        apiEndpoint="/api/chatbot-enhanced"
      />
    </div>
  );
}