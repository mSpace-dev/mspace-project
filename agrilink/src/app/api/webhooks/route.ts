import { NextRequest, NextResponse } from 'next/server';

// Mock webhook events
const mockWebhookEvents = [
  {
    id: 'evt_1',
    type: 'price.updated',
    data: {
      crop: 'Rice',
      oldPrice: 83.00,
      newPrice: 85.50,
      market: 'Pettah',
      timestamp: new Date().toISOString()
    }
  }
];

// GET /api/webhooks - List webhook endpoints (admin)
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');

    if (apiKey !== 'admin-key-123') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Mock webhook endpoints
    const webhooks = [
      {
        id: 'wh_1',
        url: 'https://example.com/webhooks/agrilink',
        events: ['price.updated', 'alert.triggered'],
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: webhooks
    });
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }
}

// POST /api/webhooks - Register webhook endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, events, secret } = body;
    const apiKey = request.headers.get('x-api-key');

    if (apiKey !== 'admin-key-123') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!url || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { success: false, error: 'URL and events array are required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Validate events
    const validEvents = [
      'price.updated',
      'price.alert.triggered',
      'user.registered',
      'forecast.generated',
      'system.health'
    ];

    const invalidEvents = events.filter((event: string) => !validEvents.includes(event));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { success: false, error: `Invalid events: ${invalidEvents.join(', ')}` },
        { status: 400 }
      );
    }

    const webhook = {
      id: `wh_${Date.now()}`,
      url,
      events,
      secret: secret || `secret_${Date.now()}`,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: webhook,
      message: 'Webhook registered successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error registering webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register webhook' },
      { status: 500 }
    );
  }
}

// POST /api/webhooks/test - Test webhook delivery
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { webhookId, eventType } = body;
    const apiKey = request.headers.get('x-api-key');

    if (apiKey !== 'admin-key-123') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!webhookId || !eventType) {
      return NextResponse.json(
        { success: false, error: 'Webhook ID and event type are required' },
        { status: 400 }
      );
    }

    // Mock test webhook delivery
    const testPayload = {
      id: `evt_test_${Date.now()}`,
      type: eventType,
      data: {
        test: true,
        message: 'This is a test webhook event',
        timestamp: new Date().toISOString()
      },
      webhook: {
        id: webhookId,
        attempt: 1
      }
    };

    // In production, actually send HTTP request to webhook URL
    console.log('Test webhook payload:', testPayload);

    return NextResponse.json({
      success: true,
      data: {
        webhookId,
        eventType,
        testPayload,
        deliveryStatus: 'sent',
        responseCode: 200,
        deliveredAt: new Date().toISOString()
      },
      message: 'Test webhook sent successfully'
    });
  } catch (error) {
    console.error('Error testing webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test webhook' },
      { status: 500 }
    );
  }
}
