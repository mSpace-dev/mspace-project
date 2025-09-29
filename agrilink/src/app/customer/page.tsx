'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import LocationPicker from '@/components/LocationPicker';
import ImageUpload from '@/components/ImageUpload';

export default function CustomerPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    district: '',
    province: '',
    latitude: '',
    longitude: '',
    address: '',
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string; district?: string; province?: string }) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
      address: location.address,
      district: location.district || prev.district,
      province: location.province || prev.province,
    }));
  };

  const handleImageSelect = (file: File | null, previewUrl: string | null) => {
    setProfileImage(file);
    setProfileImagePreview(previewUrl);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'profiles');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      } else {
        console.error('Image upload failed');
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Upload profile image if selected
      let profileImageUrl = null;
      if (profileImage) {
        profileImageUrl = await uploadImage(profileImage);
        if (!profileImageUrl) {
          setError('Failed to upload profile image. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Prepare registration data
      const registrationData = {
        ...formData,
        profileImage: profileImageUrl
      };

      const response = await fetch('/api/customer/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(data.message);
      
      // Auto-login the user after successful registration
      try {
        const loginResponse = await fetch('/api/customer/login', {
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
          if (loginData.token && loginData.customer) {
            // Use JWT-based authentication for customers
            const { setCustomerAuth } = await import('../../lib/clientAuth');
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
        } else {
          // If auto-login fails, redirect to login page
          router.push('/login?message=Registration successful. Please login.');
        }
      } catch (loginError) {
        console.error('Auto-login error:', loginError);
        // If auto-login fails, redirect to login page
        router.push('/login?message=Registration successful. Please login.');
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6 bg-gray-900 p-8 rounded-xl border border-gray-800">
        {/* App Logo/Icon */}
        <div className="text-center mb-6">
          <button
            type="button"
            onClick={() => router.push('/home')}
            className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span className="text-xl font-bold">AgriLink</span>
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Customer Account
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

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+94771234567"
            />
          </div>

          {/* Location Selection Toggle */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Location Information</h3>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600 px-4 py-2 rounded-lg transition-colors"
              >
                {showMap ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Use Dropdown
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-400">Select Location</span>
                  </>
                )}
              </button>
            </div>

            {showMap ? (
              <div className="space-y-4">
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  className="w-full"
                />
                
                {formData.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Selected Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300"
                    />
                  </div>
                )}
              </div>
            ) : (
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
            )}
          </div>

          {/* Profile Image Upload */}
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-medium text-white mb-4">Profile Image (Optional)</h3>
            <ImageUpload
              onImageSelect={handleImageSelect}
              currentImage={profileImagePreview}
              className="w-full"
            />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start gap-3 pt-4">
            <input
              type="checkbox"
              id="agreeToTerms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              required
              className="mt-1 w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
            />
            <label htmlFor="agreeToTerms" className="text-sm text-gray-300">
              I agree to the{' '}
              <a
                href="/terms"
                target="_blank"
                className="text-green-400 hover:text-green-300 underline"
              >
                Terms and Conditions
              </a>
              {' '}and{' '}
              <a
                href="/privacy"
                target="_blank"
                className="text-green-400 hover:text-green-300 underline"
              >
                Privacy Policy
              </a>
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading || !agreeToTerms}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
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
  );
}
