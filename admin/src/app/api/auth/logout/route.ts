import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      message: 'Logged out successfully'
    });

    // Clear all admin-related cookies
    response.cookies.delete('admin');
    response.cookies.delete('adminAccessToken');
    response.cookies.delete('adminRefreshToken');

    // Clear localStorage (this will be handled on the client side)
    // Note: We can't directly clear localStorage from server-side,
    // but the client will handle this

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    );
  }
}
