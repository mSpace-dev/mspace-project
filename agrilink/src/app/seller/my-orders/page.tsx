"use client";

import { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [seller, setSeller] = useState<any>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState<string>('');
  const [statusNote, setStatusNote] = useState<string>('');

  useEffect(() => {
    const checkAuth = () => {
      const sellerData = localStorage.getItem("seller");
      if (sellerData) {
        const parsedSeller = JSON.parse(sellerData);
        setSeller(parsedSeller);
        setIsLoggedIn(true);
        fetchMyOrders(parsedSeller._id);
      } else {
        setIsLoggedIn(false);
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const fetchMyOrders = async (sellerId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/orders/my-orders?sellerId=${sellerId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load orders");
      setOrders(json.orders || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, note?: string) => {
    const statusLabels: { [key: string]: string } = {
      'shipped': 'shipped',
      'delivered': 'completed and delivered'
    };
    
    const confirmMessage = `Are you sure you want to mark this order as ${statusLabels[newStatus] || newStatus}?`;
    if (!confirm(confirmMessage)) return;
    
    try {
      const res = await fetch("/api/orders/update-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId, 
          sellerId: seller._id,
          status: newStatus,
          note: note || `Order ${statusLabels[newStatus] || newStatus} by seller`
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to update order status");
      
      alert(`Order marked as ${statusLabels[newStatus] || newStatus}!`);
      fetchMyOrders(seller._id); // Refresh the list
    } catch (e: any) {
      alert(e.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <p className="text-gray-600 mb-6">Please login as a seller to view your orders.</p>
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
          <p className="text-gray-600">Manage orders you have claimed</p>
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
            <p className="text-gray-600 mb-4">You haven't claimed any orders yet.</p>
            <a
              href="/seller/available-orders"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Browse Available Orders
            </a>
          </div>
        )}

        <div className="grid gap-6">
          {orders.map((order: any) => (
            <div key={order._id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Order #{order._id.slice(-8)}</h3>
                  <p className="text-sm text-gray-600">
                    Claimed on {new Date(order.supplier?.claimedAt).toLocaleDateString()}
                  </p>
                  {order.supplier?.estimatedDeliveryDate && (
                    <p className="text-sm text-blue-600 font-medium">
                      Est. Delivery: {new Date(order.supplier.estimatedDeliveryDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">Rs. {order.totalAmount.toFixed(2)}</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
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
                  <h4 className="font-medium text-gray-900 mb-2">Customer</h4>
                  <div className="text-sm text-gray-600">
                    {order.customerId ? (
                      <div>
                        <div className="font-medium">{order.customerId.name}</div>
                        <div>{order.customerId.email}</div>
                        {order.customerId.phone && <div>{order.customerId.phone}</div>}
                      </div>
                    ) : (
                      <div className="text-gray-400">Customer info not available</div>
                    )}
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
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Order Timeline</h4>
                  <div className="space-y-2">
                    {order.tracking.slice(-3).map((track: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{track.note}</span>
                        <span className="text-gray-500">{new Date(track.at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                        {order.status === 'processing' && (
                  <>
                    <button
                      onClick={() => updateOrderStatus(order._id, 'shipped')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Mark as Shipped
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order._id, 'delivered')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Mark as Delivered
                    </button>
                  </>
                )}
                {order.status === 'shipped' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, 'delivered')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Mark as Delivered
                  </button>
                )}
                {order.status === 'delivered' && (
                  <span className="text-green-600 font-medium">✓ Order Completed</span>
                )}
                        {/* Inline status editor toggle - hide when consumer cancelled or already delivered */}
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <>
                            {!editingOrderId && (
                              <button
                                onClick={() => {
                                  setEditingOrderId(order._id);
                                  setStatusDraft(order.status || 'processing');
                                  setStatusNote('');
                                }}
                                className="border border-gray-200 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Change Status
                              </button>
                            )}
                            {editingOrderId === order._id && (
                              <div className="flex items-center space-x-2">
                                <select
                                  value={statusDraft}
                                  onChange={(e) => setStatusDraft(e.target.value)}
                                  className="border px-2 py-1 rounded-md text-sm text-black"
                                >
                                  <option value="processing">Processing</option>
                                  <option value="pending">Pending</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                </select>
                                <input
                                  type="text"
                                  placeholder="optional note"
                                  value={statusNote}
                                  onChange={(e) => setStatusNote(e.target.value)}
                                  className="border px-2 py-1 rounded-md text-sm w-56 text-black"
                                />
                                <button
                                  onClick={() => {
                                    updateOrderStatus(order._id, statusDraft, statusNote);
                                    setEditingOrderId(null);
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingOrderId(null);
                                    setStatusDraft('');
                                    setStatusNote('');
                                  }}
                                  className="border px-3 py-1 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </>
                        )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
