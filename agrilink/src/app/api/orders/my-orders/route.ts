import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/lib/models/Order';

// GET /api/orders/my-orders?sellerId=... - get orders claimed by a specific seller
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');
    
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 });
    }

    // Find orders that have been claimed by this seller
    const orders = await Order.find({ 
      'supplier.id': sellerId
    })
    .populate('customerId', 'name email phone')
    .sort({ 'supplier.claimedAt': -1 });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('My orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
