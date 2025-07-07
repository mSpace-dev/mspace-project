"use client";

import { useState } from "react";
import CustomerUserProfile from "../../../components/CustomerUserProfile";

export default function CustomerSettings() {
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    priceAlerts: true,
    demandForecastAlerts: true,
    marketUpdates: true,
    newsletterSubscription: true,
    
    // Display Settings
    language: "English",
    currency: "LKR",
    timezone: "Asia/Colombo",
    dateFormat: "DD/MM/YYYY",
    priceDisplayUnit: "Per Kg",
    
    // Privacy Settings
    profileVisibility: "Public",
    dataSharing: false,
    analyticsTracking: true,
    
    // Account Settings
    twoFactorAuth: false,
    sessionTimeout: "30 minutes",
    autoLogout: true
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleSelectChange = (setting: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Settings saved:", settings);
    alert("Settings saved successfully!");
    setIsSaving(false);
  };

  const resetToDefaults = () => {
    if (confirm("Are you sure you want to reset all settings to default values?")) {
      setSettings({
        emailNotifications: true,
        smsNotifications: false,
        priceAlerts: true,
        demandForecastAlerts: true,
        marketUpdates: true,
        newsletterSubscription: true,
        language: "English",
        currency: "LKR",
        timezone: "Asia/Colombo",
        dateFormat: "DD/MM/YYYY",
        priceDisplayUnit: "Per Kg",
        profileVisibility: "Public",
        dataSharing: false,
        analyticsTracking: true,
        twoFactorAuth: false,
        sessionTimeout: "30 minutes",
        autoLogout: true
      });
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
            
            <div className="flex items-center space-x-6">
              <a href="/home" className="text-gray-700 hover:text-green-600 transition-colors">Home</a>
              <a href="/about" className="text-gray-700 hover:text-green-600 transition-colors">About</a>
              <a href="/prices" className="text-gray-700 hover:text-green-600 transition-colors">Prices</a>
              <a href="/contact" className="text-gray-700 hover:text-green-600 transition-colors">Contact</a>
              {customer ? (
                          <CustomerUserProfile 
                            isLoggedIn={true} 
                            userRole="customer"
                            userName={customer.name}
                            userEmail={customer.email}
                          />
                        ) : (
                          <a href="/login" className="text-gray-700 hover:text-green-600 transition-colors">Login</a>
                        )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Configure your preferences and account settings</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {/* Notification Settings */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Email Notifications</label>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <button
                  onClick={() => handleToggle('emailNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.emailNotifications ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">SMS Notifications</label>
                  <p className="text-sm text-gray-500">Receive updates via SMS</p>
                </div>
                <button
                  onClick={() => handleToggle('smsNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.smsNotifications ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Price Alerts</label>
                  <p className="text-sm text-gray-500">Get notified when prices change</p>
                </div>
                <button
                  onClick={() => handleToggle('priceAlerts')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.priceAlerts ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.priceAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Demand Forecast Alerts</label>
                  <p className="text-sm text-gray-500">Updates on market demand predictions</p>
                </div>
                <button
                  onClick={() => handleToggle('demandForecastAlerts')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.demandForecastAlerts ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.demandForecastAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Market Updates</label>
                  <p className="text-sm text-gray-500">General market news and updates</p>
                </div>
                <button
                  onClick={() => handleToggle('marketUpdates')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.marketUpdates ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.marketUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Newsletter Subscription</label>
                  <p className="text-sm text-gray-500">Weekly agriculture newsletter</p>
                </div>
                <button
                  onClick={() => handleToggle('newsletterSubscription')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.newsletterSubscription ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.newsletterSubscription ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Display Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSelectChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="English">English</option>
                  <option value="Sinhala">Sinhala</option>
                  <option value="Tamil">Tamil</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleSelectChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="LKR">Sri Lankan Rupee (LKR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleSelectChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Asia/Colombo">Asia/Colombo (UTC+05:30)</option>
                  <option value="Asia/Dhaka">Asia/Dhaka (UTC+06:00)</option>
                  <option value="Asia/Karachi">Asia/Karachi (UTC+05:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Date Format</label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => handleSelectChange('dateFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Price Display Unit</label>
                <select
                  value={settings.priceDisplayUnit}
                  onChange={(e) => handleSelectChange('priceDisplayUnit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Per Kg">Per Kilogram</option>
                  <option value="Per Lb">Per Pound</option>
                  <option value="Per Quintal">Per Quintal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Profile Visibility</label>
                <select
                  value={settings.profileVisibility}
                  onChange={(e) => handleSelectChange('profileVisibility', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Public">Public</option>
                  <option value="Friends Only">Friends Only</option>
                  <option value="Private">Private</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Data Sharing</label>
                  <p className="text-sm text-gray-500">Share anonymized data for research</p>
                </div>
                <button
                  onClick={() => handleToggle('dataSharing')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.dataSharing ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.dataSharing ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Analytics Tracking</label>
                  <p className="text-sm text-gray-500">Help improve our services</p>
                </div>
                <button
                  onClick={() => handleToggle('analyticsTracking')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.analyticsTracking ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.analyticsTracking ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Two-Factor Authentication</label>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <button
                  onClick={() => handleToggle('twoFactorAuth')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.twoFactorAuth ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Session Timeout</label>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSelectChange('sessionTimeout', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="15 minutes">15 minutes</option>
                  <option value="30 minutes">30 minutes</option>
                  <option value="1 hour">1 hour</option>
                  <option value="2 hours">2 hours</option>
                  <option value="Never">Never</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Auto Logout</label>
                  <p className="text-sm text-gray-500">Automatically logout when inactive</p>
                </div>
                <button
                  onClick={() => handleToggle('autoLogout')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoLogout ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoLogout ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
          
          <button
            onClick={resetToDefaults}
            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Reset to Defaults
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-800">Need Help?</h3>
              <p className="text-sm text-blue-700 mt-1">
                If you need assistance with any settings, please contact our support team at support@agrilink.lk
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
