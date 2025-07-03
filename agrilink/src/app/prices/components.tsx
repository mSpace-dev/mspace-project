// Table View Component
function TableView({ 
  prices, 
  filters, 
  setFilters, 
  categories, 
  locations, 
  markets,
  formatPrice, 
  formatChange, 
  getTrendColor, 
  getTrendIcon 
}: any) {
  return (
    <>
      {/* Extended Filters for Table View */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-green-700 mb-4">Filter Prices</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
            >
              <option value="" className="text-gray-900">All Categories</option>
              {categories.map((cat: string) => (
                <option key={cat} value={cat} className="text-gray-900">{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Market Type</label>
            <select
              value={filters.marketType}
              onChange={(e) => setFilters({...filters, marketType: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
            >
              <option value="" className="text-gray-900">All Markets</option>
              <option value="wholesale" className="text-gray-900">Wholesale</option>
              <option value="retail" className="text-gray-900">Retail</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Market</label>
            <select
              value={filters.market}
              onChange={(e) => setFilters({...filters, market: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
            >
              <option value="" className="text-gray-900">All Markets</option>
              {markets.map((market: string) => (
                <option key={market} value={market} className="text-gray-900">{market}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Commodity</label>
            <input
              type="text"
              value={filters.commodity}
              onChange={(e) => setFilters({...filters, commodity: e.target.value})}
              placeholder="Search commodity..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.significantOnly}
              onChange={(e) => setFilters({...filters, significantOnly: e.target.checked})}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">Show only significant changes (±5%)</span>
          </label>
        </div>
      </div>

      {/* Price Data Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-green-50 border-b border-green-100">
          <h2 className="text-xl font-semibold text-green-700">
            Price Data ({prices.length} items)
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Last updated: {prices.length > 0 ? new Date(prices[0].date).toLocaleDateString() : 'No data'}
          </p>
        </div>

        {prices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No price data available</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commodity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yesterday
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Today
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prices.map((price: any) => (
                  <tr key={price.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{price.commodity}</div>
                        <div className="text-sm text-gray-500">{price.category} • {price.unit}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{price.market}</div>
                        <div className="text-sm text-gray-500 capitalize">{price.marketType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(price.yesterdayPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(price.todayPrice)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${getTrendColor(price.trend, price.significantChange)}`}>
                      {formatChange(price.changePercent, price.changeAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center text-sm ${getTrendColor(price.trend, price.significantChange)}`}>
                        {getTrendIcon(price.trend)}
                        <span className="ml-1 capitalize">{price.trend}</span>
                        {price.significantChange && (
                          <span className="ml-2 px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                            Significant
                          </span>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// Commodity Cards View Component
function CommodityCardsView({ categories, getCategoryIcon, onCategorySelect }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-green-700 mb-6">Select a Category</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category: string) => (
          <div
            key={category}
            onClick={() => onCategorySelect(category)}
            className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer transform hover:scale-105 transition-all duration-200 hover:shadow-xl"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 text-green-600">
                {getCategoryIcon(category)}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{category}</h3>
              <p className="text-gray-600">Click to view price analysis</p>
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  View Charts →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { TableView, CommodityCardsView };
