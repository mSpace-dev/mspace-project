import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Product from '@/lib/models/Product';
import Seller from '@/lib/models/Seller';

// GET - Fetch seller's products
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');

    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      );
    }

    const products = await Product.find({ sellerId }).sort({ createdAt: -1 });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add new product
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const {
      sellerId,
      name,
      category,
      variety,
      description,
      pricePerKg,
      availableQuantity,
      unit,
      harvestDate,
      expiryDate,
      quality,
      location,
      images
    } = await req.json();

    // Validate required fields
    if (!sellerId || !name || !category || !pricePerKg || !availableQuantity || !location) {
      return NextResponse.json(
        { error: 'Required fields: sellerId, name, category, pricePerKg, availableQuantity, location' },
        { status: 400 }
      );
    }

    // Verify seller exists
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Create new product
    const product = new Product({
      sellerId,
      name,
      category,
      variety,
      description,
      pricePerKg: Number(pricePerKg),
      availableQuantity: Number(availableQuantity),
      unit: unit || 'kg',
      harvestDate: harvestDate ? new Date(harvestDate) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      quality: quality || 'standard',
      location,
      images: images || [],
      status: 'available',
      isActive: true,
    });

    await product.save();

    // Add product to seller's products array
    await Seller.findByIdAndUpdate(
      sellerId,
      { $push: { products: product._id } },
      { new: true }
    );

    return NextResponse.json(
      { 
        message: 'Product added successfully', 
        product 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    
    const updateData = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Product updated successfully', 
        product 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const sellerId = searchParams.get('sellerId');

    if (!productId || !sellerId) {
      return NextResponse.json(
        { error: 'Product ID and Seller ID are required' },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Remove product from seller's products array
    await Seller.findByIdAndUpdate(
      sellerId,
      { $pull: { products: productId } }
    );

    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
