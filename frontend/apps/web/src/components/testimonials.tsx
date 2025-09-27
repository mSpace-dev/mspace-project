export function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Fresh Products from Local Farmers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover a wide variety of fresh agricultural products directly from Sri Lankan farmers. 
            Support local agriculture while enjoying the best quality produce.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="text-4xl mb-6">🥬</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Fresh Vegetables</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Get the freshest vegetables directly from local farms. From leafy greens to root vegetables, 
              all sourced from trusted farmers across Sri Lanka.
            </p>
            <a
              href="/products?category=vegetables"
              className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold"
            >
              Browse Vegetables
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="text-4xl mb-6">🍎</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Seasonal Fruits</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Enjoy the best seasonal fruits from Sri Lankan orchards. From tropical favorites to 
              traditional varieties, all picked at peak ripeness.
            </p>
            <a
              href="/products?category=fruits"
              className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold"
            >
              Browse Fruits
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="text-4xl mb-6">🌾</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Grains & Spices</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Premium quality rice, grains, and aromatic spices. Traditional Sri Lankan varieties 
              grown with care and delivered fresh to your doorstep.
            </p>
            <a
              href="/products?category=grains"
              className="inline-flex items-center text-yellow-600 hover:text-yellow-700 font-semibold"
            >
              Browse Grains
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/products"
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5-5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            Explore All Products
          </a>
        </div>
      </div>
    </section>
  )
}

