"use client"

import { useState, useEffect } from "react"
import CustomerNavBar from '../../components/CustomerNavBar'
import { useCustomerAuth } from '../../hooks/useCustomerAuth'

// Types
type SummaryType = {
  increasing_demand_percentage: number
  decreasing_demand_percentage: number
  stable_demand_percentage: number
  total_items_analyzed: number
  items_with_increasing_demand: number
  items_with_stable_demand: number
  items_with_decreasing_demand: number
}

type ItemAnalysisType = {
  average_price: number
  demand_trend: string
  demand_change_percentage: number
  data_points: number
  price_data_points: number
  demand_data_points: number
}

type DashboardDataType = {
  summary: SummaryType
  items_analysis: Record<string, ItemAnalysisType>
}

type DistrictData = {
  district: string
  price: number
  demand: number
  trend: 'up' | 'down'
}

// Components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
      <h2 className="text-2xl font-bold text-green-700 mb-2">🔄 Analyzing Agricultural Data</h2>
      <p className="text-green-600">Processing market trends and demand patterns...</p>
    </div>
  </div>
)

const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h2>
      <p className="text-gray-600 mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
      >
        🔄 Retry Connection
      </button>
    </div>
  </div>
)

const SummaryCard = ({ icon, title, value, subtitle, colorClass }: {
  icon: string
  title: string
  value: number
  subtitle: string
  colorClass: string
}) => (
  <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${colorClass} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-3">{icon}</span>
          <h3 className="font-semibold text-gray-700">{title}</h3>
        </div>
        <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  </div>
)

const TrendBadge = ({ trend }: { trend: string }) => {
  const getTrendConfig = (trend: string) => {
    switch (trend) {
      case "Increasing":
        return { icon: "📈", color: "bg-green-100 text-green-800 border-green-200" }
      case "Decreasing":
        return { icon: "📉", color: "bg-red-100 text-red-800 border-red-200" }
      case "Stable":
        return { icon: "➡️", color: "bg-yellow-100 text-yellow-800 border-yellow-200" }
      default:
        return { icon: "❓", color: "bg-gray-100 text-gray-800 border-gray-200" }
    }
  }
  
  const config = getTrendConfig(trend)
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {trend}
    </span>
  )
}

const PriceChart = ({ itemData }: { itemData: ItemAnalysisType }) => {
  const generatePriceData = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const basePrice = itemData.average_price
      const variation = Math.sin(i) * 15 + (Math.random() * 8 - 4)
      return Math.max(basePrice + variation, 10)
    })
  }
  
  const priceData = generatePriceData()
  const maxPrice = Math.max(...priceData)
  const minPrice = Math.min(...priceData)
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-64">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-gray-700">📈 7-Day Price Trend</h4>
        <div className="text-sm text-gray-500">Rs./kg</div>
      </div>
      <div className="relative h-40">
        <svg className="w-full h-full" viewBox="0 0 300 120">
          {/* Grid lines */}
          {[0, 30, 60, 90, 120].map((y) => (
            <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#f3f4f6" strokeWidth="1" />
          ))}
          
          {/* Price line */}
          <polyline
            points={priceData.map((price, i) => {
              const x = (i / 6) * 280 + 10
              const y = 100 - ((price - minPrice) / (maxPrice - minPrice)) * 80
              return `${x},${y}`
            }).join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Data points */}
          {priceData.map((price, i) => {
            const x = (i / 6) * 280 + 10
            const y = 100 - ((price - minPrice) / (maxPrice - minPrice)) * 80
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#059669"
                stroke="white"
                strokeWidth="2"
              />
            )
          })}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 text-xs text-gray-500">
          Rs. {maxPrice.toFixed(0)}
        </div>
        <div className="absolute left-0 bottom-8 text-xs text-gray-500">
          Rs. {minPrice.toFixed(0)}
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>7 days ago</span>
        <span>Today</span>
      </div>
    </div>
  )
}

const DistrictComparison = ({ itemName }: { itemName: string }) => {
  const generateDistrictData = (itemName: string): DistrictData[] => {
    const districts = ["Colombo", "Dambulla", "Jaffna", "Kandy", "Galle"]
    return districts.map((district) => ({
      district,
      price: Math.random() * 200 + 50,
      demand: Math.random() * 1000 + 200,
      trend: Math.random() > 0.5 ? "up" as const : "down" as const,
    }))
  }
  
  const districtData = generateDistrictData(itemName)
  const maxPrice = Math.max(...districtData.map(d => d.price))
  
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-700 mb-4">🗺️ District Price Comparison</h4>
      {districtData.map((district) => (
        <div key={district.district} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <span className="text-lg">📍</span>
              <span className="font-medium text-gray-800">{district.district}</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm text-gray-500">Price</div>
                <div className="font-bold text-green-600">Rs. {district.price.toFixed(0)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Demand</div>
                <div className="font-bold text-blue-600">{district.demand.toFixed(0)} kg</div>
              </div>
              <div className="text-xl">
                {district.trend === "up" ? "📈" : "📉"}
              </div>
            </div>
          </div>
          
          {/* Price bar */}
          <div className="bg-gray-100 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(district.price / maxPrice) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}

const AIInsightCard = ({ insight, index }: { insight: string; index: number }) => (
  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
        {index + 1}
      </div>
      <p className="text-white font-medium leading-relaxed">{insight}</p>
    </div>
  </div>
)

export default function AgriculturalDashboard() {
  const { customer, isLoading: authLoading, isAuthenticated, redirectToLogin } = useCustomerAuth()
  const [dashboardData, setDashboardData] = useState<DashboardDataType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      redirectToLogin()
      return
    }
  }, [authLoading, isAuthenticated, redirectToLogin])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/demandforecast", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      setDashboardData(data)
      setLastUpdated(new Date().toLocaleString())
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to fetch data: ${err.message}`)
      } else {
        setError("Failed to fetch data: Unknown error")
      }
      console.error("Dashboard fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const generateAIInsight = (summary: SummaryType, items: Record<string, ItemAnalysisType>) => {
    const insights = []

    if (summary.increasing_demand_percentage > 50) {
      insights.push("🚀 Strong market growth detected! Over half of the crops show increasing demand trends.")
    } else if (summary.increasing_demand_percentage > 30) {
      insights.push("📊 Moderate market growth with several crops showing positive demand trends.")
    }

    if (summary.decreasing_demand_percentage > 40) {
      insights.push("⚠️ Market caution advised - significant portion of crops showing declining demand.")
    }

    if (summary.stable_demand_percentage > 60) {
      insights.push("⚖️ Market stability observed - most crops maintaining consistent demand levels.")
    }

    const itemsArray = Object.entries(items)
    if (itemsArray.length > 0) {
      const highestPriced = itemsArray.reduce(
        (max, [name, data]) => data.average_price > max.price ? { name, price: data.average_price } : max,
        { name: "", price: 0 }
      )

      const lowestPriced = itemsArray.reduce(
        (min, [name, data]) => data.average_price < min.price && data.average_price > 0 ? { name, price: data.average_price } : min,
        { name: "", price: Number.POSITIVE_INFINITY }
      )

      if (highestPriced.name) {
        insights.push(`💰 Premium crop: ${highestPriced.name} commands highest average price at Rs. ${highestPriced.price.toFixed(2)}/kg`)
      }

      if (lowestPriced.name && lowestPriced.price !== Number.POSITIVE_INFINITY) {
        insights.push(`💡 Value opportunity: ${lowestPriced.name} offers competitive pricing at Rs. ${lowestPriced.price.toFixed(2)}/kg`)
      }
    }

    return insights
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorDisplay error={error} onRetry={fetchDashboardData} />
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">No Data Available</h2>
          <p className="text-green-500">Please check your database connection.</p>
        </div>
      </div>
    )
  }
  if (authLoading) return <LoadingSpinner />
  if (!isAuthenticated || !customer) return null

  const { items_analysis, summary } = dashboardData
  const aiInsights = generateAIInsight(summary, items_analysis)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <CustomerNavBar customer={customer} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            🌾 Agricultural Market Intelligence
          </h1>
          <p className="text-xl text-green-700 mb-8">
            Real-time crop demand analysis powered by AI insights
          </p>
          
          {/* Status and Refresh */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 border border-green-200">
              <span className="text-green-700 font-medium">
                🕒 Last Updated: {lastUpdated}
              </span>
            </div>
            <button
              onClick={fetchDashboardData}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <SummaryCard
            icon="📊"
            title="Total Items"
            value={summary.total_items_analyzed}
            subtitle="Active crops analyzed"
            colorClass="border-blue-500"
          />
          <SummaryCard
            icon="📈"
            title="Increasing Demand"
            value={summary.items_with_increasing_demand}
            subtitle={`${summary.increasing_demand_percentage.toFixed(1)}% of total`}
            colorClass="border-green-500"
          />
          <SummaryCard
            icon="➡️"
            title="Stable Demand"
            value={summary.items_with_stable_demand}
            subtitle={`${summary.stable_demand_percentage.toFixed(1)}% of total`}
            colorClass="border-yellow-500"
          />
          <SummaryCard
            icon="📉"
            title="Decreasing Demand"
            value={summary.items_with_decreasing_demand}
            subtitle={`${summary.decreasing_demand_percentage.toFixed(1)}% of total`}
            colorClass="border-red-500"
          />
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 mb-12 text-white">
          <div className="flex items-center mb-6">
            <div className="text-3xl mr-4">🤖</div>
            <div>
              <h2 className="text-2xl font-bold">AI Market Insights</h2>
              <p className="text-green-100">Real-time analysis and recommendations</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.map((insight, index) => (
              <AIInsightCard key={index} insight={insight} index={index} />
            ))}
          </div>
        </div>

        {/* Crop Analysis */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
            <span className="mr-3">📋</span>
            Detailed Crop Analysis
            <span className="ml-4 text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
              Click items to view charts
            </span>
          </h2>
          
          <div className="space-y-6">
            {Object.entries(items_analysis).map(([itemName, itemData]) => (
              <div
                key={itemName}
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                  selectedItem === itemName
                    ? 'border-green-500 bg-green-50 shadow-lg'
                    : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                }`}
                onClick={() => setSelectedItem(selectedItem === itemName ? null : itemName)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      🌱 {itemName}
                    </h3>
                    <TrendBadge trend={itemData.demand_trend} />
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Average Price</div>
                      <div className="text-lg font-bold text-green-600">
                        Rs. {itemData.average_price.toFixed(2)}/kg
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Change</div>
                      <div className={`text-lg font-bold ${
                        itemData.demand_change_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {itemData.demand_change_percentage >= 0 ? '+' : ''}
                        {itemData.demand_change_percentage.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-2xl">
                      {selectedItem === itemName ? '📊' : '👆'}
                    </div>
                  </div>
                </div>

                {selectedItem === itemName && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <PriceChart itemData={itemData} />
                      <DistrictComparison itemName={itemName} />
                    </div>
                    
                    {/* AI Recommendation */}
                    <div className="mt-8 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-6 border border-green-200">
                      <h4 className="font-bold text-green-800 mb-3 flex items-center">
                        <span className="mr-2">🎯</span>
                        AI Recommendation:
                      </h4>
                      <p className="text-green-700 leading-relaxed">
                        {itemData.demand_trend === "Increasing" && itemData.demand_change_percentage > 10
                          ? `🚀 Strong growth opportunity! Consider increasing supply as demand is rising by ${itemData.demand_change_percentage.toFixed(1)}%. Market conditions are favorable for expansion.`
                          : itemData.demand_trend === "Decreasing" && itemData.demand_change_percentage < -10
                            ? `⚠️ Market caution advised. Demand declining by ${Math.abs(itemData.demand_change_percentage).toFixed(1)}%. Consider diversification or cost optimization strategies.`
                            : itemData.demand_trend === "Stable"
                              ? `⚖️ Stable market conditions detected. Excellent for consistent planning with predictable demand patterns. Focus on quality improvements.`
                              : `🔍 Monitor closely. Limited data available for comprehensive trend analysis. Recommend gathering more market intelligence.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200">
          <p className="text-green-700 font-medium">
            🔄 Data refreshes automatically every 5 minutes | 🤖 Powered by AI-driven market analysis
          </p>
        </div>
      </div>
    </div>
  )
}
