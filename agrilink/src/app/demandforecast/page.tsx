

"use client"

import { useEffect, useState } from "react"
import Navigation from "../components/Navigation"

const Summary = {
  increasing_demand_percentage: 0,
  decreasing_demand_percentage: 0,
  stable_demand_percentage: 0,
  total_items_analyzed: 0,
  items_with_increasing_demand: 0,
  items_with_stable_demand: 0,
  items_with_decreasing_demand: 0,
}

const ItemAnalysis = {
  average_price: 0,
  demand_trend: "",
  demand_change_percentage: 0,
  data_points: 0,
  price_data_points: 0,
  demand_data_points: 0,
}

const DashboardData = {
  summary: Summary,
  items_analysis: {},
}

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

export default function AgriculturalDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardDataType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "Increasing":
        return "📈"
      case "Decreasing":
        return "📉"
      case "Stable":
        return "➡️"
      default:
        return "❓"
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "Increasing":
        return "#5cf15c"
      case "Decreasing":
        return "#dc2626"
      case "Stable":
        return "#d97706"
      default:
        return "#6b7280"
    }
  }

  // Mock data for district-wise analysis
  const generateDistrictData = (itemName: string) => {
    const districts = ["Colombo", "Dambulla", "Jaffna", "Kandy", "Galle"]
    return districts.map((district) => ({
      district,
      price: Math.random() * 200 + 50,
      demand: Math.random() * 1000 + 200,
      trend: Math.random() > 0.5 ? "up" : "down",
    }))
  }

  const generateAIInsight = (
    summary: {
      increasing_demand_percentage: number
      decreasing_demand_percentage: number
      stable_demand_percentage: number
      total_items_analyzed: number
      items_with_increasing_demand: number
      items_with_stable_demand: number
      items_with_decreasing_demand: number
    },
    items: Record<string, any>,
  ) => {
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
        (max, [name, data]) =>
          (data as any).average_price > max.price ? { name, price: (data as any).average_price } : max,
        { name: "", price: 0 },
      )

      const lowestPriced = itemsArray.reduce(
        (min, [name, data]) =>
          data.average_price < min.price && data.average_price > 0 ? { name, price: data.average_price } : min,
        { name: "", price: Number.POSITIVE_INFINITY },
      )

      if (highestPriced.name) {
        insights.push(
          `💰 Premium crop: ${highestPriced.name} commands highest average price at Rs. ${highestPriced.price.toFixed(2)}/kg`,
        )
      }

      if (lowestPriced.name && lowestPriced.price !== Number.POSITIVE_INFINITY) {
        insights.push(
          `💡 Value opportunity: ${lowestPriced.name} offers competitive pricing at Rs. ${lowestPriced.price.toFixed(2)}/kg`,
        )
      }
    }

    return insights
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="mx-auto h-12 w-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
          <h2 className="mt-6 text-xl font-semibold text-gray-900">Loading demand forecasts…</h2>
          <p className="mt-2 text-gray-600">Processing market trends and demand patterns</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="mx-auto w-full rounded-lg border border-red-200 bg-red-50 p-8">
            <div className="text-5xl mb-2">⚠️</div>
            <h2 className="text-lg font-semibold text-red-700">Connection error</h2>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <button onClick={fetchDashboardData} className="mt-6 inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="text-5xl mb-2">📊</div>
          <h2 className="text-lg font-semibold text-gray-900">No data available</h2>
          <p className="mt-1 text-sm text-gray-600">Please check your database connection.</p>
        </div>
      </div>
    )
  }

  const { items_analysis, summary } = dashboardData
  const aiInsights = generateAIInsight(summary, items_analysis)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Demand Forecasts</h1>
            <p className="text-gray-600 mt-1">Real-time crop demand analysis powered by AI</p>
            </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Last updated: {lastUpdated}</span>
            <button onClick={fetchDashboardData} className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700">
              Refresh
            </button>
          </div>
        </header>

        {/* Summary */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="text-sm text-gray-500">Total items analyzed</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{summary.total_items_analyzed}</div>
            </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="text-sm text-gray-500">Increasing demand</div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-3xl font-semibold text-gray-900">{summary.items_with_increasing_demand}</div>
              <div className="text-sm text-green-600">{summary.increasing_demand_percentage.toFixed(1)}%</div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="text-sm text-gray-500">Stable demand</div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-3xl font-semibold text-gray-900">{summary.items_with_stable_demand}</div>
              <div className="text-sm text-amber-600">{summary.stable_demand_percentage.toFixed(1)}%</div>
            </div>
            </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="text-sm text-gray-500">Decreasing demand</div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-3xl font-semibold text-gray-900">{summary.items_with_decreasing_demand}</div>
              <div className="text-sm text-red-600">{summary.decreasing_demand_percentage.toFixed(1)}%</div>
          </div>
        </div>
        </section>

        {/* Insights */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">AI insights</h2>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {aiInsights.map((insight, index) => (
                <li key={index}>{insight.replace(/^([\u2700-\u27BF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83D[\uDE80-\uDEFF]|\uD83E[\uDD00-\uDDFF])\s*/,'')}</li>
              ))}
            </ul>
            </div>
        </section>

        {/* Items analysis */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            {Object.entries(items_analysis).map(([itemName, itemData]) => (
            <div key={itemName} className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                  <h3 className="text-xl font-semibold text-gray-900">{itemName}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div>Avg. price: <span className="font-medium text-gray-900">Rs. {itemData.average_price.toFixed(2)}/kg</span></div>
                    <div>Trend: <span className="font-medium" style={{color:getTrendColor(itemData.demand_trend)}}>{itemData.demand_trend}</span></div>
                      </div>
                    </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${itemData.demand_change_percentage >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {itemData.demand_change_percentage >= 0 ? '+' : ''}{itemData.demand_change_percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">Demand change</div>
                  </div>
                </div>

                {selectedItem === itemName && (
                <div className="mt-6">
                  <div className="text-sm text-gray-700">
                          {itemData.demand_trend === "Increasing" && itemData.demand_change_percentage > 10
                      ? `Strong growth opportunity. Consider increasing supply as demand is rising by ${itemData.demand_change_percentage.toFixed(1)}%.`
                            : itemData.demand_trend === "Decreasing" && itemData.demand_change_percentage < -10
                        ? `Market caution advised. Demand declining by ${Math.abs(itemData.demand_change_percentage).toFixed(1)}%.`
                              : itemData.demand_trend === "Stable"
                          ? "Stable market conditions detected. Focus on consistency and quality."
                          : "Monitor closely. Limited data available for comprehensive trend analysis."}
                    </div>
                  </div>
                )}

              <button onClick={() => setSelectedItem(selectedItem === itemName ? null : itemName)} className="mt-4 text-sm font-medium text-green-700 hover:text-green-800">
                {selectedItem === itemName ? 'Hide details' : 'View details'}
              </button>
              </div>
            ))}
        </section>
      </main>
    </div>
  )
}
