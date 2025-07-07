'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CustomerUserProfile from '../../../components/CustomerUserProfile';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  district: string;
  province: string;
  priceAlerts: {
    crop: string;
    maxPrice: number;
    minPrice: number;
    isActive: boolean;
  }[];
  createdAt: string;
  updatedAt?: string;
}

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCustomerProfile();
  }, [router]);

  const fetchCustomerProfile = async () => {
    try {
      // Check if customer is logged in
      const customerData = localStorage.getItem('customer');
      if (!customerData) {
        router.push('/customer');
        return;
      }

      const parsedCustomer = JSON.parse(customerData);
      const customerId = parsedCustomer._id;

      if (!customerId) {
        console.error('No customer ID found');
        router.push('/customer');
        return;
      }

      // Fetch fresh customer data from database
      const response = await fetch(`/api/customer/profile?id=${customerId}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setCustomer(data.customer);
        // Update localStorage with fresh data
        localStorage.setItem('customer', JSON.stringify(data.customer));
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch profile');
        console.error('Error fetching customer profile:', data.error);
        // If customer not found, redirect to login
        if (response.status === 404) {
          localStorage.removeItem('customer');
          router.push('/customer');
        }
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      setError('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customer');
    router.push('/home');
  };

  const navigateToHome = () => {
    router.push('/home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-700">{error}</p>
          </div>
          <button
            onClick={() => router.push('/customer')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center py-4">
      {/* Left - AgriLink logo */}
      <div className="flex items-center cursor-pointer" onClick={navigateToHome}>
        <h1 className="text-2xl font-bold text-green-700 hover:text-green-600 transition-colors">
          AgriLink
        </h1>
        <span className="ml-3 text-gray-600 hidden sm:inline">Customer Dashboard</span>
      </div>

      {/* Right - Profile section */}
      <div className="flex items-center space-x-3">
        <span className="text-gray-700 hidden sm:inline">Welcome, {customer.name}</span>
        <CustomerUserProfile 
          isLoggedIn={true} 
          userRole="customer"
          userName={customer.name}
          userEmail={customer.email}
        />
      </div>
    </div>
  </div>
</header>


      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-green-700">Profile Information</h2>
              <button
                onClick={fetchCustomerProfile}
                className="text-green-600 hover:text-green-800 transition-colors"
                title="Refresh profile"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">{customer.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{customer.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{customer.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">District</label>
                <p className="text-gray-900">{customer.district}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Province</label>
                <p className="text-gray-900">{customer.province}</p>
              </div>
              {customer.updatedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-gray-900 text-sm">
                    {new Date(customer.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a
                href="/prices"
                className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 px-4 rounded-lg font-medium transition duration-200"
              >
                View Current Prices
              </a>
              <a
                href="/alerts"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-lg font-medium transition duration-200"
              >
                Manage Price Alerts
              </a>
              <a
                href="/demandforecast"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-3 px-4 rounded-lg font-medium transition duration-200"
              >
                Demand Forecasting
              </a>
            </div>
          </div>
        </div>

        {/* Price Alerts Summary */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-green-700 mb-4">Price Alerts</h2>
          {customer.priceAlerts && customer.priceAlerts.length > 0 ? (
            <div className="space-y-3">
              {customer.priceAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{alert.crop}</p>
                    <p className="text-sm text-gray-600">
                      Min: Rs.{alert.minPrice} - Max: Rs.{alert.maxPrice}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {alert.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No price alerts set up yet</p>
              <a
                href="/alerts"
                className="text-green-600 hover:text-green-800 font-medium"
              >
                Set up your first price alert
              </a>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-green-700 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Account Created</p>
                <p className="text-sm text-gray-600">
                  {new Date(customer.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {customer.updatedAt && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Profile Updated</p>
                  <p className="text-sm text-gray-600">
                    {new Date(customer.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-blue-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
            {(!customer.priceAlerts || customer.priceAlerts.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>Set up price alerts to see more activity here</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
