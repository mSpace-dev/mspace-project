import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Cart, { ICartItem } from '@/lib/models/Cart';
import Product from '@/lib/models/Product';
import Customer from '@/lib/models/Customer';

// GET - Fetch customer's cart
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

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

    // Get customer's cart
    let cart = await Cart.findOne({ customerId }).populate('items.productId');

    // If no cart exists, create an empty one
    if (!cart) {
      cart = new Cart({
        customerId,
        items: [],
        totalAmount: 0
      });
      await cart.save();
    }

    return NextResponse.json({ cart }, { status: 200 });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const {
      customerId,
      productId,
      serviceId,
      name,
      type,
      price,
      quantity,
      image,
      description,
      seller
    } = await req.json();

    // Validate required fields
    if (!customerId || !name || !type || !price || !quantity || !description || !seller) {
      return NextResponse.json(
        { error: 'Required fields: customerId, name, type, price, quantity, description, seller' },
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

    // If it's a product, verify it exists
    if (type === 'product' && productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
    }

    // Find or create cart
    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      cart = new Cart({
        customerId,
        items: [],
        totalAmount: 0
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex((item: ICartItem) => {
      if (type === 'product') {
        return item.productId && item.productId.toString() === productId;
      } else {
        return item.serviceId === serviceId && item.name === name;
      }
    });

    if (existingItemIndex > -1) {
      // Update quantity of existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      const newItem = {
        productId: type === 'product' ? productId : undefined,
        serviceId: type !== 'product' ? serviceId : undefined,
        name,
        type,
        price,
        quantity,
        image,
        description,
        seller,
        addedAt: new Date()
      };
      cart.items.push(newItem);
    }

    await cart.save();

    return NextResponse.json(
      { 
        message: 'Item added to cart successfully', 
        cart 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update cart item
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const { customerId, itemId, quantity } = await req.json();

    if (!customerId || !itemId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Customer ID, item ID, and quantity are required' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Find the item to update
    const itemIndex = cart.items.findIndex((item: ICartItem) => 
      item._id && item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    // Update quantity or remove if quantity is 0
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    return NextResponse.json(
      { 
        message: 'Cart updated successfully', 
        cart 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart or clear entire cart
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const itemId = searchParams.get('itemId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    if (itemId) {
      // Remove specific item
      cart.items = cart.items.filter((item: ICartItem) => 
        item._id && item._id.toString() !== itemId
      );
    } else {
      // Clear entire cart
      cart.items = [];
    }

    await cart.save();

    return NextResponse.json(
      { 
        message: itemId ? 'Item removed from cart' : 'Cart cleared successfully', 
        cart 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete cart error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
