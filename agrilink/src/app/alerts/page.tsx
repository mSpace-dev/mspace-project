export default function Alerts() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="container mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-green-700 mb-8 text-center">
          Price Alerts
        </h1>
        <p className="text-gray-600 text-lg text-center max-w-2xl mx-auto mb-12">
          Subscribe to SMS alerts for crop price changes in your region
        </p>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
          <div className="text-center text-gray-500">
            <h2 className="text-2xl font-semibold mb-4">Alert system coming soon...</h2>
            <p>We're building the SMS alert subscription system.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
