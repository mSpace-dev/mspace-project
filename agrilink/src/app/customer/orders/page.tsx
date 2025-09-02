"use client";

import { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const customer = JSON.parse(localStorage.getItem("customer") || "null");
        if (!customer?._id) throw new Error("Please login to view orders");
        const res = await fetch(`/api/orders?customerId=${customer._id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed to load orders');
        setOrders(json.orders || []);
      } catch (e:any) { setError(e.message);} finally { setLoading(false);}        
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Orders</h1>
        {loading && <div className="py-10 text-gray-600">Loading…</div>}
        {error && <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        <div className="space-y-4">
          {orders.map((o:any)=>(
            <a key={o._id} href={`/customer/orders/${o._id}`} className="block rounded border border-gray-200 bg-white p-4 hover:border-green-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Order</div>
                  <div className="text-base font-semibold text-gray-900">{o._id}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="text-base font-semibold text-gray-900">Rs. {o.totalAmount?.toFixed?.(2) || o.totalAmount}</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">Status: {o.status} • Payment: {o.paymentStatus}</div>
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


