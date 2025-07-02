import { NextRequest, NextResponse } from 'next/server';

// Mock user data
const mockUsers = [
  {
    id: 'user123',
    name: 'John Farmer',
    phone: '+94771234567',
    email: 'john@example.com',
    type: 'farmer',
    district: 'Colombo',
    province: 'Western',
    crops: ['Rice', 'Coconut'],
    isVerified: true,
    createdAt: new Date().toISOString()
  }
];

// POST /api/users/register - Register new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, type, district, province, crops } = body;

    // Validate required fields
    if (!name || !phone || !type) {
      return NextResponse.json(
        { success: false, error: 'Name, phone, and type are required' },
        { status: 400 }
      );
    }

    // Validate user type
    if (!['farmer', 'seller', 'consumer', 'trader'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user type' },
        { status: 400 }
      );
    }

    // Validate phone number
    const phoneRegex = /^\+94[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = mockUsers.find(user => user.phone === phone);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this phone number already exists' },
        { status: 409 }
      );
    }

    const newUser = {
      id: `user${Date.now()}`,
      name,
      phone,
      email: email || null,
      type,
      district: district || null,
      province: province || null,
      crops: crops || [],
      isVerified: false,
      createdAt: new Date().toISOString()
    };

    mockUsers.push(newUser);

    // Send verification SMS (mock)
    console.log(`Sending verification SMS to ${phone}`);

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User registered successfully. Verification SMS sent.'
    }, { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register user' },
      { status: 500 }
    );
  }
}

// GET /api/users/register - Get user by phone or ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const id = searchParams.get('id');

    if (!phone && !id) {
      return NextResponse.json(
        { success: false, error: 'Phone number or user ID is required' },
        { status: 400 }
      );
    }

    let user;
    if (phone) {
      user = mockUsers.find(u => u.phone === phone);
    } else {
      user = mockUsers.find(u => u.id === id);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
