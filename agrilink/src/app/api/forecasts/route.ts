import { NextRequest, NextResponse } from 'next/server';

// Mock forecast data
const generateForecast = (crop: string, days: number = 7) => {
  const basePrice = Math.random() * 100 + 50;
  const forecast = [];
  
  for (let i = 1; i <= days; i++) {
    const variation = (Math.random() - 0.5) * 10;
    const price = Math.max(basePrice + variation, 10);
    const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence
    
    forecast.push({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
      predictedPrice: Math.round(price * 100) / 100,
      confidence: Math.round(confidence * 100),
      trend: variation > 0 ? 'up' : 'down',
      change: Math.round(variation * 100) / 100
    });
  }
  
  return forecast;
};

// GET /api/forecasts - Get price forecasts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const crop = searchParams.get('crop');
    const days = parseInt(searchParams.get('days') || '7');
    const district = searchParams.get('district');
    const model = searchParams.get('model') || 'ARIMA'; // ARIMA, LSTM, or hybrid

    // Validate parameters
    if (days < 1 || days > 30) {
      return NextResponse.json(
        { success: false, error: 'Days must be between 1 and 30' },
        { status: 400 }
      );
    }

    if (!crop) {
      return NextResponse.json(
        { success: false, error: 'Crop parameter is required' },
        { status: 400 }
      );
    }

    const forecast = generateForecast(crop, days);
    
    // Add model-specific metadata
    const modelInfo = {
      ARIMA: { accuracy: '85%', description: 'Time series analysis model' },
      LSTM: { accuracy: '88%', description: 'Deep learning neural network model' },
      hybrid: { accuracy: '92%', description: 'Combined ARIMA + LSTM model' }
    };

    return NextResponse.json({
      success: true,
      data: {
        crop,
        district: district || 'All',
        model,
        modelInfo: modelInfo[model as keyof typeof modelInfo],
        forecast,
        generatedAt: new Date().toISOString(),
        summary: {
          averagePrice: Math.round(forecast.reduce((sum, f) => sum + f.predictedPrice, 0) / forecast.length * 100) / 100,
          priceRange: {
            min: Math.min(...forecast.map(f => f.predictedPrice)),
            max: Math.max(...forecast.map(f => f.predictedPrice))
          },
          overallTrend: forecast[forecast.length - 1].predictedPrice > forecast[0].predictedPrice ? 'increasing' : 'decreasing'
        }
      }
    });
  } catch (error) {
    console.error('Error generating forecast:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate forecast' },
      { status: 500 }
    );
  }
}
