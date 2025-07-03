
"use client"

import type React from "react"

import { useState } from "react"

interface PredictionResult {
  predictedPrice: number
  predictedDemand: number
}

interface FormData {
  crop: string
  district: string
  dayOfWeek: string
  weather: string
  supply: string
  prevPrice: string
  prevDemand: string
  festivalWeek: boolean
  retailPrice: string
}

export default function PricePredictionApp() {
  const [formData, setFormData] = useState<FormData>({
    crop: "",
    district: "",
    dayOfWeek: "",
    weather: "",
    supply: "",
    prevPrice: "",
    prevDemand: "",
    festivalWeek: false,
    retailPrice: "",
  })

  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const crops = ["Carrot", "Tomato", "Onion", "Beans", "Pumpkin"]
  const districts = ["Colombo", "Dambulla", "Jaffna", "Kandy", "Galle"]
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const weatherOptions = ["Sunny", "Rainy", "Cloudy"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setPrediction(null)

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Prediction failed")
      }

      const result = await response.json()
      setPrediction(result)
    } catch (err) {
      setError("Failed to get prediction. Please try again.")
      console.error("Prediction error:", err)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = () => {
    return (
      formData.crop &&
      formData.district &&
      formData.dayOfWeek &&
      formData.weather &&
      formData.supply &&
      formData.prevPrice &&
      formData.prevDemand &&
      formData.retailPrice
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, festivalWeek: e.target.checked })
  }

  const resetForm = () => {
    setFormData({
      crop: "",
      district: "",
      dayOfWeek: "",
      weather: "",
      supply: "",
      prevPrice: "",
      prevDemand: "",
      festivalWeek: false,
      retailPrice: "",
    })
    setPrediction(null)
    setError(null)
  }

  return (
    <div>
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer" onClick={() => window.location.href = '/home'}>
              <h1 className="text-2xl font-bold text-green-700 hover:text-green-600 transition-colors">AgriLink</h1>
              <span className="ml-2 text-sm text-gray-500">Sri Lanka</span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/prices" className="text-gray-700 hover:text-green-600 transition-colors">Prices</a>
              <a href="/alerts" className="text-gray-700 hover:text-green-600 transition-colors">Alerts</a>
              <a href="/demandforecast" className="text-gray-700 hover:text-green-600 transition-colors font-medium">Forecasts</a>
              <a href="/customer" className="btn-agrilink text-white px-4 py-2 rounded-lg">Log In</a>
            </div>
          </div>
        </div>
      </nav>
      
      <main
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #f0fdfa 100%)",
          padding: "24px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              background: "linear-gradient(to right, #059669, #047857)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "12px",
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            🌾 Agricultural Price & Demand Predictor
          </h1>
          <p
            style={{
              color: "#6b7280",
              fontSize: "18px",
              fontWeight: "500",
            }}
          >
            Get accurate predictions for crop prices and market demand using AI
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
            gap: "24px",
          }}
        >
          {/* Input Form */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              borderRadius: "24px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #d1fae5",
              padding: "32px",
              transition: "all 0.3s ease",
              transform: "translateY(0)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 35px 60px -12px rgba(0, 0, 0, 0.35)"
              e.currentTarget.style.transform = "translateY(-2px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "600",
                marginBottom: "24px",
                color: "#1f2937",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  background: "linear-gradient(to right, #10b981, #059669)",
                  width: "8px",
                  height: "32px",
                  borderRadius: "4px",
                  marginRight: "12px",
                }}
              ></span>
              Market Parameters
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Row 1 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    Crop Type
                  </label>
                  <select
                    name="crop"
                    value={formData.crop}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      border: "2px solid #e5e7eb",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      fontSize: "16px",
                      background: "white",
                      transition: "all 0.2s ease",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#10b981"
                      e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb"
                      e.target.style.boxShadow = "none"
                    }}
                  >
                    <option value="">Select crop</option>
                    {crops.map((crop) => (
                      <option key={crop} value={crop}>
                        {crop}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    District
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      border: "2px solid #e5e7eb",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      fontSize: "16px",
                      background: "white",
                      transition: "all 0.2s ease",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#10b981"
                      e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb"
                      e.target.style.boxShadow = "none"
                    }}
                  >
                    <option value="">Select district</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    Day of Week
                  </label>
                  <select
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      border: "2px solid #e5e7eb",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      fontSize: "16px",
                      background: "white",
                      transition: "all 0.2s ease",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#10b981"
                      e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb"
                      e.target.style.boxShadow = "none"
                    }}
                  >
                    <option value="">Select day</option>
                    {daysOfWeek.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    Weather
                  </label>
                  <select
                    name="weather"
                    value={formData.weather}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      border: "2px solid #e5e7eb",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      fontSize: "16px",
                      background: "white",
                      transition: "all 0.2s ease",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#10b981"
                      e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb"
                      e.target.style.boxShadow = "none"
                    }}
                  >
                    <option value="">Select weather</option>
                    {weatherOptions.map((weather) => (
                      <option key={weather} value={weather}>
                        {weather}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    Supply (kg)
                  </label>
                  <input
                    name="supply"
                    type="number"
                    placeholder="Enter supply amount"
                    value={formData.supply}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      border: "2px solid #e5e7eb",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      fontSize: "16px",
                      transition: "all 0.2s ease",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#10b981"
                      e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    Previous Price (LKR)
                  </label>
                  <input
                    name="prevPrice"
                    type="number"
                    step="0.01"
                    placeholder="Enter previous price"
                    value={formData.prevPrice}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      border: "2px solid #e5e7eb",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      fontSize: "16px",
                      transition: "all 0.2s ease",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#10b981"
                      e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </div>
              </div>

              {/* Row 4 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    Previous Demand (kg)
                  </label>
                  <input
                    name="prevDemand"
                    type="number"
                    placeholder="Enter previous demand"
                    value={formData.prevDemand}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      border: "2px solid #e5e7eb",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      fontSize: "16px",
                      transition: "all 0.2s ease",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#10b981"
                      e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    Retail Price (LKR)
                  </label>
                  <input
                    name="retailPrice"
                    type="number"
                    step="0.01"
                    placeholder="Enter retail price"
                    value={formData.retailPrice}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      border: "2px solid #e5e7eb",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      fontSize: "16px",
                      transition: "all 0.2s ease",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#10b981"
                      e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </div>
              </div>

              {/* Checkbox */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                <input
                  type="checkbox"
                  id="festivalWeek"
                  name="festivalWeek"
                  checked={formData.festivalWeek}
                  onChange={handleCheckboxChange}
                  style={{
                    width: "20px",
                    height: "20px",
                    accentColor: "#10b981",
                    borderRadius: "4px",
                  }}
                />
                <label
                  htmlFor="festivalWeek"
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Festival Week
                </label>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
                <button
                  type="submit"
                  disabled={!isFormValid() || loading}
                  style={{
                    flex: 1,
                    background: loading ? "#9ca3af" : "linear-gradient(to right, #059669, #047857)",
                    color: "white",
                    padding: "16px 32px",
                    borderRadius: "12px",
                    border: "none",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && isFormValid()) {
                      e.currentTarget.style.transform = "translateY(-2px)"
                      e.currentTarget.style.boxShadow = "0 8px 25px 0 rgba(16, 185, 129, 0.5)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "0 4px 14px 0 rgba(16, 185, 129, 0.39)"
                  }}
                >
                  {loading ? (
                    <>
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          border: "2px solid #ffffff",
                          borderTop: "2px solid transparent",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      ></div>
                      Predicting...
                    </>
                  ) : (
                    "🔮 Get Prediction"
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: "16px 32px",
                    border: "2px solid #d1fae5",
                    color: "#374151",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: "600",
                    background: "white",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f0fdf4"
                    e.currentTarget.style.borderColor = "#10b981"
                    e.currentTarget.style.transform = "translateY(-2px)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white"
                    e.currentTarget.style.borderColor = "#d1fae5"
                    e.currentTarget.style.transform = "translateY(0)"
                  }}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Results Panel */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              borderRadius: "24px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #d1fae5",
              padding: "32px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 35px 60px -12px rgba(0, 0, 0, 0.35)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "600",
                marginBottom: "24px",
                color: "#1f2937",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  background: "linear-gradient(to right, #10b981, #059669)",
                  width: "8px",
                  height: "32px",
                  borderRadius: "4px",
                  marginRight: "12px",
                }}
              ></span>
              Prediction Results
            </h2>

            {error && (
              <div
                style={{
                  marginBottom: "24px",
                  padding: "20px",
                  background: "#fef2f2",
                  border: "2px solid #fecaca",
                  color: "#dc2626",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ marginRight: "12px", fontSize: "20px" }}>⚠️</span>
                  <span style={{ fontWeight: "500" }}>{error}</span>
                </div>
              </div>
            )}

            {prediction ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div
                    style={{
                      background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                      padding: "24px",
                      borderRadius: "16px",
                      border: "2px solid #a7f3d0",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)"
                      e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.15)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)"
                      e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#065f46",
                        marginBottom: "8px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ marginRight: "8px" }}>💰</span>
                      Predicted Price
                    </div>
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        background: "linear-gradient(to right, #047857, #065f46)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      LKR {prediction.predictedPrice.toFixed(2)}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "linear-gradient(135deg, #f0fdfa, #ccfbf1)",
                      padding: "24px",
                      borderRadius: "16px",
                      border: "2px solid #99f6e4",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)"
                      e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.15)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)"
                      e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#134e4a",
                        marginBottom: "8px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ marginRight: "8px" }}>📈</span>
                      Predicted Demand
                    </div>
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        background: "linear-gradient(to right, #0f766e, #134e4a)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {prediction.predictedDemand.toFixed(0)} kg
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "linear-gradient(to right, #f0fdf4, #ecfdf5)",
                    padding: "24px",
                    borderRadius: "16px",
                    border: "1px solid #bbf7d0",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <h4
                    style={{
                      fontWeight: "600",
                      color: "#1f2937",
                      marginBottom: "12px",
                      fontSize: "18px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ marginRight: "8px" }}>📊</span>
                    Market Insights
                  </h4>
                  <ul
                    style={{
                      fontSize: "14px",
                      color: "#374151",
                      lineHeight: "1.6",
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    <li style={{ display: "flex", alignItems: "flex-start", marginBottom: "8px" }}>
                      <span style={{ color: "#10b981", marginRight: "8px", marginTop: "2px" }}>•</span>
                      Prediction based on current market conditions and historical data
                    </li>
                    <li style={{ display: "flex", alignItems: "flex-start", marginBottom: "8px" }}>
                      <span style={{ color: "#10b981", marginRight: "8px", marginTop: "2px" }}>•</span>
                      Consider seasonal variations and local market factors
                    </li>
                    <li style={{ display: "flex", alignItems: "flex-start", marginBottom: "8px" }}>
                      <span style={{ color: "#10b981", marginRight: "8px", marginTop: "2px" }}>•</span>
                      Update predictions regularly for best accuracy
                    </li>
                    <li style={{ display: "flex", alignItems: "flex-start" }}>
                      <span style={{ color: "#10b981", marginRight: "8px", marginTop: "2px" }}>•</span>
                      {formData.festivalWeek
                        ? "Festival period may increase demand"
                        : "Normal market conditions assumed"}
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "64px 0",
                  color: "#6b7280",
                }}
              >
                <div
                  style={{
                    fontSize: "80px",
                    marginBottom: "24px",
                    animation: "pulse 2s infinite",
                  }}
                >
                  🌾
                </div>
                <p
                  style={{
                    fontSize: "20px",
                    color: "#4b5563",
                    fontWeight: "500",
                    marginBottom: "16px",
                  }}
                >
                  Fill in the form and click "Get Prediction" to see AI-powered market forecasts
                </p>
                <div
                  style={{
                    width: "96px",
                    height: "4px",
                    background: "linear-gradient(to right, #34d399, #10b981)",
                    borderRadius: "2px",
                    margin: "0 auto",
                  }}
                ></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </main>
    </div>
  )
}
