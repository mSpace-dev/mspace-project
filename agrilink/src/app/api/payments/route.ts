import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/lib/models/Order';

// Simulated payment endpoint (can be replaced with Stripe/PayHere integration)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { orderId, method = 'card' } = await req.json();
    if (!orderId) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Simulate success
    order.paymentMethod = method;
    order.paymentStatus = 'paid';
    order.status = 'paid';
    if (!order.tracking) {
      order.tracking = [];
    }
    order.tracking.push({ status: 'paid', note: 'Payment confirmed', at: new Date() });
    await order.save();

    return NextResponse.json({ message: 'Payment successful', order }, { status: 200 });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

