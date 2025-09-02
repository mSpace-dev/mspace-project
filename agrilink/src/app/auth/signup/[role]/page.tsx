'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import PublicRoute from '@/components/auth/PublicRoute';

export default function EmailSignupPage() {
  const router = useRouter();
  const params = useParams();
  const role = params?.role as string;
  
  // Redirect sellers to dedicated seller signup page
  useEffect(() => {
    if (role === 'seller') {
      router.replace('/seller/signup');
      return;
    }
  }, [role, router]);

  // Show loading while redirecting sellers
  if (role === 'seller') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Redirecting...</div>
      </div>
    );
  }
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    district: '',
    province: '',
    // Seller specific fields
    businessName: '',
    businessType: '',
    address: '',
    licenseNumber: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = role === 'customer' ? '/api/customer/register' : '/api/seller/register';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Auto-login the user after successful registration
        try {
          const loginEndpoint = role === 'customer' ? '/api/customer/login' : '/api/seller/login';
          
          const loginResponse = await fetch(loginEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          });

          const loginData = await loginResponse.json();

          if (loginResponse.ok) {
            // Store auth data based on role
            if (role === 'customer') {
              if (loginData.token && loginData.customer) {
                // Use JWT-based authentication for customers
                const { setCustomerAuth } = await import('../../../../lib/clientAuth');
                setCustomerAuth(loginData.token, {
                  customerId: loginData.customer._id || loginData.customer.customerId,
                  name: loginData.customer.name,
                  email: loginData.customer.email,
                  phone: loginData.customer.phone,
                  district: loginData.customer.district,
                  province: loginData.customer.province
                });
                // Navigate to customer dashboard
                router.push('/customer/dashboard');
              } else {
                // Fallback to old system
                localStorage.setItem('customer', JSON.stringify(loginData.customer));
                router.push('/customer/dashboard');
              }
            } else if (role === 'seller') {
              // Store seller data
              localStorage.setItem('seller', JSON.stringify(loginData.seller));
              // Navigate to seller dashboard
              router.push('/seller/dashboard');
            }
          } else {
            // If auto-login fails, redirect to login page
            router.push(`/login?message=Registration successful. Please login.&role=${role}`);
          }
        } catch (loginError) {
          console.error('Auto-login error:', loginError);
          // If auto-login fails, redirect to login page
          router.push(`/login?message=Registration successful. Please login.&role=${role}`);
        }
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Moneragala', 'Ratnapura', 'Kegalle'
  ];

  const provinces = [
    'Western', 'Central', 'Southern', 'Northern', 'Eastern', 
    'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
  ];

  const businessTypes = [
    'Individual Farmer', 'Farm Cooperative', 'Agricultural Company',
    'Organic Farm', 'Livestock Farm', 'Mixed Farm', 'Other'
  ];

  return (
    <PublicRoute>
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 bg-gray-900 p-8 rounded-xl border border-gray-800">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Create {role === 'customer' ? 'Customer' : 'Seller'} Account
            </h1>
            <p className="text-gray-400">
              Fill in your details to get started
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common fields */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Confirm your password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
               Contact Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  District
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select District</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Province
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Province</option>
                  {provinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Seller specific fields */}
            {role === 'seller' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your business name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Business Type
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select Business Type</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Business Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your business address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    License Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter license number (if applicable)"
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <a
                href="/login"
                className="text-green-400 hover:text-green-300 transition-colors font-semibold"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}
