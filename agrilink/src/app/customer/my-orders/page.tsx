"use client";

import { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const customer = JSON.parse(localStorage.getItem("customer") || "null");
      if (customer?._id) {
        setIsLoggedIn(true);
        fetchOrders(customer._id);
      } else {
        setIsLoggedIn(false);
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const fetchOrders = async (customerId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/orders?customerId=${customerId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load orders");
      setOrders(json.orders || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'paid': return '💳';
      case 'processing': return '🔄';
      case 'shipped': return '🚚';
      case 'delivered': return '✅';
      case 'cancelled': return '❌';
      default: return '📦';
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center py-20">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">Please login to view your orders.</p>
            <a
              href="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Go to Login
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">Track your order status and delivery information</p>
        </header>

        {loading && (
          <div className="py-20 text-center text-gray-600">Loading your orders…</div>
        )}
        
        {error && (
          <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
        )}

        {orders.length === 0 && !loading && !error && (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <a
              href="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Start Shopping
            </a>
          </div>
        )}

        <div className="space-y-6">
          {orders.map((order: any) => (
            <div key={order._id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Order #{order._id.slice(-8)}</h3>
                  <p className="text-sm text-gray-600">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">Rs. {order.totalAmount.toFixed(2)}</div>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    <span className="mr-1">{getStatusIcon(order.status)}</span>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                </div>
              </div>

              {order.supplier && (
                <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">Supplier Information</h4>
                  <div className="text-sm text-green-800">
                    <div className="font-medium">{order.supplier.name}</div>
                    {order.supplier.businessName && <div>{order.supplier.businessName}</div>}
                    {order.supplier.phone && <div>Phone: {order.supplier.phone}</div>}
                    {order.supplier.email && <div>Email: {order.supplier.email}</div>}
                    <div className="text-xs text-green-600 mt-1">
                      Claimed on {new Date(order.supplier.claimedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.name} x {item.quantity}</span>
                        <span className="font-medium">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                  <div className="text-sm text-gray-600">
                    {order.shippingAddress ? (
                      <div>
                        <div>{order.shippingAddress.line1}</div>
                        {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
                        <div>{order.shippingAddress.city}, {order.shippingAddress.district}</div>
                        <div>{order.shippingAddress.province} {order.shippingAddress.postalCode}</div>
                      </div>
                    ) : (
                      <div className="text-gray-400">No address provided</div>
                    )}
                  </div>
                </div>
              </div>

              {order.tracking && order.tracking.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Order Tracking</h4>
                  <div className="space-y-2">
                    {order.tracking.map((track: any, index: number) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <span className="font-medium">{track.status}</span>
                          {track.note && <span className="ml-2">- {track.note}</span>}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(track.at).toLocaleDateString()} {new Date(track.at).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

