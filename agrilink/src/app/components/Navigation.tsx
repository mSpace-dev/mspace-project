"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigateToHome = () => {
    router.push('/home');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center cursor-pointer" onClick={navigateToHome}>
            <h1 className="text-2xl font-bold text-green-700 hover:text-green-600 transition-colors">
              AgriLink
            </h1>
            <span className="ml-2 text-sm text-gray-500">Sri Lanka</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/prices" className="text-gray-700 hover:text-green-600 transition-colors">
              Prices
            </a>
            <a href="/alerts" className="text-gray-700 hover:text-green-600 transition-colors">
              Alerts
            </a>
            <a href="/demandforecast" className="text-gray-700 hover:text-green-600 transition-colors">
              Forecasts
            </a>
            <a href="/customer" className="btn-agrilink text-white px-4 py-2 rounded-lg">
              Log In
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-green-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <a href="/prices" className="text-gray-700 hover:text-green-600 transition-colors">
                Prices
              </a>
              <a href="/alerts" className="text-gray-700 hover:text-green-600 transition-colors">
                Alerts
              </a>
              <a href="/demandforecast" className="text-gray-700 hover:text-green-600 transition-colors">
                Forecasts
              </a>
              <a href="/customer" className="btn-agrilink text-white px-4 py-2 rounded-lg text-center">
                Log In
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
