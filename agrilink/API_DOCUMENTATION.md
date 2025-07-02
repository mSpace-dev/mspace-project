# AgriLink Backend API Documentation

## Overview
AgriLink provides a comprehensive REST API for agricultural price alerts, forecasting, and user management. All APIs return JSON responses with a consistent structure.

## Base URL
```
http://localhost:3000/api
```

## Response Format
All API responses follow this structure:
```json
{
  "success": boolean,
  "data": object | array,
  "message": string (optional),
  "error": string (optional)
}
```

## Authentication
- Most endpoints are public for demo purposes
- Admin endpoints require `x-api-key: admin-key-123` header
- In production, implement proper JWT/OAuth authentication

---

## 📊 Prices API

### GET /api/prices
Get current agricultural prices with optional filtering.

**Query Parameters:**
- `crop` (string): Filter by crop name
- `district` (string): Filter by district
- `province` (string): Filter by province  
- `market` (string): Filter by market name

**Example:**
```bash
curl "http://localhost:3000/api/prices?crop=rice&district=colombo"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "crop": "Rice",
      "variety": "Nadu",
      "price": 85.50,
      "unit": "kg",
      "market": "Pettah",
      "district": "Colombo",
      "province": "Western",
      "date": "2025-07-02T10:30:00.000Z",
      "change": "+2.5%",
      "trend": "up"
    }
  ],
  "count": 1,
  "timestamp": "2025-07-02T10:30:00.000Z"
}
```

### POST /api/prices
Add new price data (admin/data entry).

**Body:**
```json
{
  "crop": "Rice",
  "variety": "Nadu",
  "price": 85.50,
  "unit": "kg",
  "market": "Pettah",
  "district": "Colombo",
  "province": "Western"
}
```

---

## 🔔 Alerts API

### GET /api/alerts
Get user's price alerts.

**Query Parameters:**
- `userId` (string): Filter by user ID
- `isActive` (boolean): Filter by active status

### POST /api/alerts
Create a new price alert.

**Body:**
```json
{
  "userId": "user123",
  "crop": "Rice",
  "priceThreshold": 80.00,
  "condition": "above",
  "district": "Colombo",
  "province": "Western",
  "phone": "+94771234567",
  "email": "farmer@example.com"
}
```

**Conditions:**
- `above`: Alert when price goes above threshold
- `below`: Alert when price goes below threshold
- `change`: Alert on significant price changes

### PUT /api/alerts
Update existing alert.

**Body:**
```json
{
  "id": 1,
  "isActive": false,
  "priceThreshold": 90.00
}
```

### DELETE /api/alerts
Delete an alert.

**Query Parameters:**
- `id` (number): Alert ID to delete

---

## 📈 Forecasts API

### GET /api/forecasts
Get AI-powered price forecasts.

**Query Parameters:**
- `crop` (string, required): Crop to forecast
- `days` (number): Number of days (1-30, default: 7)
- `district` (string): Specific district
- `model` (string): AI model (ARIMA, LSTM, hybrid)

**Example:**
```bash
curl "http://localhost:3000/api/forecasts?crop=rice&days=7&model=LSTM"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "crop": "Rice",
    "district": "All",
    "model": "LSTM",
    "modelInfo": {
      "accuracy": "88%",
      "description": "Deep learning neural network model"
    },
    "forecast": [
      {
        "date": "2025-07-03T10:30:00.000Z",
        "predictedPrice": 87.25,
        "confidence": 85,
        "trend": "up",
        "change": 1.75
      }
    ],
    "summary": {
      "averagePrice": 86.75,
      "priceRange": { "min": 84.50, "max": 89.00 },
      "overallTrend": "increasing"
    }
  }
}
```

---

## 👤 Users API

### POST /api/users/register
Register a new user.

**Body:**
```json
{
  "name": "John Farmer",
  "phone": "+94771234567",
  "email": "john@example.com",
  "type": "farmer",
  "district": "Colombo",
  "province": "Western",
  "crops": ["Rice", "Coconut"]
}
```

**User Types:**
- `farmer`: Agricultural producers
- `seller`: Market vendors/wholesalers
- `consumer`: End consumers
- `trader`: Agricultural traders

### GET /api/users/register
Get user information.

**Query Parameters:**
- `phone` (string): User's phone number
- `id` (string): User ID

---

## 📱 SMS API

### POST /api/sms/send
Send SMS notification.

**Body:**
```json
{
  "phone": "+94771234567",
  "message": "Your rice price alert: Rs.85.50/kg",
  "type": "alert"
}
```

### PUT /api/sms/send
Send formatted price alert SMS.

**Body:**
```json
{
  "alertId": 1,
  "crop": "Rice",
  "currentPrice": 85.50,
  "threshold": 80.00,
  "condition": "above",
  "userPhone": "+94771234567"
}
```

---

## 🤖 Chatbot API

### POST /api/chatbot
Process chatbot message and get AI response.

**Body:**
```json
{
  "message": "What is the current rice price?",
  "userPhone": "+94771234567",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Current rice prices in Colombo: Nadu Rs.85.50/kg, Samba Rs.92.00/kg. Prices increased by 2.5% today.",
    "conversationId": "conv_1719920400000",
    "timestamp": "2025-07-02T10:30:00.000Z"
  }
}
```

**Chatbot Commands:**
- `Price [crop]` - Get current prices
- `Forecast [crop]` - Get price predictions
- `Market [location]` - Find nearby markets
- `Alert [crop] [price] [above/below]` - Set price alerts
- `Weather` - Get weather updates
- `Help` - Show available commands

### GET /api/chatbot
Get conversation history.

**Query Parameters:**
- `userId` (string): User ID
- `userPhone` (string): User's phone number

---

## 📊 Analytics API (Admin)

### GET /api/analytics
Get system analytics and insights.

**Headers:**
- `x-api-key: admin-key-123`

**Query Parameters:**
- `period` (string): Time period (1d, 7d, 30d, 90d)

**Response includes:**
- User statistics
- Price analytics
- System health metrics
- Regional data
- Engagement metrics

### POST /api/analytics/event
Track custom analytics events.

**Body:**
```json
{
  "event": "price_alert_created",
  "userId": "user123",
  "data": {
    "crop": "Rice",
    "threshold": 80.00
  }
}
```

---

## 🔗 Webhooks API (Admin)

### GET /api/webhooks
List registered webhook endpoints.

**Headers:**
- `x-api-key: admin-key-123`

### POST /api/webhooks
Register a new webhook endpoint.

**Headers:**
- `x-api-key: admin-key-123`

**Body:**
```json
{
  "url": "https://yourapp.com/webhooks/agrilink",
  "events": ["price.updated", "alert.triggered"],
  "secret": "your-webhook-secret"
}
```

**Available Events:**
- `price.updated` - When crop prices are updated
- `price.alert.triggered` - When price alerts are triggered
- `user.registered` - When new users register
- `forecast.generated` - When forecasts are generated
- `system.health` - System health updates

### PUT /api/webhooks
Test webhook delivery.

**Headers:**
- `x-api-key: admin-key-123`

**Body:**
```json
{
  "webhookId": "wh_123",
  "eventType": "price.updated"
}
```

---

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid API key)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## Rate Limiting

In production, implement rate limiting:
- Public APIs: 100 requests/minute
- User APIs: 1000 requests/hour
- Admin APIs: 10000 requests/hour

---

## Database Integration

This API currently uses mock data. For production:

1. **PostgreSQL/MySQL** for relational data
2. **Redis** for caching and real-time data
3. **TimescaleDB** for time-series price data
4. **MongoDB** for analytics and logs

---

## Next Steps

1. Set up a real database
2. Implement proper authentication
3. Add input validation and sanitization
4. Set up monitoring and logging
5. Deploy with proper environment variables
6. Add API versioning
7. Implement webhook delivery system
8. Add comprehensive error handling
