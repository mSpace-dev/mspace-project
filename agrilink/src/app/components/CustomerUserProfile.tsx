'use client';

import React, { useState } from 'react';

interface CustomerUserProfileProps {
  isLoggedIn: boolean;
  userRole: string;
  userName: string;
  userEmail: string;
}

const CustomerUserProfile: React.FC<CustomerUserProfileProps> = ({
  isLoggedIn,
  userRole,
  userName,
  userEmail
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="flex space-x-4">
        <a 
          href="/login" 
          className="text-gray-700 hover:text-green-600 transition-colors"
        >
          Login
        </a>
        <a 
          href="/register" 
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Register
        </a>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
      >
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium">{userName}</div>
          <div className="text-xs text-gray-500">{userRole}</div>
        </div>
        <svg 
          className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-900">{userName}</div>
            <div className="text-sm text-gray-500">{userEmail}</div>
          </div>
          
          <div className="py-1">
            {userRole === 'customer' && (
              <>
                <a
                  href="/customer/dashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Dashboard
                </a>
                <a
                  href="/customer/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </a>
                <a
                  href="/customer/price-alerts"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Price Alerts
                </a>
                <a
                  href="/customer/cart"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cart
                </a>
              </>
            )}
            
            {userRole === 'seller' && (
              <>
                <a
                  href="/seller/dashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Seller Dashboard
                </a>
                <a
                  href="/seller/products"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  My Products
                </a>
                <a
                  href="/seller/analytics"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Analytics
                </a>
              </>
            )}
            
            {userRole === 'admin' && (
              <a
                href="/admin"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Admin Panel
              </a>
            )}
            
            <div className="border-t border-gray-200"></div>
            <button
              onClick={() => {
                // Handle logout
                localStorage.removeItem('customer');
                localStorage.removeItem('seller');
                localStorage.removeItem('admin');
                window.location.href = '/';
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerUserProfile;
