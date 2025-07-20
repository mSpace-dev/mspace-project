import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/dbConnect';
import Customer from '@/lib/models/Customer';
import { generateToken } from '@/lib/jwt';

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

    // Find customer by email
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

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

    // Generate JWT token
    const token = generateToken({
      customerId: customer._id.toString(),
      email: customer.email,
      role: 'customer',
      name: customer.name,
      phone: customer.phone,
      district: customer.district,
      province: customer.province,
    });

    return NextResponse.json(
      { 
        message: 'Login successful', 
        customer: customerResponse,
        token: token
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
