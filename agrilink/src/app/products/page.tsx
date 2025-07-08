'use client';

import { useState, useEffect } from 'react';
import CustomerUserProfile from "../../components/CustomerUserProfile";
import { checkAuthAndLogout, CustomerData } from "../../lib/clientAuth";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch products from the server
    const fetchProducts = async () => {
      const response = await fetch('/api/products');
      const data: Product[] = await response.json();
      setProducts(data);
    };
    fetchProducts();

    // Check if user is logged in and handle token expiration
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
    window.location.href = '/home';
  };

  const addToCart = (productId: string) => {
    if (!customer) {
      alert('Please log in to add items to your cart.');
      return;
    }

    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? { ...product, quantity: product.quantity - 1 }
          : product
      )
    );
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
              <a href="/products" className="text-green-600 font-semibold">Products</a>
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
                <a href="/about" className="text-gray-700 hover:text-green-600 transition-colors">About</a>
                <a href="/products" className="text-green-600 font-semibold">Products</a>
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

      <h1 className="text-3xl font-bold text-center my-6">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4">
            <h2 className="text-xl font-bold">{product.name}</h2>
            <p className="text-gray-600">Price: ${product.price}</p>
            <p className="text-gray-600">Quantity: {product.quantity}</p>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded mt-4"
              onClick={() => addToCart(product.id)}
              disabled={product.quantity === 0 || !customer}
            >
              {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
