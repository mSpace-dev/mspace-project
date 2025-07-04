'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Target, DollarSign, Package, ShoppingCart, AlertTriangle } from 'lucide-react';
import PricePredictionWidget from '../components/PricePredictionWidget';

interface Product {
  _id: string;
  name: string;
  category: string;
  pricePerKg: number;
  availableQuantity: number;
  location: {
    district: string;
    province: string;
  };
  status: string;
  createdAt: string;
}

interface AnalyticsData {
  totalProducts: number;
  totalValue: number;
  avgPrice: number;
  topPerformingCategory: string;
  priceChangePrediction: number;
  demandForecast: number;
  recentSales: number;
  lowStockAlerts: number;
}

interface AnalyticsDashboardProps {
  products: Product[];
  sellerId: string;
}

export default function AnalyticsDashboard({ products, sellerId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateAnalytics();
    if (products.length > 0) {
      setSelectedProduct(products[0]);
    }
  }, [products]);

  const calculateAnalytics = () => {
    if (!products.length) return;

    const totalProducts = products.filter(p => p.status === 'available').length;
    const totalValue = products.reduce((sum, product) => {
      return sum + (product.pricePerKg * product.availableQuantity);
    }, 0);
    const avgPrice = products.reduce((sum, product) => sum + product.pricePerKg, 0) / products.length;

    // Calculate category performance
    const categoryStats = products.reduce((stats, product) => {
      const category = product.category;
      if (!stats[category]) {
        stats[category] = { count: 0, totalValue: 0 };
      }
      stats[category].count++;
      stats[category].totalValue += product.pricePerKg * product.availableQuantity;
      return stats;
    }, {} as Record<string, { count: number; totalValue: number }>);

    const topPerformingCategory = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b.totalValue - a.totalValue)[0]?.[0] || 'N/A';

    // Mock some additional analytics
    const lowStockAlerts = products.filter(p => p.availableQuantity < 10).length;
    const recentSales = Math.floor(Math.random() * 20) + 5; // Mock recent sales

    setAnalytics({
      totalProducts,
      totalValue,
      avgPrice,
      topPerformingCategory,
      priceChangePrediction: Math.random() * 10 - 5, // Mock prediction
      demandForecast: Math.random() * 20 + 80, // Mock demand forecast
      recentSales,
      lowStockAlerts,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'sold': return 'text-blue-600 bg-blue-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
        <button
          onClick={calculateAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Analytics
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Price/kg</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.avgPrice)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Recent Sales</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.recentSales}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {analytics.lowStockAlerts > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">
              Low Stock Alert
            </h3>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            {analytics.lowStockAlerts} product{analytics.lowStockAlerts > 1 ? 's' : ''} running low on stock (less than 10 units)
          </p>
        </div>
      )}

      {/* Price Prediction Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Product for Prediction</h3>
          <select
            value={selectedProduct?._id || ''}
            onChange={(e) => {
              const product = products.find(p => p._id === e.target.value);
              setSelectedProduct(product || null);
            }}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a product...</option>
            {products.map(product => (
              <option key={product._id} value={product._id}>
                {product.name} - {product.category} (Rs. {product.pricePerKg}/kg)
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <PricePredictionWidget
            product={selectedProduct}
            onPredictionUpdate={(prediction) => {
              console.log('Prediction updated:', prediction);
            }}
          />
        )}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Category Performance</h3>
          <div className="space-y-4">
            {Object.entries(
              products.reduce((stats, product) => {
                const category = product.category;
                if (!stats[category]) {
                  stats[category] = { count: 0, totalValue: 0 };
                }
                stats[category].count++;
                stats[category].totalValue += product.pricePerKg * product.availableQuantity;
                return stats;
              }, {} as Record<string, { count: number; totalValue: number }>)
            )
              .sort(([,a], [,b]) => b.totalValue - a.totalValue)
              .map(([category, stats]) => (
                <div key={category} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{category}</p>
                    <p className="text-xs text-gray-500">{stats.count} products</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(stats.totalValue)}</p>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((stats.totalValue / analytics.totalValue) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Status Overview</h3>
          <div className="space-y-3">
            {['available', 'sold', 'expired', 'pending'].map(status => {
              const count = products.filter(p => p.status === status).length;
              const percentage = products.length > 0 ? (count / products.length) * 100 : 0;
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(status).split(' ')[1]}`}></div>
                    <span className="text-sm font-medium text-gray-900 capitalize">{status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{count}</span>
                    <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Market Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-800 font-medium">Price Trend</p>
            <p className="text-xs text-green-600">
              {analytics.priceChangePrediction > 0 ? '+' : ''}{analytics.priceChangePrediction.toFixed(1)}% expected
            </p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-blue-800 font-medium">Demand Forecast</p>
            <p className="text-xs text-blue-600">{analytics.demandForecast.toFixed(0)}% of average</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-purple-800 font-medium">Top Category</p>
            <p className="text-xs text-purple-600 capitalize">{analytics.topPerformingCategory}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
