import { NextRequest, NextResponse } from 'next/server';

// Mock alerts data
const mockAlerts = [
  {
    id: 1,
    userId: 'user123',
    crop: 'Rice',
    priceThreshold: 80.00,
    condition: 'above', // above, below, change
    district: 'Colombo',
    province: 'Western',
    phone: '+94771234567',
    email: 'farmer@example.com',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastTriggered: null
  },
  {
    id: 2,
    userId: 'user456',
    crop: 'Coconut',
    priceThreshold: 50.00,
    condition: 'below',
    district: 'Gampaha',
    province: 'Western',
    phone: '+94777654321',
    email: 'seller@example.com',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastTriggered: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

// GET /api/alerts - Fetch user's alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isActive = searchParams.get('isActive');

    let filteredAlerts = [...mockAlerts];

    if (userId) {
      filteredAlerts = filteredAlerts.filter(alert => alert.userId === userId);
    }

    if (isActive !== null) {
      const activeFilter = isActive === 'true';
      filteredAlerts = filteredAlerts.filter(alert => alert.isActive === activeFilter);
    }

    return NextResponse.json({
      success: true,
      data: filteredAlerts,
      count: filteredAlerts.length
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

// POST /api/alerts - Create new price alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      crop, 
      priceThreshold, 
      condition, 
      district, 
      province, 
      phone, 
      email 
    } = body;

    // Validate required fields
    if (!userId || !crop || !priceThreshold || !condition || !phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate condition
    if (!['above', 'below', 'change'].includes(condition)) {
      return NextResponse.json(
        { success: false, error: 'Invalid condition. Use: above, below, or change' },
        { status: 400 }
      );
    }

    // Validate phone number format (basic Sri Lankan format)
    const phoneRegex = /^\+94[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format. Use +94XXXXXXXXX' },
        { status: 400 }
      );
    }

    const newAlert = {
      id: mockAlerts.length + 1,
      userId,
      crop,
      priceThreshold: parseFloat(priceThreshold),
      condition,
      district: district || 'All',
      province: province || 'All',
      phone,
      email: email || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastTriggered: null
    };

    mockAlerts.push(newAlert);

    return NextResponse.json({
      success: true,
      data: newAlert,
      message: 'Alert created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

// PUT /api/alerts - Update existing alert
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isActive, priceThreshold, condition } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const alertIndex = mockAlerts.findIndex(alert => alert.id === parseInt(id));
    if (alertIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      );
    }

    // Update alert properties
    if (isActive !== undefined) {
      mockAlerts[alertIndex].isActive = isActive;
    }
    if (priceThreshold !== undefined) {
      mockAlerts[alertIndex].priceThreshold = parseFloat(priceThreshold);
    }
    if (condition !== undefined && ['above', 'below', 'change'].includes(condition)) {
      mockAlerts[alertIndex].condition = condition;
    }

    return NextResponse.json({
      success: true,
      data: mockAlerts[alertIndex],
      message: 'Alert updated successfully'
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}

// DELETE /api/alerts - Delete alert
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const alertIndex = mockAlerts.findIndex(alert => alert.id === parseInt(id));
    if (alertIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      );
    }

    const deletedAlert = mockAlerts.splice(alertIndex, 1)[0];

    return NextResponse.json({
      success: true,
      data: deletedAlert,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete alert' },
      { status: 500 }
    );
  }
}
