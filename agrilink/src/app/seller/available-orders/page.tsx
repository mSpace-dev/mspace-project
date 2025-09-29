"use client";

import { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import { useRouter } from 'next/navigation';

export default function AvailableOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [seller, setSeller] = useState<any>(null);

  useEffect(() => {
    const checkAuth = () => {
      const sellerData = localStorage.getItem("seller");
      if (sellerData) {
        const parsedSeller = JSON.parse(sellerData);
        setSeller(parsedSeller);
        setIsLoggedIn(true);
        fetchAvailableOrders();
      } else {
        setIsLoggedIn(false);
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Redirect sellers to their My Orders page — Available Orders removed.
  const router = useRouter();
  useEffect(() => {
    const sellerData = localStorage.getItem('seller');
    if (sellerData) {
      router.push('/seller/my-orders');
    }
  }, [router]);

  const fetchAvailableOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/orders/available");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load orders");
      setOrders(json.orders || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const claimOrder = async (orderId: string) => {
    // Create a better date input modal
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    
    // Create modal for date input
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.5); display: flex; align-items: center; 
      justify-content: center; z-index: 1000;
    `;
    
    modal.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 12px; max-width: 400px; width: 90%;">
        <h3 style="margin: 0 0 20px 0; color: #333; font-size: 18px;">Set Estimated Delivery Date</h3>
        <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">When do you expect to deliver this order?</p>
   <input type="date" id="deliveryDate" min="${minDate}" 
     style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; margin-bottom: 20px; color: #000;" />
   <div style="display: flex; gap: 10px; justify-content: flex-end;">
     <button id="cancelBtn" style="padding: 10px 20px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer; color: #000;">Cancel</button>
          <button id="confirmBtn" style="padding: 10px 20px; border: none; background: #16a34a; color: white; border-radius: 6px; cursor: pointer;">Claim Order</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const dateInput = modal.querySelector('#deliveryDate') as HTMLInputElement;
    const cancelBtn = modal.querySelector('#cancelBtn') as HTMLButtonElement;
    const confirmBtn = modal.querySelector('#confirmBtn') as HTMLButtonElement;
    
    // Set default date to 3 days from now
    const defaultDate = new Date(today);
    defaultDate.setDate(defaultDate.getDate() + 3);
    dateInput.value = defaultDate.toISOString().split('T')[0];
    
    return new Promise<void>((resolve) => {
      const cleanup = () => {
        document.body.removeChild(modal);
        resolve();
      };
      
      cancelBtn.onclick = cleanup;
      modal.onclick = (e) => {
        if (e.target === modal) cleanup();
      };
      
      confirmBtn.onclick = async () => {
        const estimatedDeliveryDate = dateInput.value;
        if (!estimatedDeliveryDate) {
          alert("Please select a delivery date");
          return;
        }
        
        cleanup();
        await proceedWithClaim(orderId, estimatedDeliveryDate);
      };
    });
  };
  
  const proceedWithClaim = async (orderId: string, estimatedDeliveryDate: string) => {
    try {
      const res = await fetch("/api/orders/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId, 
          sellerId: seller._id,
          sellerName: seller.name,
          businessName: seller.businessName,
          phone: seller.phone,
          email: seller.email,
          estimatedDeliveryDate: estimatedDeliveryDate
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to claim order");
      
      alert("Order claimed successfully!");
      fetchAvailableOrders(); // Refresh the list
    } catch (e: any) {
      alert(e.message);
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
            <p className="text-gray-600 mb-6">Please login as a seller to view available orders.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Available Orders</h1>
          <p className="text-gray-600">Browse and claim orders from customers</p>
        </header>

        {loading && (
          <div className="py-20 text-center text-gray-600">Loading available orders…</div>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Orders</h3>
            <p className="text-gray-600">There are currently no orders available to claim.</p>
          </div>
        )}

        <div className="grid gap-6">
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
                  <div className="text-lg font-semibold text-red-600">Rs. {order.totalAmount.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">{order.paymentMethod.toUpperCase()}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.name} x {item.quantity}</span>
                        <span className="font-medium text-red-600">Rs. {(item.price * item.quantity).toFixed(2)}</span>
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

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => claimOrder(order._id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  I Can Supply This Order
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

