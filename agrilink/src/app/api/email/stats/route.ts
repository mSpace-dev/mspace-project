import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import EmailSubscription from '@/lib/models/EmailSubscription';

export async function GET() {
  try {
    await dbConnect();
    
    const totalSubscribers = await EmailSubscription.countDocuments({ isActive: true });
    const totalInactive = await EmailSubscription.countDocuments({ isActive: false });
    const recentSubscribers = await EmailSubscription.countDocuments({
      isActive: true,
      subscriptionDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    return NextResponse.json({
      totalSubscribers,
      totalInactive,
      recentSubscribers,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Subscriber stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriber statistics' },
      { status: 500 }
    );
  }
}
