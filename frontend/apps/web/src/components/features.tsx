export function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose AgriLink?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform provides comprehensive agricultural solutions designed specifically for the Sri Lankan market.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="text-4xl mb-6">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-Time Price Alerts</h3>
            <p className="text-gray-600 leading-relaxed">
              Get instant notifications about market price changes for your crops. Never miss an opportunity to sell at the best price.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="text-4xl mb-6">🤖</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Insights</h3>
            <p className="text-gray-600 leading-relaxed">
              Our intelligent system analyzes market trends and provides personalized recommendations for optimal selling strategies.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="text-4xl mb-6">🌍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Island-Wide Coverage</h3>
            <p className="text-gray-600 leading-relaxed">
              Connect with markets across all 25 districts of Sri Lanka. Expand your reach and find the best buyers for your produce.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Farmers</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Real-time market price updates
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Direct connection with buyers
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Weather and crop advisory
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Mobile-friendly interface
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Consumers</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Fresh produce from local farmers
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Transparent pricing information
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Quality guarantee
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Home delivery options
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

