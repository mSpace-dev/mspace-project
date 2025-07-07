import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Customer from '@/lib/models/Customer';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('id');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Find customer by ID
    const customer = await Customer.findById(customerId).select('-password');
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        customer: {
          _id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          district: customer.district,
          province: customer.province,
          priceAlerts: customer.priceAlerts || [],
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get customer profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('id');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const updateData = await req.json();
    
    // Remove sensitive fields that shouldn't be updated this way
    delete updateData.password;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    // Remove farmer-specific fields that don't apply to customers
    delete updateData.farmSize;
    delete updateData.farmType;
    delete updateData.mainCrops;
    delete updateData.experience;
    delete updateData.timezone;
    
    // Only allow updating customer-relevant fields
    const allowedFields = ['name', 'phone', 'district', 'province', 'priceAlerts'];
    const filteredUpdateData: any = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdateData[key] = updateData[key];
      }
    });

    // Update customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { ...filteredUpdateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Profile updated successfully',
        customer: {
          _id: updatedCustomer._id,
          name: updatedCustomer.name,
          email: updatedCustomer.email,
          phone: updatedCustomer.phone,
          district: updatedCustomer.district,
          province: updatedCustomer.province,
          priceAlerts: updatedCustomer.priceAlerts || [],
          createdAt: updatedCustomer.createdAt,
          updatedAt: updatedCustomer.updatedAt,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update customer profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
