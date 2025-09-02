"use client";

import { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";

export default function CheckoutPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<any>({});
  const [creating, setCreating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const customer = JSON.parse(localStorage.getItem("customer") || "null");
        if (!customer?._id) throw new Error("Please login to checkout");
        
        // Get guest cart from localStorage
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        
        if (guestCart.length === 0) {
          throw new Error("Cart is empty");
        }
        
        // Transfer guest cart items to user's cart in database
        for (const item of guestCart) {
          await fetch("/api/customer/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerId: customer._id,
              productId: item.productId,
              name: item.name,
              type: item.type,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              description: item.description,
              seller: item.seller,
            }),
          });
        }
        
        // Clear guest cart
        localStorage.removeItem("guestCart");
        
        // Load the user's cart from database
        const res = await fetch(`/api/customer/cart?customerId=${customer._id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load cart");
        setCart(json.cart);
      } catch (e: any) { setError(e.message); } finally { setLoading(false); }
    };
    init();
  }, []);

  const placeOrder = async () => {
    try {
      setCreating(true);
      setError(null);
      
      // Validate required fields
      if (!address.line1 || !address.city || !address.district) {
        throw new Error('Please fill in all required address fields');
      }
      
      if (paymentMethod === 'card') {
        if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardName) {
          throw new Error('Please fill in all card details');
        }
      }
      
      const customer = JSON.parse(localStorage.getItem("customer") || "null");
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerId: customer._id, 
          paymentMethod: paymentMethod, 
          shippingAddress: address,
          cardDetails: paymentMethod === 'card' ? cardDetails : undefined
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to create order');
      
      if (paymentMethod === 'card') {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
        
        // Simulate payment success (in real app, this would be actual payment processing)
        const pay = await fetch('/api/payments', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ orderId: json.order._id, method: 'card' }) 
        });
        const payJson = await pay.json();
        if (!pay.ok) throw new Error(payJson?.error || 'Payment failed');
      }
      
      setOrderId(json.order._id);
      setShowSuccess(true);
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        location.href = `/customer/orders/${json.order._id}`;
      }, 3000);
      
    } catch (e: any) {
      setError(e.message);
    } finally { 
      setCreating(false); 
    }
  };

  const subtotal = cart?.items?.reduce((s: number, i: any) => s + i.price * i.quantity, 0) || 0;

  // Success modal
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Your order has been confirmed and will be processed shortly.
            {paymentMethod === 'card' && ' Payment has been processed successfully.'}
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>Order ID:</strong> {orderId?.slice(-8)}
            </p>
            <p className="text-sm text-green-800 mt-1">
              <strong>Payment Method:</strong> {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}
            </p>
          </div>
          <div className="space-y-3">
            <a
              href={`/customer/orders/${orderId}`}
              className="block w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View Order Details
            </a>
            <a
              href="/customer/orders"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View All Orders
            </a>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Redirecting to order details in a few seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
        {loading && <div className="py-10 text-gray-600">Loading…</div>}
        {error && <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        {cart && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 space-y-6">
              <div className="rounded border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input 
                    className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    placeholder="Address line 1 *" 
                    value={address.line1 || ''}
                    onChange={e=>setAddress((a:any)=>({...a,line1:e.target.value}))} 
                  />
                  <input 
                    className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    placeholder="Address line 2" 
                    value={address.line2 || ''}
                    onChange={e=>setAddress((a:any)=>({...a,line2:e.target.value}))} 
                  />
                  <input 
                    className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    placeholder="City *" 
                    value={address.city || ''}
                    onChange={e=>setAddress((a:any)=>({...a,city:e.target.value}))} 
                  />
                  <input 
                    className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    placeholder="District *" 
                    value={address.district || ''}
                    onChange={e=>setAddress((a:any)=>({...a,district:e.target.value}))} 
                  />
                  <input 
                    className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    placeholder="Province" 
                    value={address.province || ''}
                    onChange={e=>setAddress((a:any)=>({...a,province:e.target.value}))} 
                  />
                  <input 
                    className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    placeholder="Postal code" 
                    value={address.postalCode || ''}
                    onChange={e=>setAddress((a:any)=>({...a,postalCode:e.target.value}))} 
                  />
                </div>
              </div>

              <div className="rounded border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="cod"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <label htmlFor="cod" className="flex items-center space-x-2">
                      <span className="text-lg">💵</span>
                      <span className="font-medium text-gray-900">Cash on Delivery</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="card"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <label htmlFor="card" className="flex items-center space-x-2">
                      <span className="text-lg">💳</span>
                      <span className="font-medium text-gray-900">Credit/Debit Card</span>
                    </label>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-md font-semibold text-gray-900 mb-4">Card Details</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Card Number *"
                        value={cardDetails.cardNumber}
                        onChange={(e) => setCardDetails(prev => ({...prev, cardNumber: e.target.value}))}
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        maxLength={19}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="MM/YY *"
                          value={cardDetails.expiryDate}
                          onChange={(e) => setCardDetails(prev => ({...prev, expiryDate: e.target.value}))}
                          className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          maxLength={5}
                        />
                        <input
                          type="text"
                          placeholder="CVV *"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails(prev => ({...prev, cvv: e.target.value}))}
                          className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          maxLength={4}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Cardholder Name *"
                        value={cardDetails.cardName}
                        onChange={(e) => setCardDetails(prev => ({...prev, cardName: e.target.value}))}
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      🔒 Your payment information is secure and encrypted
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                <div className="space-y-3">
                  {cart.items.map((i:any)=>(
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
              </div>
            </section>
            <aside className="rounded border border-gray-200 bg-white p-6 h-fit">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-base">
                  <div className="text-gray-700">Subtotal</div>
                  <div className="font-semibold text-gray-900">Rs. {subtotal.toFixed(2)}</div>
                </div>
                <div className="flex items-center justify-between text-base">
                  <div className="text-gray-700">Delivery</div>
                  <div className="font-semibold text-green-600">Free</div>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <div className="text-gray-900">Total</div>
                    <div className="text-gray-900">Rs. {subtotal.toFixed(2)}</div>
                  </div>
                </div>
              </div>
              <button 
                disabled={creating} 
                onClick={placeOrder} 
                className="w-full mt-6 rounded-md bg-green-600 px-4 py-3 text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
              >
                {creating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {paymentMethod === 'card' ? 'Processing Payment...' : 'Placing Order...'}
                  </div>
                ) : (
                  paymentMethod === 'cod' ? 'Place Order (Cash on Delivery)' : 'Pay Now (Card)'
                )}
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">
                By placing this order, you agree to our terms and conditions
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}


