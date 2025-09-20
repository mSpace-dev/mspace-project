import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/lib/models/Order';

// GET /api/orders/available - get orders without suppliers
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Find orders that don't have a supplier assigned
    const orders = await Order.find({ 
      supplier: { $exists: false },
      status: { $in: ['pending', 'paid'] }
    })
    .populate('customerId', 'name email phone')
    .sort({ createdAt: -1 });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('Available orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

