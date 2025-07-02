export default function Prices() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="container mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-green-700 mb-8 text-center">
          Agricultural Prices
        </h1>
        <p className="text-gray-600 text-lg text-center max-w-2xl mx-auto mb-12">
          Real-time pricing information for crops across Sri Lanka
        </p>
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center text-gray-500">
            <h2 className="text-2xl font-semibold mb-4">Price data coming soon...</h2>
            <p>We're working on integrating live agricultural price feeds.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
