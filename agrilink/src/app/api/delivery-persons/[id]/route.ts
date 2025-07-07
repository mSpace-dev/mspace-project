import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import DeliveryPerson from '@/lib/models/DeliveryPerson';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const deliveryPerson = await DeliveryPerson.findById(id);
    
    if (!deliveryPerson) {
      return NextResponse.json(
        { success: false, error: 'Delivery person not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: deliveryPerson
    });
  } catch (error) {
    console.error('Error fetching delivery person:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch delivery person' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const body = await request.json();
    
    const deliveryPerson = await DeliveryPerson.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!deliveryPerson) {
      return NextResponse.json(
        { success: false, error: 'Delivery person not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: deliveryPerson,
      message: 'Delivery person updated successfully'
    });
  } catch (error) {
    console.error('Error updating delivery person:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update delivery person' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const deliveryPerson = await DeliveryPerson.findByIdAndDelete(id);
    
    if (!deliveryPerson) {
      return NextResponse.json(
        { success: false, error: 'Delivery person not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Delivery person deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting delivery person:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete delivery person' },
      { status: 500 }
    );
  }
}
