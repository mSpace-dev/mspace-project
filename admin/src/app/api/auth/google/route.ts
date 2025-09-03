import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=access_denied', request.url));
    }

    // Exchange code for tokens (this would be done with Google's token endpoint)
    // For now, we'll simulate this and create a proper admin account

    // This is a simplified version - in production, you'd exchange the code for tokens
    // and get user info from Google's userinfo endpoint

    // For demonstration, let's create a mock admin user
    const client = await connectToDatabase();
    const db = getDatabase(client);

    // Check if we have a demo admin
    let admin = await db.collection('admins').findOne({ email: 'demo@agrilink.com' });

    if (!admin) {
      // Create demo admin for Google OAuth
      const { ObjectId } = require('mongodb');
      const adminData = {
        _id: new ObjectId(),
        name: 'Demo Admin',
        email: 'demo@agrilink.com',
        phone: '+94701234567',
        password: null,
        role: 'admin',
        permissions: [
          'manage_users',
          'manage_products',
          'manage_orders',
          'view_analytics',
          'manage_content',
          'send_notifications'
        ],
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date(),
        profileImage: null,
        department: 'Administration',
        authProvider: 'google'
      };

      await db.collection('admins').insertOne(adminData);
      admin = adminData;
    }

    // Generate tokens
    const accessToken = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions || []
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { adminId: admin._id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Create response with redirect to dashboard
    const redirectUrl = new URL('/', request.url);
    const response = NextResponse.redirect(redirectUrl);

    // Set cookies for authentication
    response.cookies.set('admin', JSON.stringify({
      ...admin,
      _id: admin._id.toString()
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    response.cookies.set('adminAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 // 1 hour
    });

    response.cookies.set('adminRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}
