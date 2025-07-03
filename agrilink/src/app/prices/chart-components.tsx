import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Category Charts View Component - Now shows commodities within a category
function CategoryChartsView({ commodityData, selectedCategory, colors }: any) {
  const pieData = commodityData.map((item: any, index: number) => ({
    name: item.commodity,
    value: item.averagePrice,
    count: item.count,
    totalValue: item.totalValue,
    unit: item.unit,
    fill: colors[index % colors.length]
  }));

  return (
    <div>
      <h2 className="text-2xl font-bold text-green-700 mb-6">
        Commodities in {selectedCategory}
      </h2>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Price by Commodity</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  dataKey="value"
                  label={({name, percent}: any) => `${name} (${((percent || 0) * 100).toFixed(1)}%)`}
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`Rs. ${value.toFixed(2)}`, 'Average Price']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available for this category
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Commodity Summary</h3>
          {pieData.map((item: any, index: number) => (
            <div key={item.name} className="bg-white rounded-lg shadow-md p-4 border-l-4" style={{borderLeftColor: colors[index % colors.length]}}>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.unit} • {item.count} entries</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">Rs. {item.value.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Average Price</p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Total Value: <span className="font-semibold">Rs. {item.totalValue.toFixed(2)}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Commodity Analysis View Component
function CommodityAnalysisView({ commodityData, selectedCategory, colors }: any) {
  const barData = commodityData.slice(0, 15).map((item: any) => ({
    name: `${item.commodity} (${item.market})`,
    changePercentage: item.changePercentage,
    yesterdayPrice: item.yesterdayPrice,
    todayPrice: item.todayPrice,
    fill: item.changePercentage >= 0 ? '#EF4444' : '#10B981'
  }));

  return (
    <div>
      <h2 className="text-2xl font-bold text-green-700 mb-6">
        Price Changes Analysis
        {selectedCategory && <span className="text-lg font-normal text-gray-600"> - {selectedCategory}</span>}
      </h2>
      
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Change Percentage</h3>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={100}
              fontSize={12}
            />
            <YAxis label={{ value: 'Change (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value: any) => [`${value.toFixed(2)}%`, 'Price Change']}
              labelFormatter={(label) => `Commodity: ${label}`}
            />
            <Bar dataKey="changePercentage" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-green-50 border-b border-green-100">
          <h3 className="text-lg font-semibold text-green-700">Detailed Price Changes</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {commodityData.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{item.commodity}</h4>
                  <p className="text-sm text-gray-600">{item.market} • {item.category}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Yesterday: Rs. {item.yesterdayPrice?.toFixed(2)}</p>
                    <p className="text-sm font-semibold text-gray-900">Today: Rs. {item.todayPrice?.toFixed(2)}</p>
                  </div>
                  <div className={`text-right ${item.changePercentage >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    <p className="text-lg font-bold">
                      {item.changePercentage >= 0 ? '+' : ''}{item.changePercentage?.toFixed(2)}%
                    </p>
                    <p className="text-sm">
                      {item.changePercentage >= 0 ? '+' : ''}Rs. {item.changeAmount?.toFixed(2)}
                    </p>
                  </div>
                  {item.significantChange && (
                    <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                      Significant
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { CategoryChartsView, CommodityAnalysisView };
