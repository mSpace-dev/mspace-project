'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, DollarSign, Bell, TrendingUp, ShoppingCart, Package } from 'lucide-react';
import CustomerNavBar from '../../../components/CustomerNavBar';
import ImageUpload from '../../../components/ImageUpload';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  district: string;
  province: string;
  profileImage?: string;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Customer>>({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCustomerProfile();
  }, [router]);

  const fetchCustomerProfile = async () => {
    try {
      // Check if customer is logged in - support both new and old systems
      let customerData = localStorage.getItem('customerData'); // New JWT system
      let parsedCustomer;
      let customerId;

      if (customerData) {
        // New JWT-based authentication system
        parsedCustomer = JSON.parse(customerData);
        customerId = parsedCustomer.customerId;
      } else {
        // Fallback to old authentication system
        const oldCustomerData = localStorage.getItem('customer');
        if (!oldCustomerData) {
          router.push('/login');
          return;
        }
        parsedCustomer = JSON.parse(oldCustomerData);
        customerId = parsedCustomer._id;
      }

      if (!customerId) {
        console.error('No customer ID found');
        router.push('/login');
        return;
      }

      // Fetch fresh customer data from database
      const response = await fetch(`/api/customer/profile?id=${customerId}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setCustomer(data.customer);
        // Update localStorage with fresh data for both systems
        if (localStorage.getItem('customerData')) {
          // Update new system
          const currentData = JSON.parse(localStorage.getItem('customerData')!);
          localStorage.setItem('customerData', JSON.stringify({
            ...currentData,
            name: data.customer.name,
            email: data.customer.email,
            phone: data.customer.phone,
            district: data.customer.district,
            province: data.customer.province
          }));
        } else {
          // Update old system
          localStorage.setItem('customer', JSON.stringify(data.customer));
        }
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

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setIsEditing(false);
      setEditFormData({});
      setProfileImageFile(null);
      setProfileImagePreview(null);
    } else {
      // Start editing
      setIsEditing(true);
      setEditFormData({
        name: customer?.name || '',
        phone: customer?.phone || '',
        district: customer?.district || '',
        province: customer?.province || '',
      });
      setProfileImagePreview(customer?.profileImage || null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (file: File | null, previewUrl: string | null) => {
    setProfileImageFile(file);
    setProfileImagePreview(previewUrl);
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSaveProfile = async () => {
    if (!customer) return;

    setUpdateLoading(true);
    setError(null);

    try {
      let profileImageData = customer.profileImage;

      // Convert image to base64 if a new image was selected
      if (profileImageFile) {
        profileImageData = await convertImageToBase64(profileImageFile);
      }

      const updateData = {
        ...editFormData,
        profileImage: profileImageData
      };

      const response = await fetch(`/api/customer/profile?id=${customer._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCustomer(data.customer);
        setIsEditing(false);
        setEditFormData({});
        setProfileImageFile(null);
        setProfileImagePreview(null);

        // Update localStorage with new data
        if (localStorage.getItem('customerData')) {
          const currentData = JSON.parse(localStorage.getItem('customerData')!);
          localStorage.setItem('customerData', JSON.stringify({
            ...currentData,
            name: data.customer.name,
            phone: data.customer.phone,
            district: data.customer.district,
            province: data.customer.province
          }));
        } else {
          localStorage.setItem('customer', JSON.stringify(data.customer));
        }
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
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
      {/* Navigation Bar */}
      <CustomerNavBar 
        customer={{
          name: customer.name,
          email: customer.email,
          profileImage: customer.profileImage
        }}
      />


      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-green-700">Profile Information</h2>
              <button
                onClick={isEditing ? handleSaveProfile : handleEditToggle}
                disabled={updateLoading}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isEditing 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                }`}
                title={isEditing ? "Save changes" : "Edit profile"}
              >
                {updateLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : isEditing ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </>
                )}
              </button>
            </div>

            {isEditing && (
              <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-medium">
                  Edit Mode: Make your changes and click Save to update your profile.
                </p>
              </div>
            )}

            {/* Profile Image Section */}
            <div className="mb-6 text-center">
              <div className="relative inline-block">
                {customer.profileImage || profileImagePreview ? (
                  <img
                    src={profileImagePreview || customer.profileImage}
                    alt={customer.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-green-200 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center border-4 border-green-200 shadow-lg">
                    <span className="text-white text-2xl font-bold">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {isEditing && (
                  <div className="absolute -bottom-2 -right-2">
                    <div className="bg-green-600 rounded-full p-2 shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="mt-4">
                  <ImageUpload
                    onImageSelect={handleImageSelect}
                    currentImage={customer.profileImage}
                    className="max-w-xs mx-auto"
                  />
                </div>
              )}
            </div>

            {/* Profile Fields */}
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{customer.name}</p>
                )}
              </div>

              {/* Email Field (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-gray-600 py-2 text-sm">
                  {customer.email}
                  {isEditing && (
                    <span className="ml-2 text-xs text-gray-400">(Cannot be changed)</span>
                  )}
                </p>
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Contact Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{customer.phone}</p>
                )}
              </div>

              {/* District Field */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">District</label>
                {isEditing ? (
                  <select
                    name="district"
                    value={editFormData.district || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                  >
                    <option value="">Select District</option>
                    <option value="Colombo">Colombo</option>
                    <option value="Gampaha">Gampaha</option>
                    <option value="Kalutara">Kalutara</option>
                    <option value="Kandy">Kandy</option>
                    <option value="Matale">Matale</option>
                    <option value="Nuwara Eliya">Nuwara Eliya</option>
                    <option value="Galle">Galle</option>
                    <option value="Matara">Matara</option>
                    <option value="Hambantota">Hambantota</option>
                    <option value="Jaffna">Jaffna</option>
                    <option value="Kilinochchi">Kilinochchi</option>
                    <option value="Mannar">Mannar</option>
                    <option value="Vavuniya">Vavuniya</option>
                    <option value="Mullaitivu">Mullaitivu</option>
                    <option value="Batticaloa">Batticaloa</option>
                    <option value="Ampara">Ampara</option>
                    <option value="Trincomalee">Trincomalee</option>
                    <option value="Kurunegala">Kurunegala</option>
                    <option value="Puttalam">Puttalam</option>
                    <option value="Anuradhapura">Anuradhapura</option>
                    <option value="Polonnaruwa">Polonnaruwa</option>
                    <option value="Badulla">Badulla</option>
                    <option value="Moneragala">Moneragala</option>
                    <option value="Ratnapura">Ratnapura</option>
                    <option value="Kegalle">Kegalle</option>
                  </select>
                ) : (
                  <p className="text-black py-2">{customer.district}</p>
                )}
              </div>

              {/* Province Field */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Province</label>
                {isEditing ? (
                  <select
                    name="province"
                    value={editFormData.province || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select Province</option>
                    <option value="Western">Western</option>
                    <option value="Central">Central</option>
                    <option value="Southern">Southern</option>
                    <option value="Northern">Northern</option>
                    <option value="Eastern">Eastern</option>
                    <option value="North Western">North Western</option>
                    <option value="North Central">North Central</option>
                    <option value="Uva">Uva</option>
                    <option value="Sabaragamuwa">Sabaragamuwa</option>
                  </select>
                ) : (
                  <p className="text-gray-900 py-2">{customer.province}</p>
                )}
              </div>

              {/* Last Updated */}
              {customer.updatedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                  <p className="text-gray-600 text-sm py-2">
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

            {/* Cancel Button (only shown in edit mode) */}
            {isEditing && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleEditToggle}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel Changes
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-green-700 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a
                href="/prices"
                className="flex items-center w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
              >
                <DollarSign className="h-5 w-5 mr-2" />
                View Current Prices
              </a>
              <a
                href="/alerts"
                className="flex items-center w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
              >
                <Bell className="h-5 w-5 mr-2" />
                Manage Price Alerts
              </a>
              <a
                href="/demandforecast"
                className="flex items-center w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Demand Forecasting
              </a>
              <a
                href="/products"
                className="flex items-center w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Browse Products
              </a>
              <a
                href="/customer/cart"
                className="flex items-center w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                View Cart
              </a>
              <a
                href="/customer/orders"
                className="flex items-center w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200"
              >
                <Package className="h-5 w-5 mr-2" />
                My Orders
              </a>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
        </div>
      </main>
    </div>
  );
}
