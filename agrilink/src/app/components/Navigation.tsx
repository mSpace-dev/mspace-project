"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CustomerUserProfile from "../../components/CustomerUserProfile";
import { checkAuthAndLogout, CustomerData } from "../../lib/clientAuth";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in and handle token expiration
  useEffect(() => {
    const checkAuth = () => {
      try {
        const { isAuthenticated, customerData } = checkAuthAndLogout();
        setCustomer(isAuthenticated ? customerData : null);
      } catch (error) {
        console.error('Auth check failed:', error);
        setCustomer(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    
    // Set up periodic token check (every 5 minutes)
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

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
            <a href="/about" className="text-gray-700 hover:text-green-600 transition-colors">
              About
            </a>
            <a href="/products" className="text-gray-700 hover:text-green-600 transition-colors">
              Products
            </a>
            <a href="/our-team" className="text-gray-700 hover:text-green-600 transition-colors">
              Our Team
            </a>
            <a href="/partners" className="text-gray-700 hover:text-green-600 transition-colors">
              Partners
            </a>
            <a href="/contact" className="text-gray-700 hover:text-green-600 transition-colors">
              Contact
            </a>
            {customer ? (
              <CustomerUserProfile 
                isLoggedIn={true} 
                userRole="customer"
                userName={customer.name || 'Customer'}
                userEmail={customer.email || ''}
              />
            ) : (
              <a href="/login" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
                Login
              </a>
            )}
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
              <a href="/about" className="text-gray-700 hover:text-green-600 transition-colors">
                About
              </a>
              <a href="/products" className="text-gray-700 hover:text-green-600 transition-colors">
                Products
              </a>
              <a href="/our-team" className="text-gray-700 hover:text-green-600 transition-colors">
                Our Team
              </a>
              <a href="/partners" className="text-gray-700 hover:text-green-600 transition-colors">
                Partners
              </a>
              <a href="/contact" className="text-gray-700 hover:text-green-600 transition-colors">
                Contact
              </a>
              <div className="pt-2">
                {customer ? (
                  <CustomerUserProfile 
                    isLoggedIn={true} 
                    userRole="customer"
                    userName={customer.name || 'Customer'}
                    userEmail={customer.email || ''}
                  />
                ) : (
                  <a href="/login" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-center block">
                    Login
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
