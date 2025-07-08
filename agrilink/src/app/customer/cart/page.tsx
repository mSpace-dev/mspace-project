"use client";

import { useState, useEffect } from "react";
import CustomerUserProfile from "../../../components/CustomerUserProfile";

interface CartItem {
  _id?: string;
  productId?: string;
  serviceId?: string;
  name: string;
  type: 'product' | 'service' | 'subscription';
  price: number;
  quantity: number;
  image?: string;
  description: string;
  seller: string;
  addedAt?: string;
}

export default function CustomerCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    // Get customer info from localStorage
    const customerData = localStorage.getItem('customer');
    if (customerData) {
      const parsedCustomer = JSON.parse(customerData);
      setCustomer(parsedCustomer);
      fetchCartData(parsedCustomer._id);
    } else {
      setError("Please log in to view your cart");
      setLoading(false);
    }
  }, []);

  const fetchCartData = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customer/cart?customerId=${customerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cart data');
      }
      const data = await response.json();
      setCartItems(data.cart.items || []);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart data');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (!customer) return;

    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    try {
      const response = await fetch('/api/customer/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customer._id,
          itemId,
          quantity: newQuantity
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart');
      }

      const data = await response.json();
      setCartItems(data.cart.items || []);
      setSuccessMessage('Cart updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating cart:', err);
      setError('Failed to update cart');
      setTimeout(() => setError(null), 3000);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!customer) return;

    try {
      const response = await fetch(`/api/customer/cart?customerId=${customer._id}&itemId=${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      const data = await response.json();
      setCartItems(data.cart.items || []);
      setSuccessMessage('Item removed from cart');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item');
      setTimeout(() => setError(null), 3000);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const addSampleItems = async () => {
    if (!customer) return;

    try {
      const response = await fetch('/api/customer/cart/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customer._id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add sample items');
      }

      // Refresh cart data
      fetchCartData(customer._id);
      setSuccessMessage('Sample items added to cart');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error adding sample items:', err);
      setError('Failed to add sample items');
      setTimeout(() => setError(null), 3000);
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'product':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
          </svg>
        );
      case 'service':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
        );
      case 'subscription':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <a href="/home" className="text-2xl font-bold text-green-700 hover:text-green-600 transition-colors">
                AgriLink
              </a>
              <span className="ml-2 text-sm text-gray-500">Sri Lanka</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/about" className="text-gray-700 hover:text-green-600 transition-colors">About</a>
              <a href="/products" className="text-gray-700 hover:text-green-600 transition-colors">Products</a>
              <a href="/our-team" className="text-gray-700 hover:text-green-600 transition-colors">Our Team</a>
              <a href="/partners" className="text-gray-700 hover:text-green-600 transition-colors">Partners</a>
              <a href="/contact" className="text-gray-700 hover:text-green-600 transition-colors">Contact</a>
              <CustomerUserProfile 
                isLoggedIn={!!customer} 
                userRole="customer"
                userName={customer?.name || "Customer"}
                userEmail={customer?.email || ""}
              />
            </div>

            {/* Mobile Profile - Always Visible */}
            <div className="md:hidden">
              <CustomerUserProfile 
                isLoggedIn={!!customer} 
                userRole="customer"
                userName={customer?.name || "Customer"}
                userEmail={customer?.email || ""}
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-gray-600 mt-2">Review your items and proceed to checkout</p>
        </div>

        {loading ? (
          /* Loading State */
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your cart...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-12">
            <svg className="mx-auto h-24 w-24 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Error Loading Cart</h3>
            <p className="mt-2 text-gray-500">{error}</p>
            {!customer && (
              <a
                href="/customer"
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Go to Login
              </a>
            )}
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-12">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5-5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-2 text-gray-500">Start shopping to add items to your cart.</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Browse Products
              </a>
              <button
                onClick={addSampleItems}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Add Sample Items (For Testing)
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Cart Items ({cartItems.length})</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item._id} className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Item Image/Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getItemTypeIcon(item.type)}
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                            <p className="text-xs text-gray-400 mt-1">Sold by: {item.seller}</p>
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.type === 'product' ? 'bg-blue-100 text-blue-800' :
                                item.type === 'service' ? 'bg-green-100 text-green-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {item.type}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <label className="text-sm text-gray-600">Quantity:</label>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(item._id!, item.quantity - 1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item._id!, item.quantity + 1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item._id!)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">Rs. {getTotalPrice().toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">Rs. 500</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-900">Rs. {Math.round(getTotalPrice() * 0.1).toLocaleString()}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-base font-medium">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">Rs. {(getTotalPrice() + 500 + Math.round(getTotalPrice() * 0.1)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                    Proceed to Checkout
                  </button>
                  
                  <button className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors">
                    Continue Shopping
                  </button>
                </div>

                {/* Promo Code */}
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Promo Code
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Enter code"
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                      />
                      <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm font-medium">
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
