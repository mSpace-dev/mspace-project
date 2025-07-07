"use client";

import { useState } from "react";
import CustomerUserProfile from "../../../components/CustomerUserProfile";

interface PriceData {
  id: string;
  cropName: string;
  variety: string;
  location: string;
  price: number;
  unit: string;
  change: number;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  quality: 'A' | 'B' | 'C';
}

export default function CustomerCurrentPrices() {
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Mock data - replace with actual API call
  const [priceData] = useState<PriceData[]>([
    {
      id: "1",
      cropName: "Rice",
      variety: "Nadu",
      location: "Colombo",
      price: 120,
      unit: "kg",
      change: 5.2,
      lastUpdated: "2025-01-07 10:30 AM",
      trend: "up",
      quality: "A"
    },
    {
      id: "2",
      cropName: "Coconut",
      variety: "King Coconut",
      location: "Kandy",
      price: 45,
      unit: "piece",
      change: -2.1,
      lastUpdated: "2025-01-07 10:25 AM",
      trend: "down",
      quality: "A"
    },
    {
      id: "3",
      cropName: "Tomato",
      variety: "Local",
      location: "Anuradhapura",
      price: 200,
      unit: "kg",
      change: 0,
      lastUpdated: "2025-01-07 10:20 AM",
      trend: "stable",
      quality: "B"
    },
    {
      id: "4",
      cropName: "Onion",
      variety: "Big Onion",
      location: "Gampaha",
      price: 180,
      unit: "kg",
      change: 12.5,
      lastUpdated: "2025-01-07 10:15 AM",
      trend: "up",
      quality: "A"
    },
    {
      id: "5",
      cropName: "Potato",
      variety: "Local",
      location: "Nuwara Eliya",
      price: 150,
      unit: "kg",
      change: -8.3,
      lastUpdated: "2025-01-07 10:10 AM",
      trend: "down",
      quality: "B"
    },
    {
      id: "6",
      cropName: "Cabbage",
      variety: "Round",
      location: "Kandy",
      price: 80,
      unit: "kg",
      change: 3.2,
      lastUpdated: "2025-01-07 10:05 AM",
      trend: "up",
      quality: "A"
    }
  ]);

  const filteredData = priceData.filter(item => {
    const matchesSearch = item.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.variety.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === "all" || item.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
          </svg>
        );
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'A': return "bg-green-100 text-green-800";
      case 'B': return "bg-yellow-100 text-yellow-800";
      case 'C': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
              <a href="/home" className="text-gray-700 hover:text-green-600 transition-colors">Home</a>
              <CustomerUserProfile 
                isLoggedIn={true} 
                userRole="customer"
                userName="Sandali"
                userEmail="sandali@example.com"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Current Market Prices</h1>
            <p className="text-gray-600 mt-2">Real-time agricultural commodity prices across Sri Lanka</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Crops
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by crop name..."
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
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

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="all">All Categories</option>
                <option value="grains">Grains</option>
                <option value="vegetables">Vegetables</option>
                <option value="fruits">Fruits</option>
                <option value="spices">Spices</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View Mode
              </label>
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                    viewMode === 'list' 
                      ? 'bg-green-600 text-white border-green-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                    viewMode === 'grid'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Price Display */}
        {viewMode === 'list' ? (
          /* List View */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crop
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quality
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.cropName}</div>
                          <div className="text-sm text-gray-500">{item.variety}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Rs. {item.price.toLocaleString()} / {item.unit}
                        </div>
                        <div className="text-xs text-gray-500">{item.lastUpdated}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center space-x-1 text-sm ${getChangeColor(item.change)}`}>
                          {getTrendIcon(item.trend)}
                          <span>{item.change > 0 ? '+' : ''}{item.change}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getQualityColor(item.quality)}`}>
                          Grade {item.quality}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button className="text-green-600 hover:text-green-900">
                          Set Alert
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900">
                          View Chart
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{item.cropName}</h3>
                    <p className="text-sm text-gray-500">{item.variety}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getQualityColor(item.quality)}`}>
                    Grade {item.quality}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-2xl font-bold text-gray-900">
                    Rs. {item.price.toLocaleString()}
                    <span className="text-sm font-normal text-gray-500"> / {item.unit}</span>
                  </div>
                  <div className={`flex items-center space-x-1 text-sm mt-1 ${getChangeColor(item.change)}`}>
                    {getTrendIcon(item.trend)}
                    <span>{item.change > 0 ? '+' : ''}{item.change}%</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">📍 {item.location}</p>
                  <p className="text-xs text-gray-500 mt-1">Updated: {item.lastUpdated}</p>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                    Set Alert
                  </button>
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                    View Chart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No prices found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <p className="text-sm font-medium text-gray-500">Trending Up</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {filteredData.filter(d => d.trend === 'up').length}
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
                <p className="text-sm font-medium text-gray-500">Trending Down</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {filteredData.filter(d => d.trend === 'down').length}
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
                <p className="text-sm font-medium text-gray-500">Stable</p>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Items</p>
                <p className="text-2xl font-semibold text-gray-900">{filteredData.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
