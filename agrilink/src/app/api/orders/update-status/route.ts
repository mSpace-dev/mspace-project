import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/lib/models/Order';

// PUT /api/orders/update-status - update order status by seller
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { orderId, sellerId, status, note } = await req.json();
    
    if (!orderId || !sellerId || !status) {
      return NextResponse.json({ 
        error: 'Missing required fields (orderId, sellerId, status)' 
      }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be one of: processing, shipped, delivered, cancelled' 
      }, { status: 400 });
    }

    const order = await Order.findById(orderId).populate('customerId', 'name email phone');
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify that this seller owns the order
    if (!order.supplier || order.supplier.id.toString() !== sellerId) {
      return NextResponse.json({ 
        error: 'You can only update orders you have claimed' 
      }, { status: 403 });
    }

    // Update order status
    order.status = status;
    
    // Add tracking entry
    if (!order.tracking) order.tracking = [];
    order.tracking.push({
      status: status,
      note: note || `Order status updated to ${status}`,
      at: new Date()
    });

    await order.save();

    // Send notification to customer for important status changes
    if (status === 'shipped' || status === 'delivered') {
      try {
        const notificationData = {
          type: 'order_status_update',
          data: {
            customerEmail: (order.customerId as any)?.email || 'customer@example.com',
            orderId: order._id,
            status: status,
            sellerName: order.supplier.name,
            note: note || `Your order has been ${status}`
          }
        };

        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notificationData)
        });
      } catch (notificationError) {
        console.error('Failed to send status update notification:', notificationError);
        // Don't fail the status update if notification fails
      }
    }

    return NextResponse.json({ 
      message: 'Order status updated successfully', 
      order 
    }, { status: 200 });
  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
