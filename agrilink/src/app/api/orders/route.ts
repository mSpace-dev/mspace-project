import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/lib/models/Order';
import Cart from '@/lib/models/Cart';
import Customer from '@/lib/models/Customer';

// GET /api/orders?customerId=...
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const orderId = searchParams.get('orderId');

    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      return NextResponse.json({ order }, { status: 200 });
    }

    if (!customerId) return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    const customer = await Customer.findById(customerId);
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
    
    // If no orders exist, return sample data for demonstration
    if (orders.length === 0) {
      const sampleOrders = [
        {
          _id: 'sample_order_1',
          customerId: customerId,
          items: [
            {
              productId: 'sample_product_1',
              name: 'Fresh Tomatoes',
              price: 150.00,
              quantity: 2,
              image: '/images/categories/vegetables.webp'
            },
            {
              productId: 'sample_product_2', 
              name: 'Organic Rice',
              price: 200.00,
              quantity: 1,
              image: '/images/categories/rice-grains.jpg'
            }
          ],
          totalAmount: 500.00,
          status: 'delivered',
          paymentStatus: 'paid',
          paymentMethod: 'cod',
          shippingAddress: {
            line1: '123 Main Street',
            city: 'Colombo',
            district: 'Colombo',
            province: 'Western'
          },
          tracking: [
            { status: 'delivered', note: 'Order delivered successfully', at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
          ],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          _id: 'sample_order_2',
          customerId: customerId,
          items: [
            {
              productId: 'sample_product_3',
              name: 'Fresh Bananas',
              price: 80.00,
              quantity: 3,
              image: '/images/categories/fruits.jpg'
            }
          ],
          totalAmount: 240.00,
          status: 'shipped',
          paymentStatus: 'paid',
          paymentMethod: 'card',
          shippingAddress: {
            line1: '456 Garden Road',
            city: 'Kandy',
            district: 'Kandy',
            province: 'Central'
          },
          tracking: [
            { status: 'shipped', note: 'Order shipped and on the way', at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
          ],
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          _id: 'sample_order_3',
          customerId: customerId,
          items: [
            {
              productId: 'sample_product_4',
              name: 'Coconut Oil',
              price: 300.00,
              quantity: 1,
              image: '/images/categories/coconut-products.jpg'
            },
            {
              productId: 'sample_product_5',
              name: 'Spices Mix',
              price: 120.00,
              quantity: 2,
              image: '/images/categories/spices.jpg'
            }
          ],
          totalAmount: 540.00,
          status: 'processing',
          paymentStatus: 'paid',
          paymentMethod: 'card',
          shippingAddress: {
            line1: '789 Market Street',
            city: 'Galle',
            district: 'Galle',
            province: 'Southern'
          },
          tracking: [
            { status: 'processing', note: 'Order is being prepared', at: new Date(Date.now() - 6 * 60 * 60 * 1000) }
          ],
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
        }
      ];
      return NextResponse.json({ orders: sampleOrders }, { status: 200 });
    }
    
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/orders - create order from cart
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { customerId, paymentMethod = 'cod', shippingAddress } = await req.json();
    if (!customerId) return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });

    const customer = await Customer.findById(customerId);
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    const cart = await Cart.findOne({ customerId });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const items = cart.items.map((i: any) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      image: i.image,
    }));

    const totalAmount = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      customerId,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'unpaid',
      status: 'pending',
      shippingAddress,
      tracking: [{ status: 'pending', note: 'Order placed', at: new Date() }]
    });

    // Clear cart after creating order
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    return NextResponse.json({ message: 'Order created', order }, { status: 201 });
  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/orders - update order status or payment
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { orderId, status, paymentStatus, trackingNote } = await req.json();
    if (!orderId) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNote) order.tracking.push({ status: status || order.status, note: trackingNote, at: new Date() });

    await order.save();
    return NextResponse.json({ message: 'Order updated', order }, { status: 200 });
  } catch (error) {
    console.error('Orders PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

