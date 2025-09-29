"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CustomerUserProfile from "../../components/CustomerUserProfile";
import { checkAuthAndLogout, CustomerData, addAuthEventListener, AUTH_EVENTS } from "../../lib/clientAuth";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [seller, setSeller] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  // Check if user is logged in and handle token expiration
  useEffect(() => {
    const checkAuth = () => {
      try {
        const { isAuthenticated, customerData } = checkAuthAndLogout();
        setCustomer(isAuthenticated ? customerData : null);
        
        // Check for seller authentication
        const sellerData = localStorage.getItem("seller");
        if (sellerData) {
          setSeller(JSON.parse(sellerData));
        } else {
          setSeller(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setCustomer(null);
        setSeller(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial auth check
    checkAuth();
    
    // Set up periodic token check (every 5 minutes)
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    
    // Listen for authentication events from other tabs/components
    const removeAuthListener = addAuthEventListener((eventType, data) => {
      switch (eventType) {
        case AUTH_EVENTS.LOGIN:
          if (data?.customerData) {
            setCustomer(data.customerData);
          } else {
            // Re-check auth state if data not provided
            checkAuth();
          }
          break;
        case AUTH_EVENTS.LOGOUT:
        case AUTH_EVENTS.TOKEN_EXPIRED:
          setCustomer(null);
          break;
      }
    });
    
    return () => {
      clearInterval(interval);
      removeAuthListener();
    };
  }, []);

  // Update cart count
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      setCartCount(cart.length);
    };
    
    updateCartCount();
    // Update cart count every second to reflect changes
    const interval = setInterval(updateCartCount, 1000);
    
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
            {seller ? (
              // Seller Navigation
              <>
                <a href="/seller/dashboard" className="text-gray-700 hover:text-green-600 transition-colors">
                  Dashboard
                </a>
                <a href="/seller/my-orders" className="text-gray-700 hover:text-green-600 transition-colors">
                  My Orders
                </a>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Welcome, {seller.name}</span>
                  <button
                    onClick={() => {
                      localStorage.removeItem("seller");
                      setSeller(null);
                      router.push("/");
                    }}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              // Customer Navigation
              <>
                <a href="/about" className="text-gray-700 hover:text-green-600 transition-colors">
                  About
                </a>
                <a href="/products" className="text-gray-700 hover:text-green-600 transition-colors">
                  Products
                </a>
                <a href="/shop" className="text-gray-700 hover:text-green-600 transition-colors">
                  Shop
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
                <button onClick={() => router.push('/customer/orders')} className="relative text-gray-700 hover:text-green-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5-5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
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
              </>
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
              {seller ? (
                // Seller Mobile Navigation
                <>
                  <a href="/seller/dashboard" className="text-gray-700 hover:text-green-600 transition-colors">
                    Dashboard
                  </a>
                  <a href="/seller/my-orders" className="text-gray-700 hover:text-green-600 transition-colors">
                    My Orders
                  </a>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Welcome, {seller.name}</span>
                      <button
                        onClick={() => {
                          localStorage.removeItem("seller");
                          setSeller(null);
                          router.push("/");
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-red-600 hover:text-red-700 text-sm px-3 py-1 border border-red-300 rounded"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // Customer Mobile Navigation
                <>
                  <a href="/about" className="text-gray-700 hover:text-green-600 transition-colors">
                    About
                  </a>
                  <a href="/products" className="text-gray-700 hover:text-green-600 transition-colors">
                    Products
                  </a>
                  <a href="/shop" className="text-gray-700 hover:text-green-600 transition-colors">
                    Shop
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
                  <button onClick={() => { router.push('/customer/orders'); setIsMobileMenuOpen(false); }} className="relative text-gray-700 hover:text-green-600 transition-colors flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5-5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    Cart
                    {cartCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </button>
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
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
