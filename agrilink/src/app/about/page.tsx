'use client';

import { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';
import CustomerUserProfile from "../../components/CustomerUserProfile";
import { checkAuthAndLogout, CustomerData } from "../../lib/clientAuth";

export default function Products() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

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

  // Listen for the beforeinstallprompt event so we can trigger it later
  useEffect(() => {
    const handler = (e: any) => {
      // Prevent automatic prompt
      e.preventDefault();
      setDeferredPrompt(e);
      // Optionally, you could show an in-UI install CTA when this is fired
      console.log('beforeinstallprompt event captured');
    };

    const installedHandler = () => {
      // Clear saved prompt once installed
      setDeferredPrompt(null);
      console.log('PWA installed');
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);
    window.addEventListener('appinstalled', installedHandler as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
      window.removeEventListener('appinstalled', installedHandler as EventListener);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigateToHome = () => {
    window.location.href = '/home';
  };

  // Download handler: detect platform and open appropriate store or fallback
  // NOTE: The store URLs below are placeholders. Replace `playStoreUrl` and `appStoreUrl`
  // with the real Google Play and Apple App Store links once the app is published.
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.agrilink'; // TODO: replace with real app id
  const appStoreUrl = 'https://apps.apple.com/app/idXXXXXXXXX'; // TODO: replace with real app id
  const webFallbackUrl = 'https://agrilink.lk';

  const openUrl = (url: string) => {
    try {
      // open in new tab/window
      window.open(url, '_blank');
    } catch (e) {
      // fallback to same window
      window.location.href = url;
    }
  };

  const handleDownload = () => {
    trackEvent({ category: 'pwa', action: 'download_click' });
    // If the browser exposed the beforeinstallprompt event, use it to prompt
    if (deferredPrompt) {
      deferredPrompt.prompt();
      // Wait for the user's choice
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          trackEvent({ category: 'pwa', action: 'install_accepted' });
          console.log('User accepted the A2HS prompt');
        } else {
          trackEvent({ category: 'pwa', action: 'install_dismissed' });
          console.log('User dismissed the A2HS prompt');
        }
        // Clear the saved prompt since it can only be used once
        setDeferredPrompt(null);
      }).catch((err: any) => {
        console.warn('Error showing install prompt', err);
      });
      return;
    }

    // No install prompt available: fall back to store links or instructions
    if (typeof navigator === 'undefined') {
      openUrl(webFallbackUrl);
      return;
    }

    const ua = navigator.userAgent || '';
    // Android -> Play Store
    if (/android/i.test(ua)) {
      trackEvent({ category: 'pwa', action: 'open_playstore' });
      openUrl(playStoreUrl);
      return;
    }

    // iOS: cannot prompt programmatically; show quick instructions to add to Home Screen
    if (/iPhone|iPad|iPod/i.test(ua)) {
      // Try App Store first (if published), otherwise show instructions
      if (appStoreUrl.includes('idXXXXXXXXX')) {
        // App store placeholder — show instruction instead
        // Simple instructional fallback; you can replace with a nicer modal
        trackEvent({ category: 'pwa', action: 'ios_instruction_shown' });
        alert('To install AgriLink on iOS: open Safari, tap Share → Add to Home Screen.');
      } else {
        trackEvent({ category: 'pwa', action: 'open_appstore' });
        openUrl(appStoreUrl);
      }
      return;
    }

    // Desktop/unknown -> open web fallback (landing page)
    openUrl(webFallbackUrl);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer" onClick={navigateToHome}>
              <h1 className="text-2xl font-bold text-green-700 hover:text-green-600 transition-colors">AgriLink</h1>
              <span className="ml-2 text-sm text-gray-500">Sri Lanka</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/about" className="text-green-600 font-semibold">About</a>
              <a href="/products" className="text-gray-700 hover:text-green-600 transition-colors">Products</a>
              <a href="/our-team" className="text-gray-700 hover:text-green-600 transition-colors">Our Team</a>
              <a href="/partners" className="text-gray-700 hover:text-green-600 transition-colors">Partners</a>
              <a href="/contact" className="text-gray-700 hover:text-green-600 transition-colors">Contact</a>
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
                <a href="/about" className="text-green-600 font-semibold">About</a>
                <a href="/products" className="text-gray-700 hover:text-green-600 transition-colors">Products</a>
                <a href="/our-team" className="text-gray-700 hover:text-green-600 transition-colors">Our Team</a>
                <a href="/partners" className="text-gray-700 hover:text-green-600 transition-colors">Partners</a>
                <a href="/contact" className="text-gray-700 hover:text-green-600 transition-colors">Contact</a>
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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              A <span className="text-green-600">Farmer-Centric</span> App
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
              Designed for Sri Lankan farmers and agricultural stakeholders. Our platform offers a personalized 
              experience, focusing on each farmer's unique needs with integrated digital support and market insights.
            </p>
            <div className="flex justify-center">
              <div className="bg-white rounded-lg shadow-lg p-6 text-center max-w-md ">
                <div className="text-6xl mb-4">📱</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">AgriLink Mobile App</h3>
                <p className="text-gray-600 mb-4">Available on Android & iOS</p>
                <div className="flex justify-center space-x-4">
                  {/* Disabled on About page: show instructions below instead */}
                  <div
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm cursor-default opacity-95"
                    aria-hidden="true"
                  >
                    📱 Download App
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to install PWA (guidelines) */}
      <section className="py-8 px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">How to install AgriLink on your device</h3>
          <p className="text-gray-600 mb-6">The app on this page is a Progressive Web App (PWA). Follow the steps below to add it to your home screen.</p>
          <div className="grid md:grid-cols-2 gap-25 text-left">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-500 min-h-30 min-w-102 transform transition duration-300 hover:scale-105 hover:shadow-xl shadow-lg">
              <div className="flex items-start space-x-6">
                <div className="w-18 h-14 flex items-center justify-center bg-green-100 rounded-xl text-2xl">📱</div>
                <div>
                  <h4 className="font-semibold mb-1 text-blue-900">Android (Chrome / Edge)</h4>
                  <p className="text-sm text-gray-600 mb-3">Quick install via browser</p>
                  <ol className="list-decimal list-inside text-gray-600 space-y-2">
                    <li>Open this site in Chrome or Edge on your Android device.</li>
                    <li>Tap the browser menu (three dots) and choose "Install app" or "Add to Home screen".</li>
                    <li>Confirm the prompt. AgriLink will appear on your Home screen and app drawer.</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-500 min-h-30 min-w-102 transform transition duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 flex items-center justify-center bg-blue-100 rounded-xl text-2xl">🍎</div>
                <div>
                  <h4 className="font-semibold mb-1 text-blue-900">iOS (Safari)</h4>
                  <p className="text-sm text-gray-600 mb-3">Add to Home Screen using Safari</p>
                  <ol className="list-decimal list-inside text-gray-600 space-y-2">
                    <li>Open this site in Safari on your iPhone or iPad.</li>
                    <li>Tap the Share button (square with an arrow), then select "Add to Home Screen".</li>
                    <li>Tap "Add". The app icon will be added to your Home screen.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">Note: On some devices the browser may show an install banner automatically. The Install button in the footer still works when the browser supports it.</p>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">The Challenge We Solve</h2>
              <p className="text-lg text-gray-600 mb-6">
                The unorganized agriculture sector poses multiple challenges to Sri Lankan farmers in running 
                their business profitably. Availability and accessibility of agricultural products at the right 
                price is a major challenge for them.
              </p>
              <p className="text-lg text-gray-600">
                AgriLink's digital platform offers affordable and accessible agriculture market information 
                and price insights sourced from reliable market data across Sri Lanka.
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-8 transform transition duration-300 hover:scale-105 hover:shadow-xl">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div className="text-2xl font-bold text-green-600">Real-Time</div>
                  <div className="text-sm text-gray-600">Market Data</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">💰</div>
                  <div className="text-2xl font-bold text-blue-600">Fair</div>
                  <div className="text-sm text-gray-600">Pricing</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">�</div>
                  <div className="text-2xl font-bold text-green-600">100+</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <div className="text-2xl font-bold text-blue-600">Mobile</div>
                  <div className="text-sm text-gray-600">First</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features That Solve Problems */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Features That Solve The Problem</h2>
            <p className="text-lg text-gray-600">Technology designed for non-tech savvy farmers</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Simple Technology */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">👨‍🌾</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Technology For Non-tech People</h3>
              <p className="text-gray-600 mb-6">
                With AgriLink, checking prices becomes an effortless experience. Simply browse products 
                and get instant market information. If you can read, you can use it!
              </p>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-green-600 font-semibold">✓ Simple Interface</div>
                <div className="text-green-600 font-semibold">✓ Voice Support (Sinhala/Tamil)</div>
                <div className="text-green-600 font-semibold">✓ Offline Access</div>
              </div>
            </div>

            {/* Best Prices */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Access Real-Time Market Prices</h3>
              <p className="text-gray-600 mb-6">
                Get instant access to current market prices from major agricultural markets across 
                Sri Lanka. Make informed decisions about when and where to sell your produce.
              </p>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-blue-600 font-semibold">✓ Live Price Updates</div>
                <div className="text-blue-600 font-semibold">✓ Historical Trends</div>
                <div className="text-blue-600 font-semibold">✓ Price Alerts</div>
              </div>
            </div>

            {/* Market Insights */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📈</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Smart Market Insights</h3>
              <p className="text-gray-600 mb-6">
                Our AI-powered analytics provide demand forecasts, seasonal trends, and market predictions 
                to help you plan your farming activities and maximize profits.
              </p>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-purple-600 font-semibold">✓ Demand Forecasting</div>
                <div className="text-purple-600 font-semibold">✓ Seasonal Analysis</div>
                <div className="text-purple-600 font-semibold">✓ Market Predictions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Are About Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Are About</h2>
            <p className="text-lg text-gray-600">Comprehensive features designed to empower Sri Lankan farmers</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Simple Interface</h3>
              <p className="text-gray-600">A single-step access system to get all market information you need instantly.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Live Market Data</h3>
              <p className="text-gray-600">Track real-time price changes and market conditions across Sri Lanka.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">�</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Digital Alerts</h3>
              <p className="text-gray-600">Receive timely notifications about price changes and market opportunities.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌤️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Weather Insights</h3>
              <p className="text-gray-600">Get notified about changing weather conditions and preventive measures to protect your farm.</p>
            </div>
          </div>
        </div>
      </section>

      {/* App Benefits Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose AgriLink?</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Designed for Local Farmers</h4>
                    <p className="text-gray-600">Built specifically for Sri Lankan agricultural market conditions and local farming practices.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Multi-Language Support</h4>
                    <p className="text-gray-600">Available in Sinhala, Tamil, and English to serve all communities.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">AI-Powered Predictions</h4>
                    <p className="text-gray-600">Machine learning algorithms provide accurate forecasts for better decision making.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Completely Free</h4>
                    <p className="text-gray-600">No subscription fees, no hidden charges. Access all features at no cost.</p>
                  </div>
                </div>
              </div>
            </div>
            
            </div>
          </div>
        
      </section>

      
    </div>
  );
}
