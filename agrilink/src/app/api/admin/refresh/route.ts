import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateToken } from '@/lib/jwt';
import { dbConnect } from '@/lib/dbConnect';
import Admin from '@/lib/models/Admin';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Check if admin still exists and is active
    const admin = await Admin.findById(decoded.adminId);
    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { error: 'Admin account not found or inactive' },
        { status: 401 }
      );
    }

    // Generate new access token
    const jwtPayload = {
      adminId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
    };

    const newAccessToken = generateToken(jwtPayload);

    return NextResponse.json(
      {
        message: 'Token refreshed successfully',
        accessToken: newAccessToken,
        expiresIn: '24h'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
