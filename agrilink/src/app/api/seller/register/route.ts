import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/dbConnect';
import Seller from '@/lib/models/Seller';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const {
      name,
      email,
      password,
      phone,
      businessName,
      businessType,
      district,
      province,
      address,
      licenseNumber
    } = await req.json();

    // Validate required fields
    if (!name || !email || !password || !phone || !businessName || !businessType || 
        !district || !province || !address) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return NextResponse.json(
        { error: 'Seller already exists with this email' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new seller
    const seller = new Seller({
      name,
      email,
      password: hashedPassword,
      phone,
      businessName,
      businessType,
      district,
      province,
      address,
      licenseNumber,
      isVerified: false,
      products: [],
    });

    await seller.save();

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
        message: 'Seller registered successfully', 
        seller: sellerResponse 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Seller registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
