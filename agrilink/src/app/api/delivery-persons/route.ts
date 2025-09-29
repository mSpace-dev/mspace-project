import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import DeliveryPerson from '@/lib/models/DeliveryPerson';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const deliveryPersons = await DeliveryPerson.find({})
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      data: deliveryPersons
    });
  } catch (error) {
    console.error('Error fetching delivery persons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch delivery persons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'nicNumber', 'address'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Check if email already exists
    const existingPerson = await DeliveryPerson.findOne({ 
      'personalInfo.email': body.email 
    });
    
    if (existingPerson) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    // Create new delivery person
    const deliveryPerson = new DeliveryPerson({
      personalInfo: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        nicNumber: body.nicNumber,
        address: body.address,
        emergencyContact: body.emergencyContact || {}
      },
      bankDetails: body.bankDetails || {},
      documents: body.documents || {},
      status: 'pending',
      vehicleInfo: body.vehicleInfo || {}
    });
    
    const savedPerson = await deliveryPerson.save();
    
    return NextResponse.json({
      success: true,
      data: savedPerson,
      message: 'Delivery person registered successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating delivery person:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create delivery person' },
      { status: 500 }
    );
  }
}
