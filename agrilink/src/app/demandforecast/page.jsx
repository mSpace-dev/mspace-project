

"use client"

import { useState, useEffect } from "react"

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

export default function AgriculturalDashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)

  const fetchDashboardData = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/dashboard-analytics", {
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

  const getTrendIcon = (trend) => {
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

  const getTrendColor = (trend) => {
    switch (trend) {
      case "Increasing":
        return "#059669"
      case "Decreasing":
        return "#dc2626"
      case "Stable":
        return "#d97706"
      default:
        return "#6b7280"
    }
  }

  // Mock data for district-wise analysis
  const generateDistrictData = (itemName) => {
    const districts = ["Colombo", "Dambulla", "Jaffna", "Kandy", "Galle"]
    return districts.map((district) => ({
      district,
      price: Math.random() * 200 + 50,
      demand: Math.random() * 1000 + 200,
      trend: Math.random() > 0.5 ? "up" : "down",
    }))
  }

  const generateAIInsight = (summary, items) => {
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
        (max, [name, data]) => (data.average_price > max.price ? { name, price: data.average_price } : max),
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
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", padding: "20px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", textAlign: "center", paddingTop: "100px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              border: "4px solid #bbf7d0",
              borderTop: "4px solid #059669",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 30px",
            }}
          ></div>
          <h2 style={{ color: "#065f46", fontSize: "28px", marginBottom: "10px", fontWeight: "700" }}>
            🔄 Analyzing Agricultural Data
          </h2>
          <p style={{ color: "#047857", fontSize: "18px" }}>Processing market trends and demand patterns...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", padding: "20px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", paddingTop: "100px" }}>
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "2px solid #fecaca",
              borderRadius: "20px",
              padding: "40px",
              boxShadow: "0 15px 35px rgba(220, 38, 38, 0.1)",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>⚠️</div>
            <h2 style={{ color: "#dc2626", fontSize: "24px", marginBottom: "15px" }}>Connection Error</h2>
            <p style={{ color: "#7f1d1d", fontSize: "16px", marginBottom: "25px" }}>{error}</p>
            <button
              onClick={fetchDashboardData}
              style={{
                background: "linear-gradient(135deg, #059669, #047857)",
                color: "white",
                padding: "14px 28px",
                borderRadius: "12px",
                border: "none",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(5, 150, 105, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)"
                e.target.style.boxShadow = "0 8px 25px rgba(5, 150, 105, 0.4)"
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)"
                e.target.style.boxShadow = "0 4px 15px rgba(5, 150, 105, 0.3)"
              }}
            >
              🔄 Retry Connection
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", padding: "20px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", paddingTop: "100px" }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>📊</div>
          <h2 style={{ color: "#065f46", fontSize: "24px" }}>No Data Available</h2>
          <p style={{ color: "#047857", fontSize: "16px" }}>Please check your database connection.</p>
        </div>
      </div>
    )
  }

  const { items_analysis, summary } = dashboardData
  const aiInsights = generateAIInsight(summary, items_analysis)

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", padding: "20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <h1
            style={{
              fontSize: "52px",
              fontWeight: "800",
              background: "linear-gradient(135deg, #059669, #047857, #065f46)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "20px",
              textShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            🌾 Agricultural Market Intelligence
          </h1>
          <p style={{ color: "#047857", fontSize: "20px", fontWeight: "600", marginBottom: "20px" }}>
            Real-time crop demand analysis powered by AI insights
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
              padding: "12px 24px",
              borderRadius: "25px",
              border: "2px solid #a7f3d0",
              fontSize: "18px",
              color: "#065f46",
              fontWeight: "600",
              boxShadow: "0 8px 25px rgba(5, 150, 105, 0.15)",
            }}
          >
            <span style={{ marginRight: "12px", fontSize: "20px" }}>🕒</span>
            Last updated: {lastUpdated}
            <button
              onClick={fetchDashboardData}
              style={{
                marginLeft: "20px",
                background: "linear-gradient(135deg, #059669, #047857)",
                color: "white",
                border: "none",
                borderRadius: "20px",
                padding: "8px 20px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(5, 150, 105, 0.3)",
                animation: "pulse 2s infinite",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.1)"
                e.target.style.boxShadow = "0 6px 20px rgba(5, 150, 105, 0.4)"
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)"
                e.target.style.boxShadow = "0 4px 15px rgba(5, 150, 105, 0.3)"
              }}
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "25px",
            marginBottom: "50px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
              padding: "35px",
              borderRadius: "25px",
              border: "3px solid #a7f3d0",
              boxShadow: "0 15px 35px rgba(16, 185, 129, 0.15)",
              transition: "all 0.4s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)"
              e.currentTarget.style.boxShadow = "0 25px 50px rgba(16, 185, 129, 0.25)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "0 15px 35px rgba(16, 185, 129, 0.15)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
              <span style={{ fontSize: "40px", marginRight: "15px" }}>📊</span>
              <h3 style={{ color: "#065f46", fontSize: "20px", fontWeight: "700", margin: 0 }}>Total Items Analyzed</h3>
            </div>
            <div style={{ fontSize: "42px", fontWeight: "800", color: "#047857", marginBottom: "12px" }}>
              {summary.total_items_analyzed}
            </div>
            <p style={{ color: "#059669", fontSize: "16px", margin: 0, fontWeight: "500" }}>Active crops in database</p>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
              padding: "35px",
              borderRadius: "25px",
              border: "3px solid #bbf7d0",
              boxShadow: "0 15px 35px rgba(34, 197, 94, 0.15)",
              transition: "all 0.4s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)"
              e.currentTarget.style.boxShadow = "0 25px 50px rgba(34, 197, 94, 0.25)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "0 15px 35px rgba(34, 197, 94, 0.15)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
              <span style={{ fontSize: "40px", marginRight: "15px" }}>📈</span>
              <h3 style={{ color: "#166534", fontSize: "20px", fontWeight: "700", margin: 0 }}>Increasing Demand</h3>
            </div>
            <div style={{ fontSize: "42px", fontWeight: "800", color: "#15803d", marginBottom: "12px" }}>
              {summary.items_with_increasing_demand}
            </div>
            <p style={{ color: "#16a34a", fontSize: "16px", margin: 0, fontWeight: "500" }}>
              {summary.increasing_demand_percentage.toFixed(1)}% of total crops
            </p>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #fef3c7, #fde68a)",
              padding: "35px",
              borderRadius: "25px",
              border: "3px solid #fcd34d",
              boxShadow: "0 15px 35px rgba(245, 158, 11, 0.15)",
              transition: "all 0.4s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)"
              e.currentTarget.style.boxShadow = "0 25px 50px rgba(245, 158, 11, 0.25)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "0 15px 35px rgba(245, 158, 11, 0.15)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
              <span style={{ fontSize: "40px", marginRight: "15px" }}>➡️</span>
              <h3 style={{ color: "#92400e", fontSize: "20px", fontWeight: "700", margin: 0 }}>Stable Demand</h3>
            </div>
            <div style={{ fontSize: "42px", fontWeight: "800", color: "#b45309", marginBottom: "12px" }}>
              {summary.items_with_stable_demand}
            </div>
            <p style={{ color: "#d97706", fontSize: "16px", margin: 0, fontWeight: "500" }}>
              {summary.stable_demand_percentage.toFixed(1)}% of total crops
            </p>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #fef2f2, #fecaca)",
              padding: "35px",
              borderRadius: "25px",
              border: "3px solid #f87171",
              boxShadow: "0 15px 35px rgba(239, 68, 68, 0.15)",
              transition: "all 0.4s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)"
              e.currentTarget.style.boxShadow = "0 25px 50px rgba(239, 68, 68, 0.25)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "0 15px 35px rgba(239, 68, 68, 0.15)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
              <span style={{ fontSize: "40px", marginRight: "15px" }}>📉</span>
              <h3 style={{ color: "#991b1b", fontSize: "20px", fontWeight: "700", margin: 0 }}>Decreasing Demand</h3>
            </div>
            <div style={{ fontSize: "42px", fontWeight: "800", color: "#dc2626", marginBottom: "12px" }}>
              {summary.items_with_decreasing_demand}
            </div>
            <p style={{ color: "#ef4444", fontSize: "16px", margin: 0, fontWeight: "500" }}>
              {summary.decreasing_demand_percentage.toFixed(1)}% of total crops
            </p>
          </div>
        </div>

        {/* Enhanced AI Insights Panel */}
        <div
          style={{
            background: "linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)",
            padding: "50px",
            borderRadius: "30px",
            marginBottom: "50px",
            color: "white",
            boxShadow: "0 25px 50px rgba(5, 150, 105, 0.3)",
            border: "3px solid rgba(255,255,255,0.1)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-50%",
              right: "-50%",
              width: "200%",
              height: "200%",
              background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
              animation: "float 6s ease-in-out infinite",
            }}
          ></div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2
              style={{
                fontSize: "36px",
                fontWeight: "800",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              <span style={{ marginRight: "15px", fontSize: "40px" }}>🤖</span>
              AI Market Insights
              <span
                style={{
                  marginLeft: "15px",
                  fontSize: "14px",
                  background: "rgba(255,255,255,0.2)",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontWeight: "600",
                }}
              >
                LIVE
              </span>
            </h2>
            <div style={{ display: "grid", gap: "20px" }}>
              {aiInsights.map((insight, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    padding: "25px",
                    borderRadius: "20px",
                    backdropFilter: "blur(15px)",
                    border: "2px solid rgba(255,255,255,0.2)",
                    fontSize: "18px",
                    lineHeight: "1.7",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.25)"
                    e.currentTarget.style.transform = "translateX(10px)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)"
                    e.currentTarget.style.transform = "translateX(0)"
                  }}
                >
                  {insight}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Detailed Items Analysis */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "30px",
            padding: "50px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.1)",
            border: "3px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              fontSize: "36px",
              fontWeight: "800",
              marginBottom: "40px",
              color: "#065f46",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ marginRight: "15px" }}>📋</span>
            Detailed Crop Analysis
            <span
              style={{
                marginLeft: "15px",
                fontSize: "14px",
                background: "linear-gradient(135deg, #059669, #047857)",
                color: "white",
                padding: "6px 15px",
                borderRadius: "20px",
                fontWeight: "600",
              }}
            >
              Click to Explore
            </span>
          </h2>

          <div style={{ display: "grid", gap: "25px" }}>
            {Object.entries(items_analysis).map(([itemName, itemData]) => (
              <div
                key={itemName}
                style={{
                  border: selectedItem === itemName ? "3px solid #059669" : "3px solid #f3f4f6",
                  borderRadius: "20px",
                  padding: "30px",
                  transition: "all 0.4s ease",
                  cursor: "pointer",
                  background: selectedItem === itemName ? "linear-gradient(135deg, #f0fdf4, #dcfce7)" : "white",
                  boxShadow:
                    selectedItem === itemName ? "0 15px 35px rgba(5, 150, 105, 0.2)" : "0 5px 15px rgba(0,0,0,0.05)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onClick={() => setSelectedItem(selectedItem === itemName ? null : itemName)}
                onMouseEnter={(e) => {
                  if (selectedItem !== itemName) {
                    e.currentTarget.style.borderColor = "#a7f3d0"
                    e.currentTarget.style.transform = "translateY(-5px)"
                    e.currentTarget.style.boxShadow = "0 15px 35px rgba(5, 150, 105, 0.15)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedItem !== itemName) {
                    e.currentTarget.style.borderColor = "#f3f4f6"
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.05)"
                  }
                }}
              >
                {/* Click indicator */}
                <div
                  style={{
                    position: "absolute",
                    top: "15px",
                    right: "20px",
                    background:
                      selectedItem === itemName
                        ? "linear-gradient(135deg, #059669, #047857)"
                        : "linear-gradient(135deg, #d1d5db, #9ca3af)",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "15px",
                    fontSize: "12px",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                  }}
                >
                  {selectedItem === itemName ? "🔍 Expanded" : "👆 Click to View"}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "20px",
                    marginTop: "10px",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: "26px", fontWeight: "700", color: "#065f46", margin: "0 0 12px 0" }}>
                      🌱 {itemName}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "25px", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "20px", marginRight: "10px" }}>💰</span>
                        <span style={{ fontSize: "20px", fontWeight: "700", color: "#059669" }}>
                          Rs. {itemData.average_price.toFixed(2)}/kg
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: `${getTrendColor(itemData.demand_trend)}20`,
                          padding: "8px 16px",
                          borderRadius: "25px",
                          border: `2px solid ${getTrendColor(itemData.demand_trend)}40`,
                        }}
                      >
                        <span style={{ fontSize: "18px", marginRight: "8px" }}>
                          {getTrendIcon(itemData.demand_trend)}
                        </span>
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: "700",
                            color: getTrendColor(itemData.demand_trend),
                          }}
                        >
                          {itemData.demand_trend}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: "800",
                        color: itemData.demand_change_percentage >= 0 ? "#059669" : "#dc2626",
                      }}
                    >
                      {itemData.demand_change_percentage >= 0 ? "+" : ""}
                      {itemData.demand_change_percentage.toFixed(1)}%
                    </div>
                    <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: "600" }}>Demand Change</div>
                  </div>
                </div>

                {selectedItem === itemName && (
                  <div
                    style={{
                      marginTop: "30px",
                      padding: "30px",
                      background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                      borderRadius: "20px",
                      border: "2px solid #e2e8f0",
                    }}
                  >
                    <h4 style={{ fontSize: "20px", fontWeight: "700", color: "#065f46", marginBottom: "25px" }}>
                      📊 Detailed Statistics & District Analysis
                    </h4>

                    {/* Statistics Grid */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "20px",
                        marginBottom: "30px",
                      }}
                    >
                      <div
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          backgroundColor: "white",
                          borderRadius: "15px",
                          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                        }}
                      >
                        <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: "600", marginBottom: "8px" }}>
                          Total Data Points
                        </div>
                        <div style={{ fontSize: "24px", fontWeight: "800", color: "#059669" }}>
                          {itemData.data_points}
                        </div>
                      </div>
                      <div
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          backgroundColor: "white",
                          borderRadius: "15px",
                          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                        }}
                      >
                        <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: "600", marginBottom: "8px" }}>
                          Price Data Points
                        </div>
                        <div style={{ fontSize: "24px", fontWeight: "800", color: "#059669" }}>
                          {itemData.price_data_points}
                        </div>
                      </div>
                      <div
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          backgroundColor: "white",
                          borderRadius: "15px",
                          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                        }}
                      >
                        <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: "600", marginBottom: "8px" }}>
                          Demand Data Points
                        </div>
                        <div style={{ fontSize: "24px", fontWeight: "800", color: "#059669" }}>
                          {itemData.demand_data_points}
                        </div>
                      </div>
                    </div>

                    {/* District-wise Analysis Chart */}
                    <div style={{ marginBottom: "25px" }}>
                      <h5 style={{ fontSize: "18px", fontWeight: "700", color: "#065f46", marginBottom: "20px" }}>
                        🗺️ District-wise Price & Demand Analysis
                      </h5>
                      <div style={{ display: "grid", gap: "15px" }}>
                        {generateDistrictData(itemName).map((district, index) => (
                          <div
                            key={district.district}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "15px 20px",
                              backgroundColor: "white",
                              borderRadius: "12px",
                              border: "2px solid #e5e7eb",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "#059669"
                              e.currentTarget.style.transform = "translateX(5px)"
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "#e5e7eb"
                              e.currentTarget.style.transform = "translateX(0)"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <span style={{ fontSize: "18px", marginRight: "12px" }}>📍</span>
                              <span style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>
                                {district.district}
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "2px" }}>Price</div>
                                <div style={{ fontSize: "16px", fontWeight: "700", color: "#059669" }}>
                                  Rs. {district.price.toFixed(0)}
                                </div>
                              </div>
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "2px" }}>Demand</div>
                                <div style={{ fontSize: "16px", fontWeight: "700", color: "#047857" }}>
                                  {district.demand.toFixed(0)} kg
                                </div>
                              </div>
                              <div style={{ fontSize: "20px" }}>{district.trend === "up" ? "📈" : "📉"}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Recommendation */}
                    <div
                      style={{
                        padding: "25px",
                        background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                        borderRadius: "15px",
                        border: "2px solid #a7f3d0",
                      }}
                    >
                      <div style={{ fontSize: "16px", fontWeight: "700", color: "#065f46", marginBottom: "12px" }}>
                        🎯 AI Recommendation:
                      </div>
                      <div style={{ fontSize: "16px", color: "#047857", lineHeight: "1.6", fontWeight: "500" }}>
                        {itemData.demand_trend === "Increasing" && itemData.demand_change_percentage > 10
                          ? `Strong growth opportunity! Consider increasing supply as demand is rising by ${itemData.demand_change_percentage.toFixed(1)}%.`
                          : itemData.demand_trend === "Decreasing" && itemData.demand_change_percentage < -10
                            ? `Market caution advised. Demand declining by ${Math.abs(itemData.demand_change_percentage).toFixed(1)}%. Consider diversification.`
                            : itemData.demand_trend === "Stable"
                              ? `Stable market conditions. Good for consistent planning with predictable demand patterns.`
                              : `Monitor closely. Limited data available for comprehensive trend analysis.`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "50px",
            padding: "30px",
            background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
            borderRadius: "20px",
            border: "2px solid #a7f3d0",
          }}
        >
          <p style={{ color: "#047857", fontSize: "16px", fontWeight: "600", margin: 0 }}>
            🔄 Data refreshes automatically every 5 minutes | 🤖 Powered by AI-driven market analysis
          </p>
        </div>
      </div>

      {/* Enhanced CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  )
}
