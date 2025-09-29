import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Cart, { ICartItem } from '@/lib/models/Cart';
import Customer from '@/lib/models/Customer';

// POST - Add sample items to cart for testing
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { customerId } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Sample items to add to cart
    const sampleItems = [
      {
        serviceId: "price-alerts-premium",
        name: "Premium Price Alerts",
        type: "subscription",
        price: 2500,
        quantity: 1,
        description: "Real-time price alerts for 50+ crops with SMS and email notifications",
        seller: "AgriLink Services"
      },
      {
        serviceId: "crop-disease-analysis",
        name: "Crop Disease Analysis",
        type: "service",
        price: 800,
        quantity: 1,
        description: "Professional crop disease diagnosis and treatment recommendations",
        seller: "Agricultural Experts Ltd"
      }
    ];

    // Find or create cart
    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      cart = new Cart({
        customerId,
        items: [],
        totalAmount: 0
      });
    }

    // Add sample items to cart
    for (const item of sampleItems) {
      // Check if item already exists
      const existingItemIndex = cart.items.findIndex((cartItem: ICartItem) => 
        cartItem.serviceId === item.serviceId && cartItem.name === item.name
      );

      if (existingItemIndex === -1) {
        cart.items.push({
          ...item,
          addedAt: new Date()
        });
      }
    }

    await cart.save();

    return NextResponse.json(
      { 
        message: 'Sample items added to cart successfully', 
        cart 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add sample items error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
