'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, AlertCircle, RefreshCw } from 'lucide-react';

interface PredictionData {
  predictedPrice: number;
  predictedDemand: number;
  priceChange: number;
  demandChange: number;
  confidence: number;
  marketTrend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

interface Product {
  _id: string;
  name: string;
  category: string;
  pricePerKg: number;
  location: {
    district: string;
    province: string;
  };
}

interface PricePredictionWidgetProps {
  product: Product;
  onPredictionUpdate?: (prediction: PredictionData) => void;
}

export default function PricePredictionWidget({ product, onPredictionUpdate }: PricePredictionWidgetProps) {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPrediction = async () => {
    setLoading(true);
    setError('');

    try {
      // Prepare input data for the ML model
      const inputData = {
        crop: product.name,
        district: product.location.district,
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        weather: 'Sunny', // Default - could be enhanced with weather API
        supply: 100, // Estimated based on available quantity
        prevPrice: product.pricePerKg,
        prevDemand: 80, // Estimated - could be enhanced with historical data
        festivalWeek: 0, // Could be enhanced with festival calendar
        retailPrice: product.pricePerKg * 1.2, // Estimated retail markup
      };

      const response = await fetch('/api/demandforecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputData),
      });

      const data = await response.json();

      if (response.ok) {
        const predictionData: PredictionData = {
          predictedPrice: data.predictedPrice,
          predictedDemand: data.predictedDemand,
          priceChange: ((data.predictedPrice - product.pricePerKg) / product.pricePerKg) * 100,
          demandChange: Math.random() * 20 - 10, // Mock demand change
          confidence: Math.random() * 30 + 70, // Mock confidence 70-100%
          marketTrend: data.predictedPrice > product.pricePerKg ? 'up' : 
                      data.predictedPrice < product.pricePerKg ? 'down' : 'stable',
          lastUpdated: new Date().toISOString(),
        };

        setPrediction(predictionData);
        onPredictionUpdate?.(predictionData);
      } else {
        setError(data.error || 'Failed to get prediction');
      }
    } catch (err) {
      setError('Error connecting to prediction service');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [product._id]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Getting price prediction...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32 text-red-600">
          <AlertCircle className="h-8 w-8 mr-2" />
          <div>
            <p className="font-medium">Prediction Error</p>
            <p className="text-sm text-gray-600">{error}</p>
            <button
              onClick={fetchPrediction}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32 text-gray-500">
          <BarChart3 className="h-8 w-8 mr-2" />
          <p>No prediction available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Price Prediction</h3>
        <button
          onClick={fetchPrediction}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-500">Current Price</p>
          <p className="text-2xl font-bold text-gray-900">
            Rs. {product.pricePerKg.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Predicted Price</p>
          <p className="text-2xl font-bold text-blue-600">
            Rs. {prediction.predictedPrice.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            {prediction.marketTrend === 'up' ? (
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            ) : prediction.marketTrend === 'down' ? (
              <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
            ) : (
              <BarChart3 className="h-5 w-5 text-gray-600 mr-2" />
            )}
            <span className="text-sm text-gray-600">Price Change</span>
          </div>
          <span className={`text-sm font-medium ${
            prediction.priceChange > 0 ? 'text-green-600' : 
            prediction.priceChange < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {prediction.priceChange > 0 ? '+' : ''}{prediction.priceChange.toFixed(1)}%
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Predicted Demand</span>
          <span className="text-sm font-medium text-blue-600">
            {prediction.predictedDemand.toFixed(1)} units
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Confidence</span>
          <span className="text-sm font-medium text-green-600">
            {prediction.confidence.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Last updated: {new Date(prediction.lastUpdated).toLocaleString()}
        </p>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Recommendations</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          {prediction.priceChange > 5 && (
            <li>• Consider holding inventory for better prices</li>
          )}
          {prediction.priceChange < -5 && (
            <li>• Consider selling quickly to avoid losses</li>
          )}
          {prediction.predictedDemand > 100 && (
            <li>• High demand expected - stock up if possible</li>
          )}
          {prediction.confidence < 75 && (
            <li>• Low confidence - monitor market closely</li>
          )}
        </ul>
      </div>
    </div>
  );
}
