"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navigation from "../../../components/Navigation";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/orders?orderId=${params.id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed to load order');
        setOrder(json.order);
      } catch (e:any) { setError(e.message);} finally { setLoading(false);} 
    };
    if (params?.id) load();
  }, [params?.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Order Details</h1>
        {loading && <div className="py-10 text-gray-600">Loading…</div>}
        {error && <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        {order && (
          <div className="space-y-6">
            <section className="rounded border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Order</div>
                  <div className="text-base font-semibold text-gray-900">{order._id}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="text-base font-semibold text-gray-900">Rs. {order.totalAmount?.toFixed?.(2) || order.totalAmount}</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">Status: {order.status} • Payment: {order.paymentStatus}</div>
            </section>
            <section className="rounded border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Items</h2>
              <div className="space-y-3">
                {order.items.map((i:any)=>(
                  <div key={i._id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden">{i.image && <img src={i.image} alt={i.name} className="w-full h-full object-cover" />}</div>
                      <div>
                        <div className="font-medium text-gray-900">{i.name}</div>
                        <div className="text-gray-600">Qty: {i.quantity}</div>
                      </div>
                    </div>
                    <div className="font-semibold text-gray-900">Rs. {(i.price*i.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Tracking</h2>
              <ol className="space-y-2">
                {(order.tracking||[]).map((t:any, idx:number)=> (
                  <li key={idx} className="text-sm text-gray-700">{new Date(t.at).toLocaleString()} — {t.status}{t.note?`: ${t.note}`:''}</li>
                ))}
              </ol>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}


