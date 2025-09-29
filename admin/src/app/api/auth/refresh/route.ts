import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/database';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-2025-agrilink-admin';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production-2025-agrilink-admin';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token is required' },
        { status: 400 }
      );
    }

  // Verify refresh token
  const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { adminId: string };

    // Connect to database
    const client = await connectToDatabase();
    const db = getDatabase(client);

    // Find admin by ID
  const admin = await db.collection('admins').findOne({ _id: new ObjectId(decoded.adminId) });

    if (!admin) {
      return NextResponse.json(
        { message: 'Admin not found' },
        { status: 404 }
      );
    }

    // Check if admin is active
    if (!admin.isActive) {
      return NextResponse.json(
        { message: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions || []
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Generate new refresh token
    const newRefreshToken = jwt.sign(
      { adminId: admin._id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Update refresh token in database
    await db.collection('admins').updateOne(
      { _id: admin._id },
      { $set: { refreshToken: newRefreshToken } }
    );

    return NextResponse.json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { message: 'Invalid refresh token' },
      { status: 401 }
    );
  }
}
