

"use client"

import { useState, useEffect } from "react"
import CustomerUserProfile from '../components/CustomerUserProfile'

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
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", padding: "20px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", textAlign: "center", paddingTop: "100px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              border: "4px solid #bbf7d0",
              borderTop: "4px solid #10b981",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 30px",
            }}
          ></div>
          <h2 style={{ color: "#d12b0b", fontSize: "28px", marginBottom: "10px", fontWeight: "700" }}>
            🔄 Analyzing Agricultural Data
          </h2>
          <p style={{ color: "#70efcb", fontSize: "18px" }}>Processing market trends and demand patterns...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #70efcb, #dcfce7)", padding: "20px" }}>
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
                background: "linear-gradient(135deg, #10b981, #22c55e)",
                color: "white",
                padding: "14px 28px",
                borderRadius: "12px",
                border: "none",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
              }}
              onMouseEnter={(e) => {
                ;(e.target as HTMLButtonElement).style.transform = "translateY(-2px)"
                ;(e.target as HTMLButtonElement).style.boxShadow = "0 8px 25px rgba(16, 185, 129, 0.4)"
              }}
              onMouseLeave={(e) => {
                ;(e.target as HTMLButtonElement).style.transform = "translateY(0)"
                ;(e.target as HTMLButtonElement).style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.3)"
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
          <h2 style={{ color: "#22c55e", fontSize: "24px" }}>No Data Available</h2>
          <p style={{ color: "#4ade80", fontSize: "16px" }}>Please check your database connection.</p>
        </div>
      </div>
    )
  }

  const { items_analysis, summary } = dashboardData
  const aiInsights = generateAIInsight(summary, items_analysis)

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", padding: "20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Enhanced Header with Emphasized Refresh & Last Updated */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: "900",
              background: "linear-gradient(135deg, #10b981, #22c55e, #34d399)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "25px",
              textShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            🌾 Agricultural Market Intelligence
          </h1>
          <p style={{ color: "#4ade80", fontSize: "22px", fontWeight: "700", marginBottom: "30px" }}>
            Real-time crop demand analysis powered by AI insights
          </p>
          
          {/* User Profile and Navigation */}
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            gap: "20px",
            marginBottom: "20px" 
          }}>
            <a 
              href="/prices" 
              style={{ 
                color: "#22c55e", 
                textDecoration: "none", 
                fontSize: "16px", 
                fontWeight: "600",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "2px solid #22c55e",
                background: "white"
              }}
            >
              Prices
            </a>
            <a 
              href="/alerts" 
              style={{ 
                color: "#22c55e", 
                textDecoration: "none", 
                fontSize: "16px", 
                fontWeight: "600",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "2px solid #22c55e",
                background: "white"
              }}
            >
              Alerts
            </a>
            <div style={{ display: "flex", alignItems: "center" }}>
              <CustomerUserProfile 
                isLoggedIn={true} 
                userRole="customer"
                userName="Customer"
                userEmail="customer@example.com"
              />
            </div>
          </div>
          {/* Emphasized Last Updated & Refresh Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            {/* Last Updated - More Prominent */}
            <div
              style={{
                background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                padding: "20px 40px",
                borderRadius: "30px",
                border: "3px solid #a7f3d0",
                fontSize: "22px",
                color: "#22c55e",
                fontWeight: "800",
                boxShadow: "0 10px 30px rgba(16, 185, 129, 0.2)",
                animation: "glow 2s ease-in-out infinite alternate",
              }}
            >
              <span style={{ marginRight: "15px", fontSize: "24px" }}>🕒</span>
              Last Updated: {lastUpdated}
            </div>
            {/* Enhanced Refresh Button */}
            <button
              onClick={fetchDashboardData}
              style={{
                background: "linear-gradient(135deg, #10b981, #22c55e, #34d399)",
                color: "white",
                border: "none",
                borderRadius: "25px",
                padding: "18px 40px",
                fontSize: "18px",
                fontWeight: "800",
                cursor: "pointer",
                transition: "all 0.4s ease",
                boxShadow: "0 8px 25px rgba(16, 185, 129, 0.4)",
                animation: "pulse 2s infinite, bounce 1s ease-in-out infinite",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                ;(e.target as HTMLButtonElement).style.transform = "scale(1.15) translateY(-3px)"
                ;(e.target as HTMLButtonElement).style.boxShadow = "0 15px 40px rgba(16, 185, 129, 0.6)"
              }}
              onMouseLeave={(e) => {
                ;(e.target as HTMLButtonElement).style.transform = "scale(1) translateY(0)"
                ;(e.target as HTMLButtonElement).style.boxShadow = "0 8px 25px rgba(16, 185, 129, 0.4)"
              }}
            >
              <span style={{ marginRight: "10px", fontSize: "20px" }}>🔄</span>
              REFRESH DATA NOW
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  animation: "shimmer 2s infinite",
                }}
              ></div>
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
              <h3 style={{ color: "#22c55e", fontSize: "20px", fontWeight: "700", margin: 0 }}>Total Items Analyzed</h3>
            </div>
            <div style={{ fontSize: "42px", fontWeight: "800", color: "#4ade80", marginBottom: "12px" }}>
              {summary.total_items_analyzed}
            </div>
            <p style={{ color: "#10b981", fontSize: "16px", margin: 0, fontWeight: "500" }}>Active crops in database</p>
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
              <h3 style={{ color: "#34d399", fontSize: "20px", fontWeight: "700", margin: 0 }}>Increasing Demand</h3>
            </div>
            <div style={{ fontSize: "42px", fontWeight: "800", color: "#6ee7b7", marginBottom: "12px" }}>
              {summary.items_with_increasing_demand}
            </div>
            <p style={{ color: "#22c55e", fontSize: "16px", margin: 0, fontWeight: "500" }}>
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

        {/* SUPER ENHANCED AI Insights Panel - Main Focus */}
        <div
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #22c55e 25%, #34d399 50%, #22c55e 75%, #10b981 100%)",
            padding: "60px",
            borderRadius: "40px",
            marginBottom: "60px",
            color: "white",
            boxShadow: "0 30px 60px rgba(16, 185, 129, 0.4)",
            border: "4px solid rgba(255,255,255,0.2)",
            position: "relative",
            overflow: "hidden",
            animation: "aiGlow 3s ease-in-out infinite alternate",
          }}
        >
          {/* Animated Background Elements */}
          <div
            style={{
              position: "absolute",
              top: "-100%",
              left: "-100%",
              width: "300%",
              height: "300%",
              background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
              animation: "rotate 20s linear infinite",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(255,255,255,0.2)",
              padding: "10px 20px",
              borderRadius: "25px",
              fontSize: "14px",
              fontWeight: "700",
              animation: "pulse 1.5s infinite",
            }}
          >
            🔴 LIVE AI ANALYSIS
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2
              style={{
                fontSize: "48px",
                fontWeight: "900",
                marginBottom: "40px",
                display: "flex",
                alignItems: "center",
                textShadow: "0 4px 8px rgba(0,0,0,0.3)",
                animation: "textGlow 2s ease-in-out infinite alternate",
              }}
            >
              <span style={{ marginRight: "20px", fontSize: "50px", animation: "bounce 1s infinite" }}>🤖</span>
              AI MARKET INSIGHTS
              <span
                style={{
                  marginLeft: "20px",
                  fontSize: "16px",
                  background: "rgba(255,255,255,0.3)",
                  padding: "8px 16px",
                  borderRadius: "25px",
                  fontWeight: "700",
                  animation: "flash 1s infinite",
                }}
              >
                REAL-TIME
              </span>
            </h2>
            <div style={{ display: "grid", gap: "25px" }}>
              {aiInsights.map((insight, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    padding: "30px",
                    borderRadius: "25px",
                    backdropFilter: "blur(20px)",
                    border: "3px solid rgba(255,255,255,0.3)",
                    fontSize: "20px",
                    lineHeight: "1.8",
                    fontWeight: "600",
                    transition: "all 0.4s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)"
                    e.currentTarget.style.transform = "translateX(15px) scale(1.02)"
                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)"
                    e.currentTarget.style.transform = "translateX(0) scale(1)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: "0",
                      top: "0",
                      width: "5px",
                      height: "100%",
                      background: "linear-gradient(to bottom, #fbbf24, #f59e0b, #d97706)",
                      animation: `slideUp 2s ease-in-out infinite ${index * 0.5}s`,
                    }}
                  ></div>
                  {insight}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Detailed Items Analysis with Graphs */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "35px",
            padding: "60px",
            boxShadow: "0 30px 60px rgba(0,0,0,0.15)",
            border: "4px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              fontSize: "42px",
              fontWeight: "900",
              marginBottom: "50px",
              color: "#22c55e",
              display: "flex",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <span style={{ marginRight: "20px" }}>📋</span>
            Interactive Crop Analysis
            <span
              style={{
                marginLeft: "20px",
                fontSize: "16px",
                background: "linear-gradient(135deg, #10b981, #22c55e)",
                color: "white",
                padding: "10px 20px",
                borderRadius: "25px",
                fontWeight: "700",
                animation: "wiggle 1s ease-in-out infinite",
              }}
            >
              👆 CLICK TO EXPLORE GRAPHS
            </span>
          </h2>
          <div style={{ display: "grid", gap: "30px" }}>
            {Object.entries(items_analysis).map(([itemName, itemData]) => (
              <div
                key={itemName}
                style={{
                  border: selectedItem === itemName ? "4px solid #10b981" : "4px solid #f3f4f6",
                  borderRadius: "25px",
                  padding: "35px",
                  transition: "all 0.5s ease",
                  cursor: "pointer",
                  background:
                    selectedItem === itemName
                      ? "linear-gradient(135deg, #f0fdf4, #dcfce7)"
                      : "linear-gradient(135deg, #ffffff, #f9fafb)",
                  boxShadow:
                    selectedItem === itemName ? "0 20px 40px rgba(16, 185, 129, 0.3)" : "0 8px 20px rgba(0,0,0,0.08)",
                  position: "relative",
                  overflow: "hidden",
                  transform: selectedItem === itemName ? "scale(1.02)" : "scale(1)",
                }}
                onClick={() => setSelectedItem(selectedItem === itemName ? null : itemName)}
                onMouseEnter={(e) => {
                  if (selectedItem !== itemName) {
                    e.currentTarget.style.borderColor = "#a7f3d0"
                    e.currentTarget.style.transform = "translateY(-8px) scale(1.01)"
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(16, 185, 129, 0.2)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedItem !== itemName) {
                    e.currentTarget.style.borderColor = "#f3f4f6"
                    e.currentTarget.style.transform = "translateY(0) scale(1)"
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)"
                  }
                }}
              >
                {/* Enhanced Click Indicator */}
                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "25px",
                    background:
                      selectedItem === itemName
                        ? "linear-gradient(135deg, #10b981, #22c55e)"
                        : "linear-gradient(135deg, #f59e0b, #d97706)",
                    color: "white",
                    padding: "10px 18px",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: "700",
                    transition: "all 0.3s ease",
                    animation: selectedItem === itemName ? "none" : "bounce 2s infinite",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  }}
                >
                  {selectedItem === itemName ? "📊 VIEWING GRAPH" : "👆 CLICK FOR GRAPH"}
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
                    <h3 style={{ fontSize: "26px", fontWeight: "700", color: "#22c55e", margin: "0 0 12px 0" }}>
                      🌱 {itemName}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "25px", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "20px", marginRight: "10px" }}>💰</span>
                        <span style={{ fontSize: "20px", fontWeight: "700", color: "#10b981" }}>
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
                        color: itemData.demand_change_percentage >= 0 ? "#10b981" : "#dc2626",
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
                      marginTop: "40px",
                      padding: "40px",
                      background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                      borderRadius: "25px",
                      border: "3px solid #e2e8f0",
                    }}
                  >
                    <h4 style={{ fontSize: "24px", fontWeight: "800", color: "#22c55e", marginBottom: "30px" }}>
                      📊 Interactive Data Visualization & Analysis
                    </h4>
                    {/* Simple Price Trend Graph */}
                    <div style={{ marginBottom: "40px" }}>
                      <h5 style={{ fontSize: "20px", fontWeight: "700", color: "#22c55e", marginBottom: "25px" }}>
                        📈 Price Trend Graph (Last 7 Days)
                      </h5>
                      <div
                        style={{
                          background: "white",
                          padding: "30px",
                          borderRadius: "20px",
                          border: "2px solid #e5e7eb",
                          position: "relative",
                          height: "200px",
                          overflow: "hidden",
                        }}
                      >
                        {/* Simple SVG Graph */}
                        <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
                          {/* Grid lines */}
                          {[0, 1, 2, 3, 4].map((i) => (
                            <line
                              key={i}
                              x1="0"
                              y1={`${i * 25}%`}
                              x2="100%"
                              y2={`${i * 25}%`}
                              stroke="#e5e7eb"
                              strokeWidth="1"
                            />
                          ))}
                          {/* Price trend line */}
                          <polyline
                            points={Array.from({ length: 7 }, (_, i) => {
                              const x = (i / 6) * 100
                              const basePrice = itemData.average_price
                              const variation = Math.sin(i) * 20 + (Math.random() * 10 - 5)
                              const y = 80 - ((basePrice + variation - 50) / 200) * 60
                              return `${x},${y}`
                            }).join(" ")}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="4"
                            strokeLinecap="round"
                            style={{ filter: "drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))" }}
                          />
                          {/* Data points */}
                          {Array.from({ length: 7 }, (_, i) => {
                            const x = (i / 6) * 100
                            const basePrice = itemData.average_price
                            const variation = Math.sin(i) * 20 + (Math.random() * 10 - 5)
                            const y = 80 - ((basePrice + variation - 50) / 200) * 60
                            return (
                              <circle
                                key={i}
                                cx={`${x}%`}
                                cy={`${y}%`}
                                r="6"
                                fill="#22c55e"
                                stroke="white"
                                strokeWidth="3"
                                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                              />
                            )
                          })}
                        </svg>
                        {/* Graph labels */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: "10px",
                            left: "20px",
                            fontSize: "12px",
                            color: "#6b7280",
                          }}
                        >
                          7 days ago
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "10px",
                            right: "20px",
                            fontSize: "12px",
                            color: "#6b7280",
                          }}
                        >
                          Today
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            top: "10px",
                            left: "20px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#10b981",
                          }}
                        >
                          Rs. {(itemData.average_price + 20).toFixed(0)}
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "40px",
                            left: "20px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#10b981",
                          }}
                        >
                          Rs. {(itemData.average_price - 20).toFixed(0)}
                        </div>
                      </div>
                    </div>
                    {/* District Comparison Bar Chart */}
                    <div style={{ marginBottom: "30px" }}>
                      <h5 style={{ fontSize: "20px", fontWeight: "700", color: "#22c55e", marginBottom: "25px" }}>
                        🗺️ District Price Comparison Chart
                      </h5>
                      <div style={{ display: "grid", gap: "15px" }}>
                        {generateDistrictData(itemName).map((district, index) => (
                          <div
                            key={district.district}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "20px",
                              backgroundColor: "white",
                              borderRadius: "15px",
                              border: "2px solid #e5e7eb",
                              transition: "all 0.3s ease",
                              position: "relative",
                              overflow: "hidden",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "#10b981"
                              e.currentTarget.style.transform = "translateX(10px)"
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "#e5e7eb"
                              e.currentTarget.style.transform = "translateX(0)"
                            }}
                          >
                            {/* Animated bar background */}
                            <div
                              style={{
                                position: "absolute",
                                left: "0",
                                top: "0",
                                height: "100%",
                                width: `${(district.price / 250) * 100}%`,
                                background: "linear-gradient(90deg, #ecfdf5, #d1fae5)",
                                transition: "width 1s ease-in-out",
                                borderRadius: "15px",
                              }}
                            ></div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                position: "relative",
                                zIndex: 1,
                                width: "100%",
                              }}
                            >
                              <span style={{ fontSize: "20px", marginRight: "15px" }}>📍</span>
                              <span
                                style={{ fontSize: "18px", fontWeight: "700", color: "#374151", minWidth: "100px" }}
                              >
                                {district.district}
                              </span>
                              <div
                                style={{
                                  flex: 1,
                                  textAlign: "right",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "25px",
                                  justifyContent: "flex-end",
                                }}
                              >
                                <div style={{ textAlign: "center" }}>
                                  <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>Price</div>
                                  <div style={{ fontSize: "18px", fontWeight: "800", color: "#10b981" }}>
                                    Rs. {district.price.toFixed(0)}
                                  </div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                  <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>Demand</div>
                                  <div style={{ fontSize: "18px", fontWeight: "800", color: "#22c55e" }}>
                                    {district.demand.toFixed(0)} kg
                                  </div>
                                </div>
                                <div style={{ fontSize: "24px" }}>{district.trend === "up" ? "📈" : "📉"}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Enhanced AI Recommendation */}
                    <div
                      style={{
                        padding: "30px",
                        background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                        borderRadius: "20px",
                        border: "3px solid #a7f3d0",
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
                          background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)",
                          animation: "rotate 15s linear infinite",
                        }}
                      ></div>
                      <div style={{ position: "relative", zIndex: 1 }}>
                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: "800",
                            color: "#22c55e",
                            marginBottom: "15px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ marginRight: "10px", fontSize: "24px" }}>🎯</span>
                          AI-Powered Recommendation:
                        </div>
                        <div style={{ fontSize: "18px", color: "#4ade80", lineHeight: "1.7", fontWeight: "600" }}>
                          {itemData.demand_trend === "Increasing" && itemData.demand_change_percentage > 10
                            ? `🚀 Strong growth opportunity! Consider increasing supply as demand is rising by ${itemData.demand_change_percentage.toFixed(1)}%. Market conditions are favorable for expansion.`
                            : itemData.demand_trend === "Decreasing" && itemData.demand_change_percentage < -10
                              ? `⚠️ Market caution advised. Demand declining by ${Math.abs(itemData.demand_change_percentage).toFixed(1)}%. Consider diversification or cost optimization strategies.`
                              : itemData.demand_trend === "Stable"
                                ? `⚖️ Stable market conditions detected. Excellent for consistent planning with predictable demand patterns. Focus on quality improvements.`
                                : `🔍 Monitor closely. Limited data available for comprehensive trend analysis. Recommend gathering more market intelligence.`}
                        </div>
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
          <p style={{ color: "#4ade80", fontSize: "16px", fontWeight: "600", margin: 0 }}>
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
          50% { opacity: 0.7; }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        @keyframes glow {
          0% { box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2); }
          100% { box-shadow: 0 15px 40px rgba(16, 185, 129, 0.4); }
        }
        @keyframes aiGlow {
          0% { box-shadow: 0 30px 60px rgba(16, 185, 129, 0.4); }
          100% { box-shadow: 0 40px 80px rgba(16, 185, 129, 0.6); }
        }
        @keyframes textGlow {
          0% { text-shadow: 0 4px 8px rgba(0,0,0,0.3); }
          100% { text-shadow: 0 6px 12px rgba(0,0,0,0.5); }
        }
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          0%, 50% { height: 0%; }
          100% { height: 100%; }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        @keyframes flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
