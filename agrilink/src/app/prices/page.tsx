'use client';

import { useState, useEffect } from 'react';

interface PriceData {
  id: string;
  commodity: string;
  category: string;
  unit: string;
  market: string;
  marketType: 'wholesale' | 'retail';
  location: string;
  yesterdayPrice: number | null;
  todayPrice: number | null;
  changePercent: number | null;
  changeAmount: number | null;
  trend: 'increase' | 'decrease' | 'stable';
  significantChange: boolean;
  date: string;
}

interface ApiResponse {
  success: boolean;
  data: PriceData[];
  total: number;
  filters: any;
  timestamp: string;
  error?: string;
}

export default function Prices() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    marketType: '',
    commodity: '',
    location: '',
    significantOnly: false
  });

  const categories = ['VEGETABLES', 'RICE', 'FRUITS', 'FISH', 'OTHER'];
  const locations = ['Pettah', 'Dambulla', 'Narahenpita', 'Peliyagoda', 'Negombo'];

  useEffect(() => {
    fetchPrices();
  }, [filters]);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.marketType) params.append('marketType', filters.marketType);
      if (filters.commodity) params.append('commodity', filters.commodity);
      if (filters.location) params.append('location', filters.location);
      if (filters.significantOnly) params.append('significantOnly', 'true');

      const response = await fetch(`/api/prices?${params}`);
      const data: ApiResponse = await response.json();

      if (data.success) {
        setPrices(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch prices');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Error fetching prices:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `Rs. ${price.toFixed(2)}`;
  };

  const formatChange = (changePercent: number | null, changeAmount: number | null) => {
    if (changePercent === null || changeAmount === null) return 'N/A';
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(1)}% (${sign}Rs.${changeAmount.toFixed(2)})`;
  };

  const getTrendColor = (trend: string, significantChange: boolean) => {
    if (significantChange) {
      return trend === 'increase' ? 'text-red-600 font-bold' : 'text-green-600 font-bold';
    }
    return trend === 'increase' ? 'text-red-500' : trend === 'decrease' ? 'text-green-500' : 'text-gray-500';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increase': return '↗️';
      case 'decrease': return '↘️';
      default: return '➡️';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-8 text-center">
          Agricultural Prices
        </h1>
        <p className="text-gray-600 text-lg text-center max-w-2xl mx-auto mb-8">
          Real-time pricing information for crops across Sri Lankan markets
        </p>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-green-700 mb-4">Filter Prices</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Market Type</label>
              <select
                value={filters.marketType}
                onChange={(e) => setFilters({...filters, marketType: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Markets</option>
                <option value="wholesale">Wholesale</option>
                <option value="retail">Retail</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Commodity</label>
              <input
                type="text"
                value={filters.commodity}
                onChange={(e) => setFilters({...filters, commodity: e.target.value})}
                placeholder="Search commodity..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Significant Changes</label>
              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  checked={filters.significantOnly}
                  onChange={(e) => setFilters({...filters, significantOnly: e.target.checked})}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">±5% or more</span>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchPrices}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-2 text-gray-600">Loading price data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="text-red-500">⚠️</div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Price Data Table */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-green-50 border-b border-green-100">
              <h2 className="text-xl font-semibold text-green-700">
                Price Data ({prices.length} items)
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Last updated: {prices.length > 0 ? new Date(prices[0].date).toLocaleDateString() : 'No data'}
              </p>
            </div>

            {prices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No price data available</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or check back later</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Commodity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Market
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Yesterday
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Today
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Change
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {prices.map((price) => (
                      <tr key={price.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{price.commodity}</div>
                            <div className="text-sm text-gray-500">{price.category} • {price.unit}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{price.location}</div>
                            <div className="text-sm text-gray-500 capitalize">{price.marketType}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(price.yesterdayPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatPrice(price.todayPrice)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${getTrendColor(price.trend, price.significantChange)}`}>
                          {formatChange(price.changePercent, price.changeAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center text-sm ${getTrendColor(price.trend, price.significantChange)}`}>
                            {getTrendIcon(price.trend)}
                            <span className="ml-1 capitalize">{price.trend}</span>
                            {price.significantChange && (
                              <span className="ml-2 px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                                Significant
                              </span>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
