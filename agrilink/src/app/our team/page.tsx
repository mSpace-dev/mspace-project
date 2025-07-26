'use client';

import { useState, useEffect } from 'react';
import CustomerUserProfile from "../../components/CustomerUserProfile";

export default function About() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('customerToken');
        if (token) {
          const userData = localStorage.getItem('customerData');
          if (userData) {
            setCustomer(JSON.parse(userData));
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigateToHome = () => {
    window.location.href = '/home';
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
              <a href="/about" className="text-gray-700 hover:text-green-600 transition-colors">About</a>
              <a href="/products" className="text-gray-700 hover:text-green-600 transition-colors">Products</a>
              <a href="/our team" className="text-green-600 font-semibold">Our Team</a>
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
                <CustomerUserProfile 
                  isLoggedIn={false} 
                  userRole="customer"
                />
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
                <a href="/about" className="text-gray-700 hover:text-green-600 transition-colors">About</a>
                <a href="/products" className="text-gray-700 hover:text-green-600 transition-colors">Products</a>
                <a href="/our team" className="text-green-600 font-semibold">Our Team</a>
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
                    <CustomerUserProfile 
                      isLoggedIn={false} 
                      userRole="customer"
                    />
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
              About <span className="text-green-600">AgriLink</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering Sri Lankan agriculture through intelligent technology and real-time market connections.
            </p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-4">
                AgriLink is dedicated to revolutionizing Sri Lankan agriculture by connecting farmers, sellers, and consumers through intelligent technology and real-time market data.
              </p>
              <p className="text-lg text-gray-600">
                We believe that access to accurate, timely information is the key to making better agricultural decisions and building a more sustainable food system for Sri Lanka.
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-8">
              <div className="text-6xl mb-4 text-center">🌾</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">10,000+</div>
                <p className="text-gray-600">Farmers Connected</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl p-8 md:order-1">
              <div className="text-6xl mb-4 text-center">💡</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">AI-Powered</div>
                <p className="text-gray-600">Smart Agriculture Solutions</p>
              </div>
            </div>
            <div className="md:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-lg text-gray-600 mb-4">
                To become Sri Lanka&apos;s leading agricultural technology platform, fostering prosperity for all stakeholders in the agricultural value chain.
              </p>
              <p className="text-lg text-gray-600">
                We envision a future where every farmer has access to the tools and information they need to thrive, creating a stronger, more resilient agricultural sector.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Transparency</h3>
                <p className="text-gray-600">We believe in open, honest communication and transparent pricing for all our users.</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation</h3>
                <p className="text-gray-600">We continuously develop cutting-edge solutions to address modern agricultural challenges.</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Sustainability</h3>
                <p className="text-gray-600">We promote sustainable farming practices that benefit both farmers and the environment.</p>
              </div>
            </div>
          </div>

          {/* Meet Our Team Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
              Our passionate team of agricultural technology experts and innovators working to transform Sri Lankan agriculture.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Team Leader */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative mb-6">
                  <img 
                    src="/images/team/jayawardhana.jpg" 
                    alt="W.S.S Jayawardhana"
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-green-100"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml;base64,${btoa(`
                        <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="64" cy="64" r="64" fill="#f3f4f6"/>
                          <circle cx="64" cy="50" r="20" fill="#9ca3af"/>
                          <path d="M64 74c-17 0-30 8-30 18v10h60V92c0-10-13-18-30-18z" fill="#9ca3af"/>
                        </svg>
                      `)}`;
                    }}
                  />
                  <div className="absolute top-0 right-8 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Team Leader
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">W.S.S Jayawardhana</h3>
                <p className="text-green-600 font-semibold mb-3">Team Leader & Project Coordinator</p>
                <p className="text-gray-600 text-sm">
                  Leading the AgriLink initiative with expertise in agricultural technology and project management.
                </p>
              </div>

              {/* Team Member 1 */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative mb-6">
                  <img 
                    src="/images/team/gangadari.jpg" 
                    alt="M.D.S Gangadari"
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-blue-100"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml;base64,${btoa(`
                        <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="64" cy="64" r="64" fill="#f3f4f6"/>
                          <circle cx="64" cy="50" r="20" fill="#9ca3af"/>
                          <path d="M64 74c-17 0-30 8-30 18v10h60V92c0-10-13-18-30-18z" fill="#9ca3af"/>
                        </svg>
                      `)}`;
                    }}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">M.D.S Gangadari</h3>
                <p className="text-blue-600 font-semibold mb-3">Software Developer</p>
                <p className="text-gray-600 text-sm">
                  Specializing in mobile application development and user experience design for agricultural platforms.
                </p>
              </div>

              {/* Team Member 2 */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative mb-6">
                  <img 
                    src="/images/team/jayathunga.jpg" 
                    alt="W.M.J.S.Jayathunga"
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-purple-100"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml;base64,${btoa(`
                        <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="64" cy="64" r="64" fill="#f3f4f6"/>
                          <circle cx="64" cy="50" r="20" fill="#9ca3af"/>
                          <path d="M64 74c-17 0-30 8-30 18v10h60V92c0-10-13-18-30-18z" fill="#9ca3af"/>
                        </svg>
                      `)}`;
                    }}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">W.M.J.S. Jayathunga</h3>
                <p className="text-purple-600 font-semibold mb-3">AI/ML Engineer</p>
                <p className="text-gray-600 text-sm">
                  Developing machine learning models for price prediction and market analysis in agricultural systems.
                </p>
              </div>

              {/* Team Member 3 */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative mb-6">
                  <img 
                    src="/images/team/abeynayake.jpg" 
                    alt="D.C. Abeynayake"
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-orange-100"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml;base64,${btoa(`
                        <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="64" cy="64" r="64" fill="#f3f4f6"/>
                          <circle cx="64" cy="50" r="20" fill="#9ca3af"/>
                          <path d="M64 74c-17 0-30 8-30 18v10h60V92c0-10-13-18-30-18z" fill="#9ca3af"/>
                        </svg>
                      `)}`;
                    }}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">D.C. Abeynayake</h3>
                <p className="text-orange-600 font-semibold mb-3">Backend Developer</p>
                <p className="text-gray-600 text-sm">
                  Building robust server infrastructure and API systems to support real-time agricultural data processing.
                </p>
              </div>

              {/* Team Member 4 */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative mb-6">
                  <img 
                    src="/images/team/wickramasinghe.png" 
                    alt="K.Y.T.Wickramasinghe"
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-indigo-100"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml;base64,${btoa(`
                        <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="64" cy="64" r="64" fill="#f3f4f6"/>
                          <circle cx="64" cy="50" r="20" fill="#9ca3af"/>
                          <path d="M64 74c-17 0-30 8-30 18v10h60V92c0-10-13-18-30-18z" fill="#9ca3af"/>
                        </svg>
                      `)}`;
                    }}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">K.Y.T. Wickramasinghe</h3>
                <p className="text-indigo-600 font-semibold mb-3">Data Analyst</p>
                <p className="text-gray-600 text-sm">
                  Analyzing agricultural market trends and consumer behavior to improve platform insights and recommendations.
                </p>
              </div>
            </div>

            {/* Team Quote */}
            <div className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="text-4xl mb-4">🌾</div>
              <blockquote className="text-2xl font-bold text-gray-800 mb-4">
                &quot;Together, we&apos;re building the future of Sri Lankan agriculture through innovation and technology.&quot;
              </blockquote>
              <cite className="text-lg text-green-600 font-semibold">— The AgriLink Team</cite>
            </div>
          </div>

          {/* Our Impact Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Our Impact</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
                <p className="text-gray-600">Districts Covered</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">100,000+</div>
                <p className="text-gray-600">Price Updates Daily</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">5,000+</div>
                <p className="text-gray-600">Active Sellers</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">25,000+</div>
                <p className="text-gray-600">Daily Users</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-6">
            Join the AgriLink Community
          </h2>
          <p className="text-green-100 text-lg mb-8">
            Be part of Sri Lanka&apos;s agricultural transformation. Connect with us today.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/customer"
              className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200"
            >
              Get Started
            </a>
            <a
              href="/contact"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
