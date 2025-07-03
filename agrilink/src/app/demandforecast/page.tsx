


"use client"

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Users, DollarSign, BarChart3, Calendar, MapPin, Leaf, Target, Lightbulb, Activity } from 'lucide-react';

type MarketInsights = {
  crop: "Carrot" | "Tomato" | "Onion" | "Beans" | "Pumpkin";
  district: string;
  currentPrice: number;
  avgPrice: number;
  priceChange: number;
  trend: string;
  demandLevel: string;
  supplyLevel: string;
  nextDaysPrices: number[];
  confidence: number;
  marketCondition: string;
  bestSellingDays: string[];
  seasonalFactor: string;
  competitorCount: number;
  qualityDemand: string;
};

const AIMarketInsightsApp = () => {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [userType, setUserType] = useState('farmer');
  const [insights, setInsights] = useState<MarketInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crops = ["Carrot", "Tomato", "Onion", "Beans", "Pumpkin"];
  const districts = ["Colombo", "Dambulla", "Jaffna", "Kandy", "Galle"];

  // Mock market data - in real implementation, this would come from your API
  const generateMarketInsights = (
    crop: "Carrot" | "Tomato" | "Onion" | "Beans" | "Pumpkin",
    district: string
  ) => {
    const basePrice = {
      "Carrot": 120, "Tomato": 150, "Onion": 100, "Beans": 200, "Pumpkin": 80
    }[crop] || 120;

    const districtMultiplier = {
      "Colombo": 1.2, "Dambulla": 0.9, "Jaffna": 1.1, "Kandy": 1.05, "Galle": 0.95
    }[district] || 1.0;

    const currentPrice = Math.round(basePrice * districtMultiplier * (0.9 + Math.random() * 0.2));
    const avgPrice = Math.round(basePrice * districtMultiplier);
    const priceChange = currentPrice - avgPrice;
    const trend = priceChange > 5 ? 'increasing' : priceChange < -5 ? 'decreasing' : 'stable';
    
    const demandLevel = Math.random() > 0.5 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low';
    const supplyLevel = Math.random() > 0.5 ? 'adequate' : Math.random() > 0.3 ? 'limited' : 'surplus';
    
    const nextDaysPrices = [
      Math.round(currentPrice * (0.95 + Math.random() * 0.1)),
      Math.round(currentPrice * (0.98 + Math.random() * 0.08)),
      Math.round(currentPrice * (0.96 + Math.random() * 0.12))
    ];

    return {
      crop,
      district,
      currentPrice,
      avgPrice,
      priceChange,
      trend,
      demandLevel,
      supplyLevel,
      nextDaysPrices,
      confidence: Math.round(75 + Math.random() * 20),
      marketCondition: priceChange > 0 ? 'favorable' : priceChange < -10 ? 'challenging' : 'stable',
      bestSellingDays: ['Wednesday', 'Friday', 'Saturday'],
      seasonalFactor: Math.random() > 0.5 ? 'peak' : 'normal',
      competitorCount: Math.floor(Math.random() * 15) + 5,
      qualityDemand: Math.random() > 0.6 ? 'premium' : 'standard'
    };
  };

  const fetchInsights = async () => {
    if (!selectedCrop || !selectedDistrict) return;

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const marketInsights = generateMarketInsights(selectedCrop as "Carrot" | "Tomato" | "Onion" | "Beans" | "Pumpkin", selectedDistrict);
      setInsights(marketInsights);
    } catch (err) {
      setError('Failed to fetch market insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCrop && selectedDistrict) {
      fetchInsights();
    }
  }, [selectedCrop, selectedDistrict]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'decreasing': return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSupplyColor = (level: string) => {
    switch (level) {
      case 'limited': return 'text-red-600 bg-red-50';
      case 'adequate': return 'text-green-600 bg-green-50';
      case 'surplus': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const generateRecommendations = () => {
    if (!insights) return [];

    const recommendations = [];
    
    if (userType === 'farmer') {
      if (insights.trend === 'increasing') {
        recommendations.push({
          icon: <TrendingUp className="w-5 h-5 text-green-500" />,
          title: "Optimal Selling Time",
          description: "Market prices are rising. Consider selling your harvest soon to maximize profits.",
          priority: "high"
        });
      }
      
      if (insights.demandLevel === 'high') {
        recommendations.push({
          icon: <Target className="w-5 h-5 text-blue-500" />,
          title: "High Demand Alert",
          description: "Strong demand detected. Increase production capacity if possible.",
          priority: "high"
        });
      }

      if (insights.supplyLevel === 'limited') {
        recommendations.push({
          icon: <Activity className="w-5 h-5 text-orange-500" />,
          title: "Supply Shortage",
          description: "Limited supply in the market. Your crops will have competitive advantage.",
          priority: "medium"
        });
      }

      recommendations.push({
        icon: <Calendar className="w-5 h-5 text-purple-500" />,
        title: "Best Selling Days",
        description: `Historically, ${insights.bestSellingDays.join(', ')} show highest prices.`,
        priority: "medium"
      });
    } else {
      if (insights.trend === 'decreasing') {
        recommendations.push({
          icon: <TrendingDown className="w-5 h-5 text-green-500" />,
          title: "Price Drop Opportunity",
          description: "Prices are declining. Good time to purchase in bulk.",
          priority: "high"
        });
      }

      if (insights.supplyLevel === 'surplus') {
        recommendations.push({
          icon: <BarChart3 className="w-5 h-5 text-blue-500" />,
          title: "Surplus Supply",
          description: "Abundant supply available. Negotiate for better prices.",
          priority: "high"
        });
      }

      recommendations.push({
        icon: <Users className="w-5 h-5 text-orange-500" />,
        title: "Market Competition",
        description: `${insights.competitorCount} active sellers. Compare prices before purchasing.`,
        priority: "medium"
      });

    return recommendations;
  };

  return (
    <div>
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
              <a href="/prices" className="text-gray-700 hover:text-green-600 transition-colors">Prices</a>
              <a href="/alerts" className="text-gray-700 hover:text-green-600 transition-colors">Alerts</a>
              <a href="/demandforecast" className="text-gray-700 hover:text-green-600 transition-colors font-medium">Forecasts</a>
              <a href="/customer" className="btn-agrilink text-white px-4 py-2 rounded-lg">Log In</a>
            </div>
          </div>
        </div>
      </nav>
      
      <main
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #f0fdfa 100%)",
          padding: "24px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
=======
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            🧠 AI Market Insights Dashboard
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Get intelligent market insights powered by AI for smarter agricultural decisions
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Users className="w-4 h-4 inline mr-2" />
                I am a...
              </label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 hover:border-gray-300"
              >
                <option value="farmer" className="py-2 text-gray-900">🌾 Farmer</option>
                <option value="customer" className="py-2 text-gray-900">🛒 Customer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Leaf className="w-4 h-4 inline mr-2" />
                Select Crop
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 hover:border-gray-300"
              >
                <option value="" className="py-2 text-gray-500">Choose a crop...</option>
                {crops.map(crop => (
                  <option key={crop} value={crop} className="py-2 text-gray-900">{crop}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <MapPin className="w-4 h-4 inline mr-2" />
                Select District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 hover:border-gray-300"
              >
                <option value="" className="py-2 text-gray-500">Choose a district...</option>
                {districts.map(district => (
                  <option key={district} value={district} className="py-2 text-gray-900">{district}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Analyzing market data with AI...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Insights Dashboard */}
        {insights && !loading && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-emerald-100 p-3 rounded-xl">
                      <DollarSign className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500 font-medium">Current Price</p>
                      <p className="text-2xl font-bold text-gray-900">LKR {insights.currentPrice}</p>
                    </div>
                  </div>
                  {getTrendIcon(insights.trend)}
                </div>
                <div className="flex items-center text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    insights.priceChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {insights.priceChange >= 0 ? '+' : ''}{insights.priceChange} from avg
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Activity className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500 font-medium">Demand Level</p>
                    <p className="text-2xl font-bold text-gray-900 capitalize">{insights.demandLevel}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDemandColor(insights.demandLevel)}`}>
                  Market demand
                </span>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500 font-medium">Supply Status</p>
                    <p className="text-2xl font-bold text-gray-900 capitalize">{insights.supplyLevel}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSupplyColor(insights.supplyLevel)}`}>
                  Current supply
                </span>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-orange-100 p-3 rounded-xl">
                    <Target className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500 font-medium">AI Confidence</p>
                    <p className="text-2xl font-bold text-gray-900">{insights.confidence}%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${insights.confidence}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Price Forecast - Enhanced AI Highlight */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white">
              <div className="flex items-center mb-6">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold">🧠 AI-Powered Price Forecast</h3>
                  <p className="text-blue-100">Advanced machine learning predictions</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insights.nextDaysPrices.map((price, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="text-center">
                      <p className="text-blue-100 mb-2 font-medium">Day {index + 1}</p>
                      <p className="text-3xl font-bold text-white mb-2">LKR {price}</p>
                      <p className={`text-sm font-semibold ${
                        price > insights.currentPrice ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {price > insights.currentPrice ? '+' : ''}{Math.round(((price - insights.currentPrice) / insights.currentPrice) * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations - Enhanced Highlight */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-2xl p-8 text-white">
              <div className="flex items-center mb-6">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold">
                    🧠 AI Smart Recommendations for {userType === 'farmer' ? 'Farmers' : 'Customers'}
                  </h3>
                  <p className="text-emerald-100">Personalized insights based on market analysis</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {generateRecommendations().map((rec, index) => (
                  <div key={index} className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 ${
                    rec.priority === 'high' 
                      ? 'border-l-4 border-l-yellow-400' 
                      : 'border-l-4 border-l-blue-400'
                  }`}>
                    <div className="flex items-start">
                      <div className="bg-white/20 p-2 rounded-lg">
                        {rec.icon}
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="font-bold text-white text-lg">{rec.title}</h4>
                        <p className="text-white/90 text-sm mt-1">{rec.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        rec.priority === 'high' 
                          ? 'bg-yellow-400 text-yellow-900' 
                          : 'bg-blue-400 text-blue-900'
                      }`}>
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Analysis */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="bg-indigo-100 p-3 rounded-xl">
                  <BarChart3 className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">Market Analysis</h3>
                  <p className="text-gray-600">Comprehensive market overview</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Market Condition</span>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      insights.marketCondition === 'favorable' 
                        ? 'bg-green-100 text-green-800'
                        : insights.marketCondition === 'challenging'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {insights.marketCondition.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Seasonal Factor</span>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      insights.seasonalFactor === 'peak' 
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {insights.seasonalFactor.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Quality Demand</span>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      insights.qualityDemand === 'premium' 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {insights.qualityDemand.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Active Sellers</span>
                    <span className="font-bold text-lg text-gray-900">{insights.competitorCount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Average Price</span>
                    <span className="font-bold text-lg text-gray-900">LKR {insights.avgPrice}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700 font-medium">Best Selling Days</span>
                    <span className="font-bold text-sm text-gray-900">{insights.bestSellingDays.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Selection State */}
        {!selectedCrop || !selectedDistrict ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="text-8xl mb-6">🌾</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Select Crop & District
            </h3>
            <p className="text-gray-600 text-lg">
              Choose a crop and district to get AI-powered market insights
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </main>
    </div>
  )
}

export default AIMarketInsightsApp;

