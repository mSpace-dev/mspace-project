"use client";

export default function Alerts() {
  const navigateToHome = () => {
    window.location.href = '/home';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer" onClick={navigateToHome}>
              <h1 className="text-2xl font-bold text-green-700 hover:text-green-600 transition-colors">AgriLink</h1>
              <span className="ml-2 text-sm text-gray-500">Sri Lanka</span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/prices" className="text-gray-700 hover:text-green-600 transition-colors">Prices</a>
              <a href="/alerts" className="text-gray-700 hover:text-green-600 transition-colors font-medium">Alerts</a>
              <a href="/demandforecast" className="text-gray-700 hover:text-green-600 transition-colors">Forecasts</a>
              <a href="/customer" className="btn-agrilink text-white px-4 py-2 rounded-lg">Log In</a>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="bg-gradient-to-br from-green-50 via-white to-green-100">
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
    </div>
  );
}
