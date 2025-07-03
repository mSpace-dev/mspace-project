"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import "../custom.css";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
      quote: "Smart farming starts with knowing the right price at the right time",
      author: "AgriLink Community",
      category: "Price Intelligence"
    },
    {
      image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
      quote: "Technology empowers farmers to make data-driven decisions for better harvests",
      author: "Sri Lankan Farmers Federation",
      category: "Smart Agriculture"
    },
    {
      image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      quote: "From farm to market, every step connected through real-time insights",
      author: "AgriLink Vision",
      category: "Market Connection"
    },
    {
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      quote: "Sustainable agriculture begins with informed pricing and market awareness",
      author: "Ministry of Agriculture, Sri Lanka",
      category: "Sustainability"
    }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsCarouselPaused(!isCarouselPaused);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCarouselPaused]);

  // Auto-slide functionality
  useEffect(() => {
    if (!isCarouselPaused) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [isCarouselPaused]);
  return (
    <>
      <Head>
        <title>AgriLink – Real-Time Agri Price Alerts</title>
      </Head>

      <main className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-green-700">AgriLink</h1>
                <span className="ml-2 text-sm text-gray-500">Sri Lanka</span>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="/prices" className="text-gray-700 hover:text-green-600 transition-colors">Prices</a>
                <a href="/alerts" className="text-gray-700 hover:text-green-600 transition-colors">Alerts</a>
                <a href="/demandforecast" className="text-gray-700 hover:text-green-600 transition-colors">Forecasts</a>
                <a href="/customer" className="btn-agrilink text-white px-4 py-2 rounded-lg">Log In</a>
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
                  <a href="/prices" className="text-gray-700 hover:text-green-600 transition-colors">Prices</a>
                  <a href="/alerts" className="text-gray-700 hover:text-green-600 transition-colors">Alerts</a>
                  <a href="/demandforecast" className="text-gray-700 hover:text-green-600 transition-colors">Forecasts</a>
                  <a href="/customer" className="btn-agrilink text-white px-4 py-2 rounded-lg text-center">Log In</a>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Image Carousel with Quotes */}
        <section 
          className="relative h-[70vh] overflow-hidden"
          onMouseEnter={() => setIsCarouselPaused(true)}
          onMouseLeave={() => setIsCarouselPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative w-full h-full">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out carousel-slide ${
                  index === currentSlide 
                    ? 'opacity-100 translate-x-0' 
                    : index < currentSlide 
                      ? 'opacity-0 -translate-x-full' 
                      : 'opacity-0 translate-x-full'
                }`}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat parallax-bg"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/50"></div>
                </div>
                
                {/* Content Overlay */}
                <div className="relative z-10 h-full flex items-center justify-center carousel-content">
                  <div className="text-center text-white max-w-5xl px-6">
                    <div className="mb-6 animate-fade-in-up">
                      <span className="inline-block bg-green-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm md:text-base font-semibold shadow-lg">
                        {slide.category}
                      </span>
                    </div>
                    <blockquote className="quote-text text-2xl md:text-4xl lg:text-5xl font-bold mb-8 leading-relaxed quote-animation">
                      "{slide.quote}"
                    </blockquote>
                    <cite className="text-lg md:text-xl text-green-200 font-medium animate-fade-in-up">
                      — {slide.author}
                    </cite>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 carousel-nav bg-white/20 hover:bg-white/30 text-white p-3 md:p-4 rounded-full backdrop-blur-sm transition-all duration-200 z-20"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 carousel-nav bg-white/20 hover:bg-white/30 text-white p-3 md:p-4 rounded-full backdrop-blur-sm transition-all duration-200 z-20"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 backdrop-enhanced ${
                  index === currentSlide 
                    ? 'bg-white scale-125 shadow-lg' 
                    : 'bg-white/50 hover:bg-white/75 hover:scale-110'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Pause/Play Indicator */}
          {isCarouselPaused && (
            <div className="absolute top-6 right-6 z-20">
              <div className="backdrop-enhanced rounded-full px-4 py-2 text-white text-sm font-medium">
                <svg className="w-4 h-4 inline-block mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
                Paused
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-black/30 z-20">
            <div 
              className="h-full bg-green-500 transition-all duration-100 ease-linear"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            ></div>
          </div>

          {/* Scroll Down Indicator */}
          <div className="absolute bottom-8 right-6 z-20 animate-bounce">
            <div className="backdrop-enhanced rounded-full p-2">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="relative bg-gradient-hero py-20 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-blue-400/10 animate-pulse-subtle"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl font-bold text-green-700 mb-6 text-glow">
                AgriLink, your agricultural <br />
                <span className="text-green-600">price alerts directly from the market</span>
              </h1>
              <p className="text-gray-600 text-xl max-w-3xl mx-auto mb-8">
                Real-time, AI-powered agricultural price alerts and insights tailored for Sri Lankan farmers, sellers, and consumers.
              </p>
              
              <div className="flex justify-center gap-4 flex-wrap mb-12">
                <a
                  href="/customer"
                  className="btn-agrilink text-white font-semibold px-8 py-4 rounded-xl shadow-lg text-lg"
                >
                  Customer Portal
                </a>
                <a
                  href="/seller"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg text-lg transition-all duration-200 hover:-translate-y-1"
                >
                  Seller Portal
                </a>
              </div>

              <div className="flex justify-center gap-4 flex-wrap">
                <a
                  href="/prices"
                  className="bg-white border border-green-600 text-green-700 hover:bg-green-50 font-semibold px-6 py-3 rounded-xl shadow transition-all duration-200 hover:-translate-y-1"
                >
                  View Current Prices
                </a>
                <a
                  href="/alerts"
                  className="bg-white border border-green-600 text-green-700 hover:bg-green-50 font-semibold px-6 py-3 rounded-xl shadow transition-all duration-200 hover:-translate-y-1"
                >
                  Subscribe to Alerts
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
              How AgriLink Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Choose Your Alerts</h3>
                <p className="text-gray-600">Select the crops and locations you want to monitor for price changes.</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">AI-Powered Insights</h3>
                <p className="text-gray-600">Our AI analyzes market trends and predicts price movements.</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📨</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Instant Notifications</h3>
                <p className="text-gray-600">Get SMS alerts when prices hit your target thresholds.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Product Categories */}
        <section className="py-20 px-6 bg-gradient-to-br from-green-50 via-blue-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Track Prices for All Agricultural Products
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover comprehensive price tracking across all major agricultural categories. 
                Stay informed with real-time market data and make better business decisions.
              </p>
              <div className="mt-8 w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              <ProductCategory 
                icon="🥕" 
                name="Vegetables"
                
              />
              <ProductCategory 
                icon="🌾" 
                name="Rice & Grains"
                image="/images/categories/rice-grains.jpg"
              />
              <ProductCategory 
                icon="🥭" 
                name="Fruits"
                image="/images/categories/fruits.jpg"
              />
              <ProductCategory 
                icon="🌶️" 
                name="Spices"
                image="/images/categories/spices.jpg"
              />
              <ProductCategory 
                icon="🥥" 
                name="Coconut Products"
                image="/images/categories/coconut-products.jpg"
              />
              <ProductCategory 
                icon="🫘" 
                name="Legumes"
                image="/images/categories/legumes.jpg"
              />
              <ProductCategory 
                icon="🍃" 
                name="Herbs"
                image="/images/categories/herbs.jpg"
              />
              <ProductCategory 
                icon="🥛" 
                name="Dairy"
                image="/images/categories/dairy.jpg"
              />
              <ProductCategory 
                icon="🐟" 
                name="Fish & Seafood"
                image="/images/categories/fish-seafood.jpg"
              />
              <ProductCategory 
                icon="🍯" 
                name="Honey & Sweets"
                image="/images/categories/honey-sweets.jpg"
              />
              <ProductCategory 
                icon="🫒" 
                name="Oils"
                image="/images/categories/oils.jpg"
              />
              <ProductCategory 
                icon="☕" 
                name="Beverages"
                image="/images/categories/beverages.jpg"
              />
            </div>
            <div className="text-center mt-12">
              <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                View All Categories
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6 bg-green-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
              Why Choose AgriLink?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon="🔔"
                title="Real-Time SMS Alerts"
                desc="Get instant notifications when crop prices change in your region via SMS."
              />
              <FeatureCard
                icon="📈"
                title="AI Price Forecasting"
                desc="Know tomorrow's trends today with ARIMA and LSTM-powered predictions."
              />
              <FeatureCard
                icon="📍"
                title="Location-Based Updates"
                desc="Receive alerts relevant to your specific district or province in Sri Lanka."
              />
              <FeatureCard
                icon="🗣️"
                title="Chatbot Assistant"
                desc="Ask natural language questions and get SMS replies instantly."
              />
              <FeatureCard
                icon="🧠"
                title="GenAI Insights"
                desc="Understand the 'why' behind price movements with AI-generated summaries."
              />
              <FeatureCard
                icon="🔗"
                title="Open API Access"
                desc="Integrate AgriLink alerts into your apps, platforms, or marketplaces."
              />
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
              Our Growing Impact
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <StatCard
                icon="👥"
                number="10,000+"
                label="farmers and sellers connected to better pricing information"
              />
              <StatCard
                icon="📱"
                number="50,000+"
                label="SMS alerts sent to help farmers make informed decisions"
              />
              <StatCard
                icon="🏪"
                number="500+"
                label="markets across Sri Lanka providing real-time price data"
              />
              <StatCard
                icon="�"
                number="25%"
                label="average increase in farmer profits through better timing"
              />
            </div>
          </div>
        </section>

        {/* Latest Market Insights */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
              Latest Market Insights
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg card-hover">
                <div className="text-green-600 text-sm font-semibold mb-2">TODAY'S ALERT</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Rice Prices Surge 15% in Colombo
                </h3>
                <p className="text-gray-600 mb-4">
                  Due to increased demand and reduced supply from monsoon effects, rice prices have increased significantly across major markets.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>📍 Colombo, Western Province</span>
                  <span className="ml-4">⏰ 2 hours ago</span>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg card-hover">
                <div className="text-blue-600 text-sm font-semibold mb-2">FORECAST</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Vegetable Prices Expected to Drop
                </h3>
                <p className="text-gray-600 mb-4">
                  AI predictions suggest vegetable prices will decrease by 10-20% next week due to improved weather conditions.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>📍 Kandy, Central Province</span>
                  <span className="ml-4">⏰ 5 hours ago</span>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg card-hover">
                <div className="text-purple-600 text-sm font-semibold mb-2">MARKET TREND</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Coconut Export Demand Rising
                </h3>
                <p className="text-gray-600 mb-4">
                  International demand for Sri Lankan coconut products is increasing, driving up local prices by 8% this month.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>📍 Gampaha, Western Province</span>
                  <span className="ml-4">⏰ 1 day ago</span>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <a
                href="/alerts"
                className="btn-agrilink text-white px-6 py-3 rounded-lg font-semibold inline-block"
              >
                View All Market Updates
              </a>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
              What Our Users Say
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-green-50 rounded-2xl p-6 card-hover">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    P
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-800">Pradeep Silva</h4>
                    <p className="text-sm text-gray-600">Rice Farmer, Anuradhapura</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "AgriLink has revolutionized how I sell my rice. The price alerts help me time my sales perfectly, increasing my profits by 30%."
                </p>
                <div className="flex text-yellow-400 mt-4">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-2xl p-6 card-hover">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-800">Sujatha Perera</h4>
                    <p className="text-sm text-gray-600">Vegetable Trader, Kandy</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "The AI forecasting feature is incredible! I can predict when to buy vegetables at the best prices for my business."
                </p>
                <div className="flex text-yellow-400 mt-4">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-2xl p-6 card-hover">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    R
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-800">Rohana Fernando</h4>
                    <p className="text-sm text-gray-600">Fruit Farmer, Galle</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "SMS alerts are so convenient! I get notified instantly when mango prices go up, even when I'm working in the field."
                </p>
                <div className="flex text-yellow-400 mt-4">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-green-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Transform Your Agricultural Business?
            </h2>
            <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of farmers, sellers, and consumers who are already using AgriLink to make smarter decisions.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <a
                href="/customer"
                className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl shadow-lg text-lg transition-all duration-200"
              >
                Get Started for Free
              </a>
              <a
                href="/prices"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200"
              >
                View Live Prices
              </a>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Stay Updated with AgriLink
            </h2>
            <p className="text-gray-600 mb-8">
              Receive news from our farmers and the latest agricultural price insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button className="btn-agrilink text-white px-6 py-3 rounded-lg font-semibold whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              By subscribing, you agree to our privacy policy and terms of service.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">AgriLink</h3>
                <p className="text-gray-400 mb-4">
                  Connecting Sri Lankan agriculture through real-time price intelligence.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white">📧</a>
                  <a href="#" className="text-gray-400 hover:text-white">📱</a>
                  <a href="#" className="text-gray-400 hover:text-white">🌐</a>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Services</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/prices" className="hover:text-white">Price Monitoring</a></li>
                  <li><a href="/alerts" className="hover:text-white">SMS Alerts</a></li>
                  <li><a href="/demandforecast" className="hover:text-white">Demand Forecasting</a></li>
                  <li><a href="/api" className="hover:text-white">API Access</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/help" className="hover:text-white">Help Center</a></li>
                  <li><a href="/contact" className="hover:text-white">Contact Us</a></li>
                  <li><a href="/documentation" className="hover:text-white">Documentation</a></li>
                  <li><a href="/status" className="hover:text-white">System Status</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/about" className="hover:text-white">About Us</a></li>
                  <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
                  <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
                  <li><a href="/careers" className="hover:text-white">Careers</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 AgriLink. All rights reserved. Made with ❤️ for Sri Lankan agriculture.</p>
            </div>
          </div>
        </footer>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
            aria-label="Scroll to top"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}
      </main>
    </>
  );
}

type FeatureCardProps = {
  icon: string;
  title: string;
  desc: string;
};

function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-green-800 mb-3">{title}</h3>
      <p className="text-gray-700">{desc}</p>
    </div>
  );
}

type ProductCategoryProps = {
  icon: string;
  name: string;
  image?: string;
};

function ProductCategory({ icon, name, image }: ProductCategoryProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCategoryClick = () => {
    // Navigate to prices page with category filter
    window.location.href = `/prices?category=${encodeURIComponent(name.toLowerCase())}`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCategoryClick();
    }
  };

  return (
    <div 
      className="product-category-card group cursor-pointer" 
      role="button" 
      tabIndex={0} 
      aria-label={`View ${name} products and prices`}
      onClick={handleCategoryClick}
      onKeyPress={handleKeyPress}
    >
      {image && !imageError ? (
        <div className="product-category-image h-32 relative">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
              <div className="text-2xl animate-pulse">{icon}</div>
            </div>
          )}
          <img 
            src={image} 
            alt={`${name} category`}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          <div className="absolute top-2 right-2 product-category-icon text-2xl rounded-full p-2 animate-float">
            {icon}
          </div>
        </div>
      ) : (
        <div className="p-4 product-category-image h-32 flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
          <div className="text-4xl animate-float">{icon}</div>
        </div>
      )}
      <div className="product-category-title p-4">
        <h3 className="text-sm font-semibold text-gray-800 text-center transition-colors duration-300 group-hover:text-green-700">
          {name}
        </h3>
        <p className="text-xs text-gray-500 text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Click to view prices
        </p>
      </div>
    </div>
  );
}

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
