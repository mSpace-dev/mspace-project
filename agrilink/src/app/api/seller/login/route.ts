import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/dbConnect';
import Seller from '@/lib/models/Seller';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { email, password } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find seller by email
    const seller = await Seller.findOne({ email }).populate('products');
    if (!seller) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, seller.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Return success response without password
    const sellerResponse = {
      _id: seller._id,
      name: seller.name,
      email: seller.email,
      phone: seller.phone,
      businessName: seller.businessName,
      businessType: seller.businessType,
      district: seller.district,
      province: seller.province,
      address: seller.address,
      licenseNumber: seller.licenseNumber,
      isVerified: seller.isVerified,
      products: seller.products,
      createdAt: seller.createdAt,
    };

    return NextResponse.json(
      { 
        message: 'Login successful', 
        seller: sellerResponse 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Seller login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
