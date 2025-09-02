"use client";

import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";

type Product = any;

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products?limit=24");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load products");
      setProducts(json.data.products || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    setCartCount(cart.length);
  };

  useEffect(() => {
    fetchProducts();
    updateCartCount();
  }, []);

  const addToCart = (p: any) => {
    try {
      // Get existing cart from localStorage
      const cart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      
      // Check if item already exists
      const existingItem = cart.find((item: any) => item.productId === p._id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          productId: p._id,
          name: p.name,
          type: "product",
          price: p.price,
          quantity: 1,
          image: p.images?.[0],
          description: p.description || "",
          seller: p.sellerId?._id || p.sellerId,
          addedAt: new Date().toISOString()
        });
      }
      
      // Save back to localStorage
      localStorage.setItem("guestCart", JSON.stringify(cart));
      updateCartCount();
      
      // Show success message
      alert("Added to cart!");
    } catch (e: any) {
      alert("Failed to add to cart");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
            <p className="text-gray-600">Browse available products</p>
          </div>
          <a 
            href="/customer/cart" 
            className="relative bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            View Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </a>
        </header>

        {loading && (
          <div className="py-20 text-center text-gray-600">Loading products…</div>
        )}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700 mb-6">{error}</div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p: any) => (
            <div key={p._id} className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col">
              <div className="aspect-[4/3] bg-gray-100 rounded mb-3 overflow-hidden">
                {p.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{p.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-base font-semibold text-gray-900">Rs. {p.price?.toFixed?.(2) || p.price}</div>
                <button onClick={() => addToCart(p)} className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">Add to cart</button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}


