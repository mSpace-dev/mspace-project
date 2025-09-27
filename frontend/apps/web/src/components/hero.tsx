'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

export function Hero() {
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigateToHome = () => {
    window.location.href = '/'
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
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
              {user ? (
                <div className="backdrop-blur-sm bg-white/10 rounded-lg p-1">
                  <div className="text-white text-sm">
                    Welcome, {user.email}
                  </div>
                </div>
              ) : (
                <div className="flex gap-4">
                  <a href="/auth/signin" className="bg-green-600/90 hover:bg-green-500 text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium backdrop-blur-sm border border-green-500/30 hover:border-green-400/50 shadow-lg">
                    Login
                  </a>
                  <a href="/auth/signup" className="bg-blue-600/90 hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium backdrop-blur-sm border border-blue-500/30 hover:border-blue-400/50 shadow-lg">
                    Sign Up
                  </a>
                </div>
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
                  {user ? (
                    <div className="text-white text-sm">
                      Welcome, {user.email}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <a href="/auth/signin" className="bg-green-600/90 hover:bg-green-500 text-white px-6 py-3 rounded-lg transition-colors font-medium text-center block backdrop-blur-sm">
                        Login
                      </a>
                      <a href="/auth/signup" className="bg-blue-600/90 hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-colors font-medium text-center block backdrop-blur-sm">
                        Sign Up
                      </a>
                    </div>
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
  )
}

