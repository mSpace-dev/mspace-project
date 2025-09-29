"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from 'next/link';
import Navigation from "../../../components/Navigation";
import { useModal } from '../../../../components/ModalProvider';
import { useRouter } from 'next/navigation';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { confirm, alert } = useModal();

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <div>
            <div className="flex items-center space-x-3">
              <Link href="/customer/orders" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                ← Back to Your Orders
              </Link>
              <Link href="/products" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-green-50 text-sm font-medium text-green-700 hover:bg-green-100">
                Browse Products
              </Link>
            </div>
          </div>
        </div>
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
                  {order.deliveryFee != null && (
                    <div className="text-sm text-gray-600 mt-1">Delivery fee: <span className="font-medium">Rs. {(order.deliveryFee?.toFixed?.(2) || order.deliveryFee)}</span></div>
                  )}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">Status: {order.status} • Payment: {order.paymentStatus}</div>
              {order.status === 'pending' && (
                <div className="mt-4">
                  <div>
                    <button
                      onClick={async () => {
                        const ok = await confirm({ message: 'Are you sure you want to cancel this order?' });
                        if (!ok) return;
                        try {
                          const res = await fetch('/api/orders', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ orderId: order._id, status: 'cancelled', trackingNote: 'Cancelled by customer' })
                          });
                          const json = await res.json();
                          if (!res.ok) throw new Error(json?.error || 'Failed to cancel order');
                          // Redirect back to orders list
                          router.push('/customer/orders');
                        } catch (e:any) {
                          await alert(e.message || 'Cancel failed');
                        }
                      }}
                      className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md bg-white text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              )}
            </section>
            <section className="rounded border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Items</h2>
              <div className="space-y-3">
                {order.items.map((i:any)=>(
                  <div key={i._id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center overflow-hidden">
                        {i.image ? (
                          <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <svg className="w-8 h-8 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M7 7l5 5 5-5" />
                            </svg>
                          </div>
                        )}
                      </div>
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


