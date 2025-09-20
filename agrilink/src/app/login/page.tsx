'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setCustomerAuth } from '../../lib/clientAuth';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(''); // Removed unused error variable
  const [success, setSuccess] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  useEffect(() => {
    // Get role from URL parameters
    const role = searchParams.get('role');
    if (role) {
      setSelectedRole(role);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    // Redirect to Google OAuth
    window.location.href = '/api/auth/signin/google?callbackUrl=/home';
  };

  const tryAdminLogin = async () => {
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
      return true;
    }
    return false;
  };

  const trySellerLogin = async () => {
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
      return true;
    }
    return false;
  };

  const tryCustomerLogin = async () => {
    const customerResponse = await fetch('/api/customer/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (customerResponse.ok) {
      const customerData = await customerResponse.json();
      
      // Check if the response includes a JWT token
      if (customerData.token && customerData.customer) {
        // Use new JWT-based authentication
        setCustomerAuth(customerData.token, {
          customerId: customerData.customer._id || customerData.customer.customerId,
          name: customerData.customer.name,
          email: customerData.customer.email,
          phone: customerData.customer.phone,
          district: customerData.customer.district,
          province: customerData.customer.province
        });
        
        setSuccess(customerData.message);
        setTimeout(() => {
          router.push('/customer/dashboard');
        }, 1000);
      } else {
        // Fallback to old system if no token
        localStorage.setItem('customer', JSON.stringify(customerData.customer));
        setSuccess(customerData.message);
        setTimeout(() => {
          router.push('/customer/dashboard');
        }, 1000);
      }
      return true;
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // If role is specified, try role-specific login first
      if (selectedRole === 'customer') {
        const success = await tryCustomerLogin();
        if (success) return;
      } else if (selectedRole === 'seller') {
        const success = await trySellerLogin();
        if (success) return;
      } else if (selectedRole === 'admin') {
        const success = await tryAdminLogin();
        if (success) return;
      }

      // If no role specified or role-specific login failed, try all in order
      if (!selectedRole) {
        // Try admin login first
        const adminSuccess = await tryAdminLogin();
        if (adminSuccess) return;

        // Try seller login
        const sellerSuccess = await trySellerLogin();
        if (sellerSuccess) return;

        // Try customer login
        const customerSuccess = await tryCustomerLogin();
        if (customerSuccess) return;
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
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/80" />
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-green-900/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-green-800/3 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/40 backdrop-blur-sm border-b border-green-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer" onClick={() => window.location.href = '/home'}>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-green-100 to-green-200 bg-clip-text text-transparent hover:from-green-200 hover:to-green-300 transition-all duration-300">
                AgriLink
              </h1>
              
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-md mx-auto py-12 px-4">
        <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-green-500/10 border border-green-500/20 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-green-100 to-green-200 bg-clip-text text-transparent mb-2">
              Welcome Back to AgriLink!
            </h2>
            <p className="text-gray-400">Sign in to your AgriLink account</p>
            <p className="text-gray-400">Don&apos;t have an account?</p>
            {selectedRole && (
              <div className="mt-3 inline-flex items-center px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <span className="text-green-400 text-sm font-medium">
                  Signing in as: {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                placeholder="Enter your password"
              />
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-600 bg-gray-800 rounded"
                />
                <span className="ml-2 text-sm text-gray-300">Remember me</span>
              </label>
              <a
                href="/auth/forgot-password"
                className="text-sm text-green-400 hover:text-green-300 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-green-800 disabled:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">or</span>
              </div>
            </div>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          {/* Signup Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <a
                href="/signup"
                className="text-green-400 hover:text-green-300 transition-colors font-medium underline underline-offset-2 decoration-green-400/50 hover:decoration-green-300"
              >
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
