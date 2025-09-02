import { NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/database';

export async function GET() {
  try {
    const client = await connectToDatabase();
    const db = getDatabase(client);

    // Get total SMS count
    const totalSMS = await db.collection('sms_logs').countDocuments();

    // Get SMS sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const smsToday = await db.collection('sms_logs').countDocuments({
      sentAt: { $gte: today },
      status: 'sent'
    });

    // Get recent alerts (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentAlerts = await db.collection('sms_logs').countDocuments({
      sentAt: { $gte: weekAgo },
      category: { $ne: 'custom' }
    });

    return NextResponse.json({
      totalSMS,
      smsToday,
      recentAlerts
    });
  } catch (error) {
    console.error('Failed to fetch SMS stats:', error);
    return NextResponse.json({ error: 'Failed to fetch SMS stats' }, { status: 500 });
  }
}
