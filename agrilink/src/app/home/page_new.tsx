"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import CustomerUserProfile from "../../components/CustomerUserProfile";
import { checkAuthAndLogout, CustomerData, addAuthEventListener, AUTH_EVENTS } from "../../lib/clientAuth";
import "../custom.css";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Newsletter subscription states
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const navigateToHome = () => {
    window.location.href = '/home';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Newsletter subscription handler
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    setSubscriptionMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          preferences: {
            priceAlerts: true,
            weeklyDigest: true,
            marketNews: true,
            forecastUpdates: true
          }
        }),
      });

      if (response.ok) {
        setSubscriptionStatus('success');
        setSubscriptionMessage('🎉 Successfully subscribed! Check your email for confirmation.');
        setEmail('');
      } else {
        const errorData = await response.json();
        setSubscriptionStatus('error');
        setSubscriptionMessage(errorData.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      setSubscriptionStatus('error');
      setSubscriptionMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubscribing(false);
      setTimeout(() => {
        setSubscriptionMessage('');
        setSubscriptionStatus('idle');
      }, 5000);
    }
  };

  // Auto-scroll management and auth check
  useEffect(() => {
    // Handle scroll for show/hide scroll-to-top button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);

    // Auth check function
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
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
      removeAuthListener();
    };
  }, []);

  return (
    <>
      <Head>
        <title>AgriLink – Real-Time Agri Price Alerts</title>
      </Head>

      <main className="min-h-screen bg-white">
        {/* Full-Screen Video Hero Section */}
        <section className="relative h-screen overflow-hidden">
          {/* Background Video */}
          <div className="absolute inset-0 w-full h-full">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
            >
              <source 
                src="https://assets.mixkit.co/videos/preview/mixkit-agriculture-field-with-green-plants-growing-26827-large.mp4" 
                type="video/mp4" 
              />
              <source 
                src="https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-agricultural-land-44721-large.mp4" 
                type="video/mp4" 
              />
              {/* Fallback image if video fails to load */}
              <img 
                src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
                alt="Agricultural landscape"
                className="w-full h-full object-cover"
              />
            </video>
            
            {/* Video Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>
          </div>

          {/* Transparent Navigation */}
          <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center cursor-pointer" onClick={navigateToHome}>
                  <h1 className="text-3xl font-bold text-white hover:text-green-400 transition-colors drop-shadow-lg">
                    AgriLink
                  </h1>
                  <span className="ml-3 text-sm text-green-300 font-medium drop-shadow">Sri Lanka</span>
                </div>
                
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                  <a href="/about" className="text-white/90 hover:text-green-400 transition-all duration-300 font-medium backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-white/10">
                    About
                  </a>
                  <a href="/products" className="text-white/90 hover:text-green-400 transition-all duration-300 font-medium backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-white/10">
                    Products
                  </a>
                  <a href="/our-team" className="text-white/90 hover:text-green-400 transition-all duration-300 font-medium backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-white/10">
                    Our Team
                  </a>
                  <a href="/partners" className="text-white/90 hover:text-green-400 transition-all duration-300 font-medium backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-white/10">
                    Partners
                  </a>
                  <a href="/contact" className="text-white/90 hover:text-green-400 transition-all duration-300 font-medium backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-white/10">
                    Contact
                  </a>
                  {customer ? (
                    <div className="backdrop-blur-sm bg-white/10 rounded-lg p-1">
                      <CustomerUserProfile 
                        isLoggedIn={true} 
                        userRole="customer"
                        userName={customer.name || 'Customer'}
                        userEmail={customer.email || ''}
                      />
                    </div>
                  ) : (
                    <a href="/login" className="bg-green-600/90 hover:bg-green-500 text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium backdrop-blur-sm border border-green-500/30 hover:border-green-400/50 shadow-lg">
                      Login
                    </a>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <button
                    onClick={toggleMobileMenu}
                    className="text-white hover:text-green-400 focus:outline-none backdrop-blur-sm bg-white/10 p-2 rounded-lg transition-all duration-300"
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
                <div className="md:hidden backdrop-blur-md bg-black/70 border border-white/20 rounded-lg mx-4 mb-4">
                  <div className="flex flex-col space-y-4 p-6">
                    <a href="/about" className="text-white/90 hover:text-green-400 transition-colors font-medium">About</a>
                    <a href="/products" className="text-white/90 hover:text-green-400 transition-colors font-medium">Products</a>
                    <a href="/our-team" className="text-white/90 hover:text-green-400 transition-colors font-medium">Our Team</a>
                    <a href="/partners" className="text-white/90 hover:text-green-400 transition-colors font-medium">Partners</a>
                    <a href="/contact" className="text-white/90 hover:text-green-400 transition-colors font-medium">Contact</a>
                    <div className="pt-4 border-t border-white/20">
                      {customer ? (
                        <CustomerUserProfile 
                          isLoggedIn={true} 
                          userRole="customer"
                          userName={customer.name || 'Customer'}
                          userEmail={customer.email || ''}
                        />
                      ) : (
                        <a href="/login" className="bg-green-600/90 hover:bg-green-500 text-white px-6 py-3 rounded-lg transition-colors font-medium text-center block backdrop-blur-sm">
                          Login
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center text-white max-w-6xl px-6">
              {/* Animated Hero Content */}
              <div className="space-y-8 animate-fade-in-up">
                <div className="inline-block">
                  <span className="inline-flex items-center bg-green-600/20 backdrop-blur-sm text-green-300 px-6 py-3 rounded-full text-sm md:text-base font-semibold border border-green-400/30 shadow-xl">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
                    Real-Time Agricultural Intelligence
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="block mb-4">
                    Empowering Sri Lankan
                  </span>
                  <span className="block bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    Agriculture
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl lg:text-3xl text-gray-200 max-w-4xl mx-auto leading-relaxed font-light">
                  Connect farmers, markets, and consumers through intelligent technology and real-time data insights
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-6 mt-12">
                  <a
                    href="/products"
                    className="group relative overflow-hidden bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 backdrop-blur-sm border border-green-500/30 hover:border-green-400/50 shadow-2xl hover:shadow-green-500/25 hover:-translate-y-1"
                  >
                    <span className="relative z-10">Explore Products</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </a>
                  
                  <a
                    href="/about"
                    className="group relative overflow-hidden bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 backdrop-blur-sm border border-white/30 hover:border-white/50 shadow-2xl hover:-translate-y-1"
                  >
                    <span className="relative z-10">Learn More</span>
                  </a>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                  <div className="flex flex-col items-center text-white/70">
                    <span className="text-sm font-medium mb-2">Scroll to explore</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Statistics */}
          <div className="absolute bottom-20 left-0 right-0 z-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
                  <div className="text-3xl font-bold text-white mb-2">10,000+</div>
                  <div className="text-green-300 text-sm font-medium">Farmers Connected</div>
                </div>
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
                  <div className="text-3xl font-bold text-white mb-2">50+</div>
                  <div className="text-green-300 text-sm font-medium">Districts Covered</div>
                </div>
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
                  <div className="text-3xl font-bold text-white mb-2">100K+</div>
                  <div className="text-green-300 text-sm font-medium">Daily Price Updates</div>
                </div>
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
                  <div className="text-3xl font-bold text-white mb-2">24/7</div>
                  <div className="text-green-300 text-sm font-medium">Real-Time Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose AgriLink?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our platform provides comprehensive agricultural solutions designed specifically for the Sri Lankan market.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-4xl mb-6">📊</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-Time Price Alerts</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get instant notifications about market price changes for your crops. Never miss an opportunity to sell at the best price.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-4xl mb-6">🤖</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Insights</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our intelligent system analyzes market trends and provides personalized recommendations for optimal selling strategies.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-4xl mb-6">🌍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Island-Wide Coverage</h3>
                <p className="text-gray-600 leading-relaxed">
                  Connect with markets across all 25 districts of Sri Lanka. Expand your reach and find the best buyers for your produce.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Farmers</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Real-time market price updates
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Direct connection with buyers
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Weather and crop advisory
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Mobile-friendly interface
                  </li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Consumers</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Fresh produce from local farmers
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Transparent pricing information
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Quality guarantee
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    Home delivery options
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Impact</h2>
              <p className="text-xl text-gray-600">AgriLink is transforming agriculture across Sri Lanka</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatCard icon="👨‍🌾" number="10,000+" label="Active Farmers" />
              <StatCard icon="🏪" number="2,500+" label="Registered Sellers" />
              <StatCard icon="📊" number="100,000+" label="Daily Price Updates" />
              <StatCard icon="🌾" number="50+" label="Crop Varieties" />
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Stay Updated with Market Trends
            </h2>
            <p className="text-green-100 text-lg mb-8">
              Subscribe to our newsletter for weekly market insights, price forecasts, and agricultural tips.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
              <div className="flex gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-300"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              
              {subscriptionMessage && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${
                  subscriptionStatus === 'success' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {subscriptionMessage}
                </div>
              )}
            </form>
          </div>
        </section>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
            aria-label="Scroll to top"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}
      </main>
    </>
  );
}

// Reusable StatCard component
type StatCardProps = {
  icon: string;
  number: string;
  label: string;
};

function StatCard({ icon, number, label }: StatCardProps) {
  return (
    <div className="text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <div className="text-3xl font-bold text-green-600 mb-2">{number}</div>
      <p className="text-gray-600 text-sm">{label}</p>
    </div>
  );
}
