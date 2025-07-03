'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  Grid3X3, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Filter,
  Wheat,
  Apple,
  Fish,
  Grape,
  Carrot
} from 'lucide-react';
import { TableView, CommodityCardsView } from './components';
import { CategoryChartsView, CommodityAnalysisView } from './chart-components';

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

interface CommodityData {
  name: string;
  commodity: string;
  category: string;
  unit: string;
  value: number;
  averagePrice: number;
  count: number;
  totalValue: number;
}

interface CommodityChangeData {
  commodity: string;
  category: string;
  market: string;
  yesterdayPrice: number;
  todayPrice: number;
  changeAmount: number;
  changePercentage: number;
  trend: string;
  significantChange: boolean;
}

type ViewType = 'table' | 'category-charts' | 'commodity-analysis' | 'commodity-cards';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const categoryIcons = {
  'VEGETABLES': Carrot,
  'FRUITS': Apple,
  'RICE': Wheat,
  'FISH': Fish,
  'OTHER': Grape
};

export default function Prices() {
  const [currentView, setCurrentView] = useState<ViewType>('table');
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [commodityData, setCommodityData] = useState<CommodityData[]>([]);
  const [commodityChangesData, setCommodityChangesData] = useState<CommodityChangeData[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    marketType: '',
    commodity: '',
    location: '',
    market: '',
    date: '',
    significantOnly: false
  });

  const categories = ['VEGETABLES', 'RICE', 'FRUITS', 'FISH', 'OTHER'];
  const locations = ['Pettah', 'Dambulla', 'Narahenpita'];
  const markets = ['Pettah', 'Dambulla', 'Pettah_retail', 'Dambulla_retail', 'Narahenpita_retail'];

  useEffect(() => {
    fetchAvailableDates();
    fetchAvailableCategories();
    if (currentView === 'table') {
      fetchPrices();
    } else if (currentView === 'category-charts' && selectedCategory) {
      fetchCommodityData();
    } else if (currentView === 'commodity-analysis') {
      fetchCommodityChangesData();
    }
  }, [filters, currentView, selectedCategory]);

  const fetchAvailableDates = async () => {
    try {
      const response = await fetch('/api/analytics?type=available-dates');
      const data = await response.json();
      if (data.success) {
        setAvailableDates(data.data);
        if (!filters.date && data.data.length > 0) {
          setFilters(prev => ({ ...prev, date: data.data[0] }));
        }
      }
    } catch (err) {
      console.error('Error fetching dates:', err);
    }
  };

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

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

  const fetchAvailableCategories = async () => {
    try {
      const response = await fetch('/api/analytics?type=available-categories');
      const data = await response.json();
      if (data.success) {
        setAvailableCategories(data.data);
        if (!selectedCategory && data.data.length > 0) {
          setSelectedCategory(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchCommodityData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await fetch(`/api/analytics?type=category-comparison&${params}`);
      const data = await response.json();

      if (data.success) {
        setCommodityData(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch commodity data');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Error fetching commodity data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommodityChangesData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await fetch(`/api/analytics?type=commodity-changes&${params}`);
      const data = await response.json();

      if (data.success) {
        setCommodityChangesData(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch commodity changes data');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Error fetching commodity changes data:', err);
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
      case 'increase': return <TrendingUp className="w-4 h-4" />;
      case 'decrease': return <TrendingDown className="w-4 h-4" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category as keyof typeof categoryIcons] || Grape;
  };

  return (
<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
  {/* Top Navigation */}
  <nav className="bg-white shadow-sm sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-4">
        <div className="flex items-center cursor-pointer" onClick={() => window.location.href = '/home'}>
          <h1 className="text-2xl font-bold text-green-700 hover:text-green-600 transition-colors">AgriLink</h1>
          <span className="ml-2 text-sm text-gray-500">Sri Lanka</span>
        </div>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="/prices" className="text-gray-700 hover:text-green-600 transition-colors font-medium">Prices</a>
          <a href="/alerts" className="text-gray-700 hover:text-green-600 transition-colors">Alerts</a>
          <a href="/demandforecast" className="text-gray-700 hover:text-green-600 transition-colors">Forecasts</a>
          <a href="/customer" className="btn-agrilink text-white px-4 py-2 rounded-lg">Log In</a>
        </div>
      </div>
    </div>
  </nav>
  
  <div className="flex">
    {/* Sidebar */}
    <div className="w-64 bg-white shadow-lg border-r">
      <div className="p-6">
        <h2 className="text-xl font-bold text-green-700 mb-6">Price Analytics</h2>
        
        <nav className="space-y-2">
          <button
            onClick={() => setCurrentView('table')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
              currentView === 'table' 
                ? 'bg-green-100 text-green-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Grid3X3 className="w-5 h-5" />
            Price Table
          </button>
          
          <button
            onClick={() => setCurrentView('commodity-cards')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
              currentView === 'commodity-cards' 
                ? 'bg-green-100 text-green-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Grid3X3 className="w-5 h-5" />
            Commodity Cards
          </button>
          
          <button
            onClick={() => setCurrentView('category-charts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
              currentView === 'category-charts' 
                ? 'bg-green-100 text-green-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <PieChartIcon className="w-5 h-5" />
            Category Analysis
          </button>
          
          <button
            onClick={() => setCurrentView('commodity-analysis')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
              currentView === 'commodity-analysis' 
                ? 'bg-green-100 text-green-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Price Changes
          </button>
        </nav>
      </div>

      {/* Common Filters */}
      <div className="p-6 border-t">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Filters</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Date</label>
            <select
              value={filters.date}
              onChange={(e) => setFilters({...filters, date: e.target.value})}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
            >
              <option value="" className="text-gray-900">Latest</option>
              {availableDates.map(date => (
                <option key={date} value={date} className="text-gray-900">
                  {new Date(date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {currentView === 'commodity-analysis' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
              >
                <option value="" className="text-gray-900">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="text-gray-900">{cat}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <h1 className="text-4xl font-bold text-green-700 mb-2">
          Agricultural Prices
        </h1>
        <p className="text-gray-600 mb-8">
          Real-time pricing information and analytics for crops across Sri Lankan markets
        </p>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-2 text-gray-600">Loading data...</p>
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

        {/* Content based on current view */}
        {!loading && !error && (
          <>
            {currentView === 'table' && (
              <TableView 
                prices={prices} 
                filters={filters} 
                setFilters={setFilters}
                categories={categories}
                locations={locations}
                markets={markets}
                formatPrice={formatPrice}
                formatChange={formatChange}
                getTrendColor={getTrendColor}
                getTrendIcon={getTrendIcon}
              />
            )}

            {currentView === 'commodity-cards' && (
              <CommodityCardsView 
                categories={categories}
                getCategoryIcon={getCategoryIcon}
                filters={filters}
                onCategorySelect={(category: string) => {
                  setSelectedCategory(category);
                  setCurrentView('commodity-analysis');
                }}
              />
            )}

            {currentView === 'category-charts' && (
              <>
                {/* Category Selection Buttons */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-green-700 mb-4">Select Category for Commodity Analysis</h2>
                  <div className="flex flex-wrap gap-3">
                    {availableCategories.map((category) => {
                      const IconComponent = getCategoryIcon(category);
                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                            selectedCategory === category
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                          <span className="font-medium">{category}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedCategory && (
                  <CategoryChartsView 
                    commodityData={commodityData}
                    selectedCategory={selectedCategory}
                    colors={COLORS}
                  />
                )}
              </>
            )}

            {currentView === 'commodity-analysis' && (
              <CommodityAnalysisView 
                commodityData={commodityChangesData}
                selectedCategory={selectedCategory}
                colors={COLORS}
              />
            )}
          </>
        )}
      </div>
    </div>
  </div>
</div>
  );
}
