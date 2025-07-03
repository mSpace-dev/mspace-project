'use client';

export default function SellerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-700">AgriLink</h1>
            </div>
            <a
              href="/home"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-700 mb-4">
            Seller Portal
          </h2>
          <p className="text-gray-600 text-lg">
            Coming Soon! The seller portal will allow agricultural sellers to manage their inventory, 
            set prices, and connect with customers.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-blue-700 mb-6">Features Coming Soon:</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">📦 Inventory Management</h4>
              <p className="text-gray-600">Track your agricultural products and stock levels</p>
            </div>
            <div className="p-4 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">💰 Price Setting</h4>
              <p className="text-gray-600">Set competitive prices based on market trends</p>
            </div>
            <div className="p-4 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">📊 Sales Analytics</h4>
              <p className="text-gray-600">View detailed sales reports and analytics</p>
            </div>
            <div className="p-4 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">🤝 Customer Management</h4>
              <p className="text-gray-600">Connect with buyers and manage orders</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
