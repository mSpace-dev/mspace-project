'use client';

import { useState } from 'react';
import CustomerUserProfile from "../../components/CustomerUserProfile";

export default function Partners() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              <a href="/blog" className="text-gray-700 hover:text-green-600 transition-colors">Blog</a>
              <a href="/partners" className="text-green-600 font-semibold">Our Partners</a>
              <a href="/contact" className="text-gray-700 hover:text-green-600 transition-colors">Contact</a>
              <CustomerUserProfile isLoggedIn={true} userRole="customer" />
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
                <a href="/blog" className="text-gray-700 hover:text-green-600 transition-colors">Blog</a>
                <a href="/partners" className="text-green-600 font-semibold">Our Partners</a>
                <a href="/contact" className="text-gray-700 hover:text-green-600 transition-colors">Contact</a>
                <div className="pt-2">
                  <CustomerUserProfile isLoggedIn={true} userRole="customer" />
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
              Why Partner <span className="text-green-600">With Us</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
              Join AgriLink in revolutionizing Sri Lankan agriculture through innovative technology and collaborative partnerships that create lasting impact.
            </p>
            <div className="flex justify-center">
              <a
                href="/contact"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 transform hover:-translate-y-1 shadow-lg"
              >
                Partner With Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Partnership Benefits</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Collaborate with us to create innovative solutions that benefit farmers and transform agriculture in Sri Lanka.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-green-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl text-white">🤝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Strategic Collaboration</h3>
              <p className="text-gray-600">
                Work together to develop cutting-edge agricultural technology solutions that address real market needs.
              </p>
            </div>

            <div className="bg-blue-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl text-white">📈</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Market Expansion</h3>
              <p className="text-gray-600">
                Access our growing network of farmers, sellers, and agricultural stakeholders across Sri Lanka.
              </p>
            </div>

            <div className="bg-purple-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl text-white">💡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Innovation Impact</h3>
              <p className="text-gray-600">
                Co-create solutions that drive meaningful change in agricultural practices and farmer livelihoods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Esteemed Partners */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Esteemed Partners</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              Leading technology and telecommunications companies who trust us to deliver innovative agricultural solutions. 
              This alliance underlines our position as a trusted name in agricultural technology and data services.
            </p>
          </div>

          {/* Partner Logos Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
            {/* Mobitel - Primary Partner */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 col-span-2 md:col-span-2">
              <div className="text-center">
                <img 
                  src="/images/partners/mobitel.jpg" 
                  alt="Mobitel"
                  className="h-16 mx-auto mb-4 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <span class="text-2xl text-white font-bold">M</span>
                        </div>
                      `;
                    }
                  }}
                />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Mobitel</h3>
                <p className="text-sm text-gray-600">Telecommunications Partner</p>
                <div className="mt-3 bg-red-50 rounded-lg p-2">
                  <span className="text-xs text-red-600 font-semibold">SMS & Data Services</span>
                </div>
              </div>
            </div>

            {/* Placeholder for Future Partners */}
            <div className="bg-white rounded-2xl p-6 shadow-lg opacity-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">+</span>
                </div>
                <h3 className="text-lg font-bold text-gray-400 mb-2">Coming Soon</h3>
                <p className="text-sm text-gray-400">Future Partner</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg opacity-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">+</span>
                </div>
                <h3 className="text-lg font-bold text-gray-400 mb-2">Coming Soon</h3>
                <p className="text-sm text-gray-400">Future Partner</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg opacity-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">+</span>
                </div>
                <h3 className="text-lg font-bold text-gray-400 mb-2">Coming Soon</h3>
                <p className="text-sm text-gray-400">Future Partner</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg opacity-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">+</span>
                </div>
                <h3 className="text-lg font-bold text-gray-400 mb-2">Coming Soon</h3>
                <p className="text-sm text-gray-400">Future Partner</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg opacity-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">+</span>
                </div>
                <h3 className="text-lg font-bold text-gray-400 mb-2">Coming Soon</h3>
                <p className="text-sm text-gray-400">Future Partner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Success Story */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Mobitel Partnership Success</h2>
              <p className="text-lg text-gray-600 mb-4">
                Our strategic partnership with Mobitel enables us to deliver real-time SMS alerts and notifications 
                to farmers across Sri Lanka, ensuring they never miss critical market updates.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Nationwide SMS Coverage</h4>
                    <p className="text-gray-600 text-sm">Reliable delivery to all 25 districts in Sri Lanka</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Real-time Alerts</h4>
                    <p className="text-gray-600 text-sm">Instant price change notifications via SMS</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Multi-language Support</h4>
                    <p className="text-gray-600 text-sm">SMS in Sinhala, Tamil, and English</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl text-white font-bold">M</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Partnership Impact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">50,000+</div>
                    <div className="text-sm text-gray-600">SMS Alerts Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">99.9%</div>
                    <div className="text-sm text-gray-600">Delivery Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">25</div>
                    <div className="text-sm text-gray-600">Districts Covered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">3</div>
                    <div className="text-sm text-gray-600">Languages</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-6">
            Partner With Us to Create The Next Impact
          </h2>
          <p className="text-green-100 text-lg mb-8 max-w-3xl mx-auto">
            AgriLink is innovating, developing, and delivering the next generation of agri-tech solutions. 
            We are committed to generating sustainable value for our stakeholders. Join us in designing the farms of tomorrow.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="/contact"
              className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200"
            >
              Become a Partner
            </a>
            <a
              href="/about"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200"
            >
              Learn More About Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
