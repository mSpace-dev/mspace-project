import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/dbConnect';
import Customer from '@/lib/models/Customer';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { name, email, password, phone, district, province } = await req.json();

    // Validate required fields
    if (!name || !email || !password || !phone || !district || !province) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer already exists with this email' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new customer
    const customer = new Customer({
      name,
      email,
      password: hashedPassword,
      phone,
      district,
      province,
      priceAlerts: [],
    });

    await customer.save();

    // Return success response without password
    const customerResponse = {
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      district: customer.district,
      province: customer.province,
      priceAlerts: customer.priceAlerts,
      createdAt: customer.createdAt,
    };

    return NextResponse.json(
      { 
        message: 'Customer registered successfully', 
        customer: customerResponse 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
