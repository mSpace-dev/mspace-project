import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/dbConnect';
import Customer from '@/lib/models/Customer';

export async function POST(req: NextRequest) {
  try {
    console.log('Starting customer registration...');
    
    // Connect to database
    await dbConnect();
    console.log('Database connection successful');

    const { name, email, password, phone, district, province } = await req.json();
    console.log('Received registration data:', { name, email, phone, district, province });

    // Validate required fields
    if (!name || !email || !password || !phone || !district || !province) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format');
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      console.log('Password too short');
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    console.log('Checking if customer exists...');
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      console.log('Customer already exists');
      return NextResponse.json(
        { error: 'Customer already exists with this email' },
        { status: 409 }
      );
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new customer
    console.log('Creating new customer...');
    const customer = new Customer({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
      district: district.trim(),
      province: province.trim(),
      priceAlerts: [],
    });

    console.log('Saving customer to database...');
    const savedCustomer = await customer.save();
    console.log('Customer saved successfully:', savedCustomer._id);

    // Return success response without password
    const customerResponse = {
      _id: savedCustomer._id,
      name: savedCustomer.name,
      email: savedCustomer.email,
      phone: savedCustomer.phone,
      district: savedCustomer.district,
      province: savedCustomer.province,
      priceAlerts: savedCustomer.priceAlerts,
      createdAt: savedCustomer.createdAt,
    };

    console.log('Registration successful');
    return NextResponse.json(
      { 
        message: 'Customer registered successfully', 
        customer: customerResponse 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific Mongoose validation errors
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { error: 'Validation error: ' + error.message },
          { status: 400 }
        );
      }
      
      if (error.name === 'MongoServerError' && (error as any).code === 11000) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
