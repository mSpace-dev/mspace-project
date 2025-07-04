'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Try admin login first
      const adminResponse = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        setSuccess(adminData.message);
        
        // Store both admin data and tokens
        localStorage.setItem('admin', JSON.stringify(adminData.admin));
        localStorage.setItem('adminAccessToken', adminData.accessToken);
        localStorage.setItem('adminRefreshToken', adminData.refreshToken);
        
        setTimeout(() => {
          router.push('/admin');
        }, 1000);
        return;
      }

      // Try seller login
      const sellerResponse = await fetch('/api/seller/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (sellerResponse.ok) {
        const sellerData = await sellerResponse.json();
        setSuccess(sellerData.message);
        localStorage.setItem('seller', JSON.stringify(sellerData.seller));
        setTimeout(() => {
          router.push('/seller/dashboard');
        }, 1000);
        return;
      }

      // Try customer login
      const customerResponse = await fetch('/api/customer/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (customerResponse.ok) {
        const customerData = await customerResponse.json();
        setSuccess(customerData.message);
        localStorage.setItem('customer', JSON.stringify(customerData.customer));
        setTimeout(() => {
          router.push('/customer/dashboard');
        }, 1000);
        return;
      }

      // If all login attempts fail
      throw new Error('Invalid email or password. Please check your credentials.');

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer" onClick={() => window.location.href = '/home'}>
              <h1 className="text-2xl font-bold text-green-700 hover:text-green-600 transition-colors">AgriLink</h1>
              <span className="ml-2 text-sm text-gray-500">Login Portal</span>
            </div>
            <a
              href="/home"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-green-700 mb-2">
              Welcome Back!
            </h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center space-y-2">
            <p className="text-gray-600 text-sm">Don't have an account?</p>
            <div className="flex justify-center space-x-4">
              <a
                href="/customer"
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                Register as Customer
              </a>
              <span className="text-gray-400">•</span>
              <a
                href="/seller"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Register as Seller
              </a>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
