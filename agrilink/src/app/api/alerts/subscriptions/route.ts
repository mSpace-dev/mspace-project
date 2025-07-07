import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Subscription } from '@/lib/models/Subscription';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const subscriptions = await Subscription.find({ 
      userId, 
      isActive: true 
    });

    return NextResponse.json({ 
      success: true, 
      subscriptions 
    }, { status: 200 });
  } catch (err: any) {
    console.error('Fetch Subscriptions Error →', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
