import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data - replace with actual database queries
    const stats = {
      totalSent: 1247,
      todaySent: 23,
      activeSubscribers: 856,
      smsCredits: 2500
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message statistics' },
      { status: 500 }
    );
  }
}
