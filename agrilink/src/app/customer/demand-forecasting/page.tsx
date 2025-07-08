"use client";

import { useState, useEffect } from "react";
import CustomerUserProfile from "../../../components/CustomerUserProfile";

interface ForecastData {
  id: string;
  cropName: string;
  location: string;
  period: string;
  currentDemand: number;
  forecastedDemand: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendation: string;
  lastUpdated: string;
}

export default function CustomerDemandForecasting() {
  const [selectedCrop, setSelectedCrop] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("3months");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    // Get customer info from localStorage
    const customerData = localStorage.getItem('customer');
    if (customerData) {
      const parsedCustomer = JSON.parse(customerData);
      setCustomer(parsedCustomer);
    }
  }, []);

  // Mock data - replace with actual API calls
  const [forecastData] = useState<ForecastData[]>([
    {
      id: "1",
      cropName: "Rice",
      location: "Colombo",
      period: "Next 3 months",
      currentDemand: 15000,
      forecastedDemand: 18000,
      confidence: 87,
      trend: "increasing",
      recommendation: "Good time to increase rice production. High demand expected during festival season.",
      lastUpdated: "2025-01-07 09:00 AM"
    },
    {
      id: "2",
      cropName: "Tomato",
      location: "Kandy",
      period: "Next 3 months",
      currentDemand: 8500,
      forecastedDemand: 7200,
      confidence: 92,
      trend: "decreasing",
      recommendation: "Consider reducing tomato cultivation. Market may be oversupplied.",
      lastUpdated: "2025-01-07 09:00 AM"
    },
    {
      id: "3",
      cropName: "Coconut",
      location: "Gampaha",
      period: "Next 3 months",
      currentDemand: 12000,
      forecastedDemand: 12300,
      confidence: 78,
      trend: "stable",
      recommendation: "Maintain current production levels. Steady demand expected.",
      lastUpdated: "2025-01-07 09:00 AM"
    },
    {
      id: "4",
      cropName: "Onion",
      location: "Anuradhapura",
      period: "Next 3 months",
      currentDemand: 6500,
      forecastedDemand: 8200,
      confidence: 85,
      trend: "increasing",
      recommendation: "Excellent opportunity for onion farmers. Consider expanding cultivation.",
      lastUpdated: "2025-01-07 09:00 AM"
    }
  ]);

  const filteredData = forecastData.filter(item => {
    const matchesCrop = selectedCrop === "all" || item.cropName.toLowerCase() === selectedCrop;
    const matchesLocation = selectedLocation === "all" || item.location === selectedLocation;
    return matchesCrop && matchesLocation;
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'decreasing':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
          </svg>
        );
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "text-green-600 bg-green-100";
    if (confidence >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'border-green-200 bg-green-50';
      case 'decreasing': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <a href="/home" className="text-2xl font-bold text-green-700 hover:text-green-600 transition-colors">
                AgriLink
              </a>
              <span className="ml-2 text-sm text-gray-500">Sri Lanka</span>
            </div>
            
            <div className="flex items-center space-x-8">
              <a href="/about" className="text-gray-700 hover:text-green-600 transition-colors">About</a>
              <a href="/products" className="text-gray-700 hover:text-green-600 transition-colors">Products</a>
              <a href="/our-team" className="text-gray-700 hover:text-green-600 transition-colors">Our Team</a>
              <a href="/partners" className="text-gray-700 hover:text-green-600 transition-colors">Partners</a>
              <a href="/contact" className="text-gray-700 hover:text-green-600 transition-colors">Contact</a>
              <CustomerUserProfile 
                        isLoggedIn={!!customer} 
                        userRole="customer"
                        userName={customer?.name || "Customer"}
                        userEmail={customer?.email || ""}
                      />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Demand Forecasting</h1>
            <p className="text-gray-600 mt-2">Make informed decisions with AI-powered market demand predictions</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
            </svg>
            <span>AI Model updated: {new Date().toLocaleString()}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="crop" className="block text-sm font-medium text-gray-700 mb-2">
                Select Your Crop
              </label>
              <select
                id="crop"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="all">All Crops</option>
                <option value="rice">Rice</option>
                <option value="tomato">Tomato</option>
                <option value="coconut">Coconut</option>
                <option value="onion">Onion</option>
                <option value="potato">Potato</option>
              </select>
            </div>

            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
                Forecast Period
              </label>
              <select
                id="period"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="1month">Next Month</option>
                <option value="3months">Next 3 Months</option>
                <option value="6months">Next 6 Months</option>
                <option value="1year">Next Year</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Your Location
              </label>
              <select
                id="location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="all">All Locations</option>
                <option value="Colombo">Colombo</option>
                <option value="Kandy">Kandy</option>
                <option value="Gampaha">Gampaha</option>
                <option value="Anuradhapura">Anuradhapura</option>
                <option value="Nuwara Eliya">Nuwara Eliya</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">High Demand</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {filteredData.filter(d => d.trend === 'increasing').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Low Demand</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {filteredData.filter(d => d.trend === 'decreasing').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Stable Demand</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {filteredData.filter(d => d.trend === 'stable').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg. Confidence</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.round(filteredData.reduce((sum, d) => sum + d.confidence, 0) / filteredData.length || 0)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Forecast Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {filteredData.map((item) => {
            const changePercent = ((item.forecastedDemand - item.currentDemand) / item.currentDemand * 100);
            return (
              <div key={item.id} className={`bg-white rounded-lg shadow-sm border-2 p-6 ${getTrendColor(item.trend)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{item.cropName}</h3>
                    <p className="text-sm text-gray-600">📍 {item.location} • {item.period}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(item.trend)}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(item.confidence)}`}>
                      {item.confidence}% confidence
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Current Demand</p>
                    <p className="text-2xl font-bold text-gray-900">{item.currentDemand.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">MT (Metric Tons)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Forecasted Demand</p>
                    <p className="text-2xl font-bold text-gray-900">{item.forecastedDemand.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">MT (Metric Tons)</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Demand Change</span>
                    <span className={`text-sm font-medium ${
                      changePercent > 0 ? 'text-green-600' : 
                      changePercent < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        changePercent > 0 ? 'bg-green-600' : 
                        changePercent < 0 ? 'bg-red-600' : 'bg-gray-600'
                      }`}
                      style={{ width: `${Math.min(Math.abs(changePercent), 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">💡 Recommendation</h4>
                  <p className="text-sm text-gray-700">{item.recommendation}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last updated: {item.lastUpdated}</span>
                  <button className="text-green-600 hover:text-green-700 font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No forecast data available</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filter criteria.</p>
          </div>
        )}

        {/* How It Works */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">How Our Demand Forecasting Works</h3>
              <div className="text-sm text-blue-700 space-y-2">
                <p>
                  Our AI-powered system analyzes multiple data sources to predict future market demand:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Historical price and demand patterns</li>
                  <li>Weather forecasts and seasonal trends</li>
                  <li>Festival calendars and cultural events</li>
                  <li>Export/import statistics</li>
                  <li>Economic indicators and consumer behavior</li>
                </ul>
                <p className="pt-2">
                  <strong>🎯 Use these insights to:</strong> Plan your crop selection, optimize planting schedules, 
                  negotiate better prices, and make informed farming decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
