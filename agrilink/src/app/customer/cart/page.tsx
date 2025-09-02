"use client";

import { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import LoginModal from "../../components/LoginModal";

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const load = () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is logged in
      const customer = JSON.parse(localStorage.getItem("customer") || "null");
      setIsLoggedIn(!!customer?._id);
      
      // Load cart from localStorage (guest cart)
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      setCart(guestCart);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateQty = (productId: string, qty: number) => {
    try {
      const updatedCart = cart.map(item => 
        item.productId === productId 
          ? { ...item, quantity: Math.max(0, qty) }
          : item
      ).filter(item => item.quantity > 0);
      
      setCart(updatedCart);
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
    } catch (e: any) { 
      alert("Failed to update quantity"); 
    }
  };

  const removeItem = (productId: string) => {
    try {
      const updatedCart = cart.filter(item => item.productId !== productId);
      setCart(updatedCart);
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
    } catch (e: any) { 
      alert("Failed to remove item"); 
    }
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    // Redirect to checkout
    window.location.href = '/customer/checkout';
  };

  const subtotal = cart?.reduce((s: number, i: any) => s + (i.price || 0) * (i.quantity || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Cart</h1>
        {loading && <div className="py-10 text-gray-600">Loading…</div>}
        {error && <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5-5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-4">Start shopping to add items to your cart.</p>
            <a
              href="/shop"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item: any) => (
                <div key={item.productId} className="rounded border border-gray-200 bg-white p-4 flex gap-4 items-center">
                  <div className="w-24 h-20 rounded bg-gray-100 overflow-hidden">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">{item.type}</div>
                    <div className="text-base font-semibold text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-600">Rs. {(item.price || 0).toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-2 py-1 rounded border hover:bg-gray-50" onClick={() => updateQty(item.productId, Math.max(0, item.quantity - 1))}>-</button>
                    <div className="w-8 text-center">{item.quantity}</div>
                    <button className="px-2 py-1 rounded border hover:bg-gray-50" onClick={() => updateQty(item.productId, item.quantity + 1)}>+</button>
                  </div>
                  <button className="text-sm text-red-600 hover:text-red-700" onClick={() => removeItem(item.productId)}>Remove</button>
                </div>
              ))}
            </div>
            <aside className="rounded border border-gray-200 bg-white p-6 h-fit">
              <div className="flex items-center justify-between text-base">
                <div className="text-gray-700">Subtotal</div>
                <div className="font-semibold text-gray-900">Rs. {subtotal.toFixed(2)}</div>
              </div>
              <button 
                onClick={handleCheckout} 
                className="mt-4 w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                {isLoggedIn ? 'Proceed to checkout' : 'Login to checkout'}
              </button>
              {!isLoggedIn && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Login required to proceed with checkout
                </p>
              )}
            </aside>
          </div>
        )}

        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setIsLoggedIn(true);
            setShowLoginModal(false);
          }}
        />
      </main>
    </div>
  );
}
