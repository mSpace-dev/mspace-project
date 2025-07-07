"use client";

import React, { useState, useEffect } from "react";
import CustomerUserProfile from '../../components/CustomerUserProfile';

export default function Alerts() {
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("customer");
    if (raw) {
      try {
        const cust = JSON.parse(raw);
        // Atlas-style Mongo IDs live in _id
        setCustomerId(cust._id);
      } catch (err) {
        console.error("Could not parse customer from localStorage", err);
      }
    }
  }, []);

  // Fetch existing subscriptions when customerId is available
  useEffect(() => {
    if (customerId) {
      fetchExistingSubscriptions();
    }
  }, [customerId]);

  const fetchExistingSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/alerts/subscriptions?userId=${customerId}`);
      const data = await response.json();
      
      if (data.success && data.subscriptions) {
        // Update subscriptions state with existing data
        const existingSubscriptions = data.subscriptions;
        setSubscriptions(prev => {
          const updated = { ...prev };
          existingSubscriptions.forEach((sub: any) => {
            if (updated[sub.type as SubscriptionKey]) {
              updated[sub.type as SubscriptionKey] = {
                subscribed: true,
                categories: sub.categories || [],
                crops: sub.crops || [],
                location: sub.location || '',
              };
            }
          });
          return updated;
        });
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToHome = () => {
    window.location.href = "/home";
  };

  type SubscriptionKey = "daily" | "priceChange" | "predicted";

  interface SubscriptionState {
    subscribed: boolean;
    categories: string[];
    crops: string[];
    location: string;
  }

  const initialState: SubscriptionState = {
    subscribed: false,
    categories: [],
    crops: [],
    location: "",
  };

  const [subscriptions, setSubscriptions] = useState<
    Record<SubscriptionKey, SubscriptionState>
  >({
    daily: { ...initialState },
    priceChange: { ...initialState },
    predicted: { ...initialState },
  });

  const boxes: { key: SubscriptionKey; label: string; description: string }[] =
    [
      {
        key: "daily",
        label: "Daily Price Alerts",
        description: "Receive daily summaries of crop prices.",
      },
      {
        key: "priceChange",
        label: "Price Changes & Events",
        description:
          "Get notified on significant price changes and special events.",
      },
      {
        key: "predicted",
        label: "Predicted Prices",
        description: "Alerts when predicted prices meet your criteria.",
      },
    ];

  const categoryOptions = ["Vegetables", "Fruits"];
  const cropMapping: Record<string, string[]> = {
    Vegetables: ["Beans", "Carrots", "Potatoes"],
    Fruits: ["Mangoes", "Bananas", "Apples"],
  };
  const locationOptions = ["Colombo", "Kandy", "Galle"];

  const addCategory = (key: SubscriptionKey, category: string) => {
    setSubscriptions((prev) => {
      const cats = prev[key].categories;
      if (cats.includes(category)) return prev;
      return {
        ...prev,
        [key]: { ...prev[key], categories: [...cats, category], crops: [] },
      };
    });
  };

  const removeCategory = (key: SubscriptionKey, category: string) => {
    setSubscriptions((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        categories: prev[key].categories.filter((c) => c !== category),
        crops: [],
      },
    }));
  };

  const addCrop = (key: SubscriptionKey, crop: string) => {
    setSubscriptions((prev) => {
      const prevCrops = prev[key].crops;
      let newCrops: string[] = [];
      if (crop === "Any") {
        newCrops = ["Any"];
      } else {
        newCrops = prevCrops.filter((c) => c !== "Any");
        if (!newCrops.includes(crop)) newCrops = [...newCrops, crop];
      }
      return { ...prev, [key]: { ...prev[key], crops: newCrops } };
    });
  };

  const removeCrop = (key: SubscriptionKey, crop: string) => {
    setSubscriptions((prev) => ({
      ...prev,
      [key]: { ...prev[key], crops: prev[key].crops.filter((c) => c !== crop) },
    }));
  };

  const handleLocationChange = (key: SubscriptionKey, value: string) => {
    setSubscriptions((prev) => ({
      ...prev,
      [key]: { ...prev[key], location: value },
    }));
  };

  const handleSubscribeToggle = async (key: SubscriptionKey) => {
    // if we haven't loaded a customerId yet, bail
    if (!customerId) {
      setMessage({ type: 'error', text: 'You must be logged in to manage alerts.' });
      setTimeout(() => {
        window.location.href = "/customer";
      }, 2000);
      return;
    }

    const sub = subscriptions[key];
    
    if (!sub.subscribed) {
      // Check if already subscribed (extra safety check)
      try {
        const checkResponse = await fetch(`/api/alerts/subscriptions?userId=${customerId}`);
        const checkData = await checkResponse.json();
        
        if (checkData.success && checkData.subscriptions) {
          const existingSubscription = checkData.subscriptions.find((s: any) => s.type === key);
          if (existingSubscription) {
            setMessage({ 
              type: 'info', 
              text: `You have already subscribed to ${boxes.find(b => b.key === key)?.label}!` 
            });
            // Update local state to reflect the existing subscription
            setSubscriptions(prev => ({
              ...prev,
              [key]: {
                subscribed: true,
                categories: existingSubscription.categories || [],
                crops: existingSubscription.crops || [],
                location: existingSubscription.location || '',
              }
            }));
            return;
          }
        }
      } catch (error) {
        console.error('Error checking existing subscriptions:', error);
      }

      // Proceed with subscription
      const payload = {
        userId: customerId,
        type: key,
        options: {
          categories: sub.categories,
          crops: sub.crops,
          location: sub.location,
        },
      };
      
      try {
        const res = await fetch("/api/alerts/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        
        if (data.success) {
          setSubscriptions((prev) => ({
            ...prev,
            [key]: { ...prev[key], subscribed: true },
          }));
          setMessage({ 
            type: 'success', 
            text: `Successfully subscribed to ${boxes.find(b => b.key === key)?.label}!` 
          });
        } else {
          setMessage({ 
            type: 'error', 
            text: `Failed to subscribe to ${boxes.find(b => b.key === key)?.label}. Please try again.` 
          });
        }
      } catch (error) {
        setMessage({ 
          type: 'error', 
          text: `Error subscribing to ${boxes.find(b => b.key === key)?.label}. Please try again.` 
        });
      }
    } else {
      // Unsubscribe
      try {
        const res = await fetch(
          `/api/alerts/unsubscribe?type=${encodeURIComponent(
            key
          )}&userId=${encodeURIComponent(customerId)}`,
          { method: "DELETE" }
        );
        const data = await res.json();
        
        if (data.success) {
          setSubscriptions((prev) => ({ ...prev, [key]: initialState }));
          setMessage({ 
            type: 'success', 
            text: `Successfully unsubscribed from ${boxes.find(b => b.key === key)?.label}!` 
          });
        } else {
          setMessage({ 
            type: 'error', 
            text: `Failed to unsubscribe from ${boxes.find(b => b.key === key)?.label}. Please try again.` 
          });
        }
      } catch (error) {
        setMessage({ 
          type: 'error', 
          text: `Error unsubscribing from ${boxes.find(b => b.key === key)?.label}. Please try again.` 
        });
      }
    }
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div
              className="flex items-center cursor-pointer"
              onClick={navigateToHome}
            >
              <h1 className="text-2xl font-bold text-green-700 hover:text-green-600">
                AgriLink
              </h1>
              <span className="ml-2 text-sm text-gray-500">Sri Lanka</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/prices" className="text-gray-700 hover:text-green-600">
                Prices
              </a>
              <a
                href="/alerts"
                className="text-gray-700 hover:text-green-600 font-medium"
              >
                Alerts
              </a>
              <a
                href="/demandforecast"
                className="text-gray-700 hover:text-green-600"
              >
                Forecasts
              </a>
              <CustomerUserProfile 
                isLoggedIn={true} 
                userRole="customer"
                userName="Customer"
                userEmail="customer@example.com"
              />
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-6xl font-bold text-green-700 mb-8 text-center">
          Price Alerts
        </h1>
        <p className="text-gray-600 text-lg text-center max-w-2xl mx-auto mb-8">
          Choose your options, then Subscribe.
        </p>

        {/* Message Display */}
        {message && (
          <div className={`max-w-2xl mx-auto mb-8 p-4 rounded-lg text-center ${
            message.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
            message.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' :
            'bg-blue-100 border border-blue-400 text-blue-700'
          }`}>
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center mb-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="text-gray-600 mt-2">Loading your subscriptions...</p>
          </div>
        )}

        {/* Subscribed Services Summary */}
        {!loading && customerId && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold text-green-700 mb-2">Your Active Subscriptions</h3>
            {Object.entries(subscriptions).some(([, sub]) => sub.subscribed) ? (
              <ul className="space-y-2">
                {Object.entries(subscriptions).map(([key, sub]) => 
                  sub.subscribed && (
                    <li key={key} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-green-800 font-medium">
                        {boxes.find(b => b.key === key)?.label}
                      </span>
                      <span className="text-sm text-green-600">
                        {sub.location} - {sub.categories.join(', ')} - {sub.crops.join(', ')}
                      </span>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p className="text-gray-500">No active subscriptions</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {boxes.map(({ key, label, description }) => {
            const subs = subscriptions[key];
            // compute available crops
            let availableCrops: string[] = [];
            subs.categories.forEach((cat) => {
              availableCrops.push(...(cropMapping[cat] || []));
            });
            availableCrops = Array.from(new Set(["Any", ...availableCrops]));

            return (
              <div
                key={key}
                className={`bg-white rounded-2xl shadow-lg p-6 flex flex-col relative ${
                  subs.subscribed ? 'border-2 border-green-400' : ''
                }`}
              >
                {/* Subscription Status Badge */}
                {subs.subscribed && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    ✓ Subscribed
                  </div>
                )}
                
                <h2 className="text-2xl font-semibold text-green-700 mb-2 pr-20">
                  {label}
                </h2>
                <p className="text-gray-600 mb-4">{description}</p>
                {/* Category selector */}
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Category</label>
                  <div className="flex space-x-2 items-center">
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) addCategory(key, e.target.value);
                        e.target.value = "";
                      }}
                      className="w-full bg-white text-gray-400 border-gray-300 rounded-lg p-2 focus:ring-green-300 focus:outline-none"
                    >
                      <option value="" disabled className="text-gray-400">
                        Select category
                      </option>
                      {categoryOptions
                        .filter((opt) => !subs.categories.includes(opt))
                        .map((opt) => (
                          <option
                            key={opt}
                            value={opt}
                            className="text-gray-800"
                          >
                            {opt}
                          </option>
                        ))}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      {subs.categories.map((cat) => (
                        <span
                          key={cat}
                          className="bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center"
                        >
                          {cat}
                          <button
                            onClick={() => removeCategory(key, cat)}
                            className="ml-1 text-green-600 hover:text-green-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Crop selector */}
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Crop Type</label>
                  <div className="flex space-x-2 items-center">
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) addCrop(key, e.target.value);
                        e.target.value = "";
                      }}
                      className="w-full bg-white text-gray-400 border-gray-300 rounded-lg p-2 focus:ring-green-300 focus:outline-none"
                      disabled={subs.categories.length === 0}
                    >
                      <option value="" disabled>
                        {subs.categories.length === 0
                          ? "Select category first"
                          : "Select crop"}
                      </option>
                      {availableCrops
                        .filter((opt) => !subs.crops.includes(opt))
                        .map((opt) => (
                          <option
                            key={opt}
                            value={opt}
                            className="text-gray-800"
                          >
                            {opt}
                          </option>
                        ))}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      {subs.crops.map((crop) => (
                        <span
                          key={crop}
                          className="bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center"
                        >
                          {crop}
                          <button
                            onClick={() => removeCrop(key, crop)}
                            className="ml-1 text-green-600 hover:text-green-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Location & Subscribe */}
                <div className="mt-auto">
                  <label className="block text-gray-700 mb-1">Location</label>
                  <select
                    value={subs.location}
                    onChange={(e) => handleLocationChange(key, e.target.value)}
                    className="w-full bg-white text-gray-400 border-gray-300 rounded-lg p-2 focus:ring-green-300 focus:outline-none"
                  >
                    <option value="">Select Location</option>
                    {locationOptions.map((loc) => (
                      <option key={loc} value={loc} className="text-gray-800">
                        {loc}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleSubscribeToggle(key)}
                    disabled={
                      !(
                        subs.categories.length &&
                        subs.crops.length &&
                        subs.location
                      )
                    }
                    className={`${
                      subs.subscribed
                        ? "bg-red-500 hover:bg-red-400"
                        : "bg-green-600 hover:bg-green-500"
                    } text-white py-2 px-4 rounded-lg w-full transition-colors disabled:opacity-50`}
                  >
                    {subs.subscribed ? "Unsubscribe" : "Subscribe"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
