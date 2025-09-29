"use client";

import { useEffect, useState } from "react";
import CustomerNavBar from "../../../components/CustomerNavBar";
import { useCustomerAuth } from "../../../hooks/useCustomerAuth";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { customer, isLoading: authLoading, isAuthenticated, redirectToLogin } = useCustomerAuth();

  useEffect(() => {
    const load = async () => {
      try {
        // Wait for authentication to complete
        if (authLoading) return;
        
        // Check if user is authenticated
        if (!isAuthenticated || !customer) {
          redirectToLogin();
          return;
        }

        const customerId = customer._id || customer.customerId;
        if (!customerId) {
          throw new Error("Customer ID not found. Please login again.");
        }

        console.log('Fetching orders for customer:', customerId);
        
        const res = await fetch(`/api/orders?customerId=${customerId}`);
        const json = await res.json();
        
        console.log('Orders API response:', json);
        
        if (!res.ok) throw new Error(json?.error || 'Failed to load orders');
        let loaded = json.orders || [];

        // Check URL for cancellation flag
        try {
          const params = new URLSearchParams(window.location.search);
          const canceled = params.get('canceled');
          const canceledOrderId = params.get('orderId');
          if (canceled === 'true' && canceledOrderId) {
            // Remove cancelled order from list
            loaded = (loaded || []).filter((o:any) => String(o._id) !== String(canceledOrderId));
            setMessage('Order cancelled successfully.');
            // remove query params from URL to avoid repeated message
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('canceled');
            newUrl.searchParams.delete('orderId');
            window.history.replaceState({}, '', newUrl.toString());
            // Clear message after 5 seconds
            setTimeout(() => setMessage(null), 5000);
          }
        } catch (err) {
          // ignore
        }

        setOrders(loaded);
      } catch (e: any) { 
        console.error('Error loading orders:', e);
        setError(e.message);
      } finally { 
        setLoading(false);
      }        
    };
    
    load();
  }, [customer, isAuthenticated, authLoading, redirectToLogin]);

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavBar customer={customer || undefined} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Orders</h1>
        {message && (
          <div className="mb-6 rounded border border-green-200 bg-green-50 p-4 text-green-700">{message}</div>
        )}
        {loading && <div className="py-10 text-gray-600">Loading…</div>}
        {error && <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((o:any)=>(
            <a key={o._id} href={`/customer/orders/${o._id}`} className="rounded-lg border border-gray-200 bg-white p-6 hover:border-green-300 hover:shadow-md transition-all flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-500">Order ID</div>
                  <div className="text-base font-semibold text-gray-900">{o._id}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Date not available'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total Amount</div>
                  <div className="text-lg font-bold text-green-600">Rs. {o.totalAmount?.toFixed?.(2) || o.totalAmount}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      o.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      o.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      o.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      o.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Product Details */}
              <div className="border-t border-gray-100 pt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Products:</div>
                <div className="space-y-2">
                  {o.items && o.items.length > 0 ? (
                    <>
                      {o.items.slice(0, 2).map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-3">
                            {item.image && (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <span className="text-gray-900 font-medium">{item.name}</span>
                          </div>
                          <div className="text-gray-600">
                            Qty: {item.quantity} × Rs. {item.price?.toFixed?.(2) || item.price}
                          </div>
                        </div>
                      ))}
                      {o.items.length > 2 && (
                        <div className="text-sm text-gray-500 italic">
                          +{o.items.length - 2} more item{o.items.length - 2 > 1 ? 's' : ''}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">No product details available</div>
                  )}
                </div>
              </div>

              {/* Seller and Payment Info */}
              <div className="border-t border-gray-100 pt-4 mt-4 flex items-center justify-between">
                <div>
                  {o.supplier?.name ? (
                    <div className="text-sm">
                      <span className="text-gray-500">Seller: </span>
                      <span className="text-gray-900 font-medium">{o.supplier.name}</span>
                      {o.supplier.businessName && (
                        <span className="text-gray-600"> ({o.supplier.businessName})</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Seller information not available</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm">
                    <span className="text-gray-500">Payment: </span>
                    <span className={`font-medium ${
                      o.paymentStatus === 'paid' ? 'text-green-600' :
                      o.paymentStatus === 'failed' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {o.paymentStatus}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    via {o.paymentMethod || 'N/A'}
                  </div>
                </div>
              </div>
            </a>
          ))}
          {(!loading && !error && orders.length === 0) && (
            <div className="rounded border border-gray-200 bg-white p-6 text-gray-600">No orders yet.</div>
          )}
        </div>
      </main>
    </div>
  );
}


