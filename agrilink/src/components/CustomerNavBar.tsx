'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CustomerUserProfile from './CustomerUserProfile';

interface CustomerNavBarProps {
  customer?: {
    name: string;
    email: string;
    profileImage?: string;
  };
}

export default function CustomerNavBar({ customer }: CustomerNavBarProps) {
  const [currentDate, setCurrentDate] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Update current date
    const updateDate = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    };

    updateDate();
    // Update date every minute
    const interval = setInterval(updateDate, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogoClick = () => {
    router.push('/home');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left Section - App Icon/Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              title="Go to Home"
            >
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-green-700 hover:text-green-600 transition-colors">
                AgriLink
              </h1>
            </button>
          </div>

          {/* Center Section - User Name and Date */}
          <div className="hidden md:flex items-center space-x-6">
            {customer && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-700 font-medium">Welcome, {customer.name}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-gray-600">
              <span className="text-sm">{currentDate}</span>
            </div>
          </div>

          {/* Right Section - Profile */}
          <div className="flex items-center space-x-3">
            {/* User Profile */}
            {customer && (
              <CustomerUserProfile 
                isLoggedIn={true} 
                userRole="customer"
                userName={customer.name}
                userEmail={customer.email}
                userAvatar={customer.profileImage}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile User Info - Only shown on small screens */}
      {customer && (
        <div className="md:hidden px-4 pb-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Welcome, {customer.name}</span>
            </div>
            <div className="text-xs text-gray-500">{currentDate}</div>
          </div>
        </div>
      )}
    </header>
  );
}
