import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/lib/models/Order';
import mongoose from 'mongoose';

// POST /api/orders/claim - claim an order as a supplier
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { orderId, sellerId, sellerName, businessName, phone, email, estimatedDeliveryDate } = await req.json();
    
    if (!orderId || !sellerId || !sellerName || !estimatedDeliveryDate) {
      return NextResponse.json({ error: 'Missing required fields (orderId, sellerId, sellerName, estimatedDeliveryDate)' }, { status: 400 });
    }

    const order = await Order.findById(orderId).populate('customerId', 'name email phone');
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if order already has a supplier
    if (order.supplier && order.supplier.id) {
      return NextResponse.json({ error: 'Order already claimed by another supplier' }, { status: 400 });
    }

    // Update order with supplier information
    order.supplier = {
      id: new mongoose.Types.ObjectId(sellerId),
      name: sellerName,
      businessName: businessName || '',
      phone: phone || '',
      email: email || '',
      claimedAt: new Date(),
      estimatedDeliveryDate: new Date(estimatedDeliveryDate)
    };

    // Update order status to processing
    order.status = 'processing';
    
    // Add tracking entry
    if (!order.tracking) order.tracking = [];
    order.tracking.push({
      status: 'processing',
      note: `Order claimed by supplier: ${sellerName}. Estimated delivery: ${new Date(estimatedDeliveryDate).toLocaleDateString()}`,
      at: new Date()
    });

    await order.save();

    // Send notification to customer
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order_claimed',
          data: {
            customerEmail: (order.customerId as any)?.email || 'customer@example.com',
            sellerName: sellerName,
            estimatedDeliveryDate: estimatedDeliveryDate,
            orderId: order._id
          }
        })
      });
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
      // Don't fail the order claim if notification fails
    }

    return NextResponse.json({ 
      message: 'Order claimed successfully', 
      order 
    }, { status: 200 });
  } catch (error) {
    console.error('Claim order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

