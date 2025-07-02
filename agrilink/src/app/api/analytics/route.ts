import { NextRequest, NextResponse } from 'next/server';

// Mock analytics data
const generateAnalytics = () => {
  return {
    summary: {
      totalUsers: 1250,
      activeAlerts: 340,
      dailyPriceUpdates: 85,
      smssSentToday: 127,
      apiCallsToday: 1840
    },
    priceAnalytics: {
      mostTrackedCrops: [
        { crop: 'Rice', alerts: 85, avgPrice: 87.50 },
        { crop: 'Coconut', alerts: 72, avgPrice: 42.00 },
        { crop: 'Tomato', alerts: 56, avgPrice: 115.00 },
        { crop: 'Onion', alerts: 43, avgPrice: 98.50 },
        { crop: 'Potato', alerts: 38, avgPrice: 76.00 }
      ],
      priceVolatility: {
        high: ['Tomato', 'Onion', 'Cabbage'],
        medium: ['Rice', 'Carrot'],
        low: ['Coconut', 'Potato']
      },
      regionalPriceSpread: [
        { region: 'Western', avgPriceIndex: 108 },
        { region: 'Central', avgPriceIndex: 102 },
        { region: 'Southern', avgPriceIndex: 95 },
        { region: 'Northern', avgPriceIndex: 98 },
        { region: 'Eastern', avgPriceIndex: 92 }
      ]
    },
    userAnalytics: {
      userTypeDistribution: {
        farmers: 45,
        sellers: 30,
        consumers: 20,
        traders: 5
      },
      topDistricts: [
        { district: 'Colombo', users: 185 },
        { district: 'Gampaha', users: 142 },
        { district: 'Kandy', users: 128 },
        { district: 'Kurunegala', users: 95 },
        { district: 'Galle', users: 87 }
      ],
      engagementMetrics: {
        dailyActiveUsers: 420,
        averageSessionDuration: '4m 32s',
        alertResponseRate: 85.6,
        smsOptOutRate: 2.3
      }
    },
    systemHealth: {
      apiUptime: 99.8,
      averageResponseTime: 245,
      errorRate: 0.12,
      smsDeliveryRate: 98.7,
      databaseConnections: 15
    }
  };
};

// GET /api/analytics - Get system analytics (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 1d, 7d, 30d, 90d
    const apiKey = request.headers.get('x-api-key');

    // Basic API key authentication (in production, use proper auth)
    if (apiKey !== 'admin-key-123') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const analytics = generateAnalytics();

    return NextResponse.json({
      success: true,
      data: {
        period,
        generatedAt: new Date().toISOString(),
        ...analytics
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// POST /api/analytics/event - Track custom events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, userId, data, timestamp } = body;

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event name is required' },
        { status: 400 }
      );
    }

    // Log event (in production, save to analytics database)
    const eventRecord = {
      id: `event_${Date.now()}`,
      event,
      userId: userId || 'anonymous',
      data: data || {},
      timestamp: timestamp || new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    console.log('Analytics event:', eventRecord);

    return NextResponse.json({
      success: true,
      data: {
        eventId: eventRecord.id,
        message: 'Event tracked successfully'
      }
    });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
