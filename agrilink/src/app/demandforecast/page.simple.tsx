"use client";

import { useState } from 'react';

export default function DemandForecastPage() {
  const [selectedCrop, setSelectedCrop] = useState('rice');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => window.location.href = '/home'}
            >
              <span className="text-2xl font-bold text-green-600">AgriLink</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="/home" className="text-gray-700 hover:text-green-600">Home</a>
              <a href="/prices" className="text-gray-700 hover:text-green-600">Prices</a>
              <a href="/demandforecast" className="text-green-600 font-medium">Demand Forecast</a>
              <a href="/alerts" className="text-gray-700 hover:text-green-600">Alerts</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Demand Forecasting
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get intelligent predictions for agricultural market demand using advanced machine learning algorithms
          </p>
        </div>

        {/* Crop Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Select Crop for Forecast</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'rice', label: 'Rice', emoji: '🌾' },
              { name: 'tomato', label: 'Tomato', emoji: '🍅' },
              { name: 'onion', label: 'Onion', emoji: '🧅' },
              { name: 'carrot', label: 'Carrot', emoji: '🥕' },
              { name: 'beans', label: 'Beans', emoji: '🫘' },
              { name: 'potato', label: 'Potato', emoji: '🥔' },
            ].map((crop) => (
              <button
                key={crop.name}
                onClick={() => setSelectedCrop(crop.name)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedCrop === crop.name
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="text-3xl mb-2">{crop.emoji}</div>
                <div className="font-medium">{crop.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Forecast Results */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Forecast for {selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Price Prediction */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Price Prediction</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">Rs. 245/kg</div>
              <div className="text-sm text-blue-600">
                📈 Expected to increase by 8% next week
              </div>
            </div>

            {/* Demand Level */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Demand Level</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">High</div>
              <div className="text-sm text-green-600">
                🔥 85% above average demand
              </div>
            </div>

            {/* Supply Status */}
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Supply Status</h3>
              <div className="text-3xl font-bold text-yellow-600 mb-2">Moderate</div>
              <div className="text-sm text-yellow-600">
                📦 Sufficient supply available
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommendations</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                <div className="text-green-500 mt-1">💡</div>
                <div>
                  <div className="font-medium text-green-800">Optimal Selling Time</div>
                  <div className="text-green-700">Consider selling in the next 3-5 days for maximum profit</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <div className="text-blue-500 mt-1">📊</div>
                <div>
                  <div className="font-medium text-blue-800">Market Trend</div>
                  <div className="text-blue-700">Prices are trending upward due to increased urban demand</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                <div className="text-purple-500 mt-1">🎯</div>
                <div>
                  <div className="font-medium text-purple-800">Best Markets</div>
                  <div className="text-purple-700">Colombo and Kandy showing highest demand</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="mt-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">🚀 Advanced Features Coming Soon</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl mb-2">🤖</div>
              <div className="font-semibold">AI Chat Assistant</div>
              <div className="text-sm opacity-90">Ask questions about market trends</div>
            </div>
            <div>
              <div className="text-4xl mb-2">📈</div>
              <div className="font-semibold">Advanced Analytics</div>
              <div className="text-sm opacity-90">Detailed market insights and predictions</div>
            </div>
            <div>
              <div className="text-4xl mb-2">📱</div>
              <div className="font-semibold">Mobile App</div>
              <div className="text-sm opacity-90">Get forecasts on your smartphone</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
