import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/lib/models/Order';

// POST /api/orders/claim - claim an order as a supplier
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { orderId, sellerId, sellerName, businessName, phone, email } = await req.json();
    
    if (!orderId || !sellerId || !sellerName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if order already has a supplier
    if (order.supplier) {
      return NextResponse.json({ error: 'Order already claimed by another supplier' }, { status: 400 });
    }

    // Update order with supplier information
    order.supplier = {
      id: sellerId,
      name: sellerName,
      businessName: businessName || '',
      phone: phone || '',
      email: email || '',
      claimedAt: new Date()
    };

    // Update order status to processing
    order.status = 'processing';
    
    // Add tracking entry
    order.tracking.push({
      status: 'processing',
      note: `Order claimed by supplier: ${sellerName}`,
      at: new Date()
    });

    await order.save();

    return NextResponse.json({ 
      message: 'Order claimed successfully', 
      order 
    }, { status: 200 });
  } catch (error) {
    console.error('Claim order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

