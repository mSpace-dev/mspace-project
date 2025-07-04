import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/dbConnect';
import Admin from '@/lib/models/Admin';

// This is a protected endpoint to create admin users manually
export async function POST(req: NextRequest) {
  try {
    // Simple API key protection (in production, use proper authentication)
    const apiKey = req.headers.get('x-api-key');
    if (apiKey !== 'admin-creation-key-123') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const {
      name,
      email,
      password,
      phone,
      role = 'admin',
      permissions = ['manage_users', 'view_analytics', 'send_notifications', 'manage_settings']
    } = await req.json();

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'Name, email, password, and phone are required' },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists with this email' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new admin
    const admin = new Admin({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role,
      permissions,
      isActive: true,
    });

    await admin.save();

    // Return success response without password
    const adminResponse = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      permissions: admin.permissions,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
    };

    return NextResponse.json(
      { 
        message: 'Admin created successfully', 
        admin: adminResponse 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create default admin accounts
export async function GET(req: NextRequest) {
  try {
    // Simple API key protection
    const apiKey = req.headers.get('x-api-key');
    if (apiKey !== 'admin-creation-key-123') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Check if any admin exists
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Admin accounts already exist' },
        { status: 200 }
      );
    }

    // Create default admin
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const defaultAdmin = new Admin({
      name: 'System Administrator',
      email: 'admin@agrilink.com',
      password: hashedPassword,
      phone: '+94771234567',
      role: 'super_admin',
      permissions: [
        'manage_users',
        'manage_products', 
        'manage_prices',
        'view_analytics',
        'send_notifications',
        'manage_settings',
        'manage_admins'
      ],
      isActive: true,
    });

    await defaultAdmin.save();

    return NextResponse.json(
      { 
        message: 'Default admin created successfully',
        credentials: {
          email: 'admin@agrilink.com',
          password: 'admin123'
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Default admin creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
