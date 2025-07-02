import { NextRequest, NextResponse } from 'next/server';

// Mock data for demonstration - replace with actual database queries
const mockPrices = [
  {
    id: 1,
    crop: 'Rice',
    variety: 'Nadu',
    price: 85.50,
    unit: 'kg',
    market: 'Pettah',
    district: 'Colombo',
    province: 'Western',
    date: new Date().toISOString(),
    change: '+2.5%',
    trend: 'up'
  },
  {
    id: 2,
    crop: 'Coconut',
    variety: 'King Coconut',
    price: 45.00,
    unit: 'piece',
    market: 'Gampaha',
    district: 'Gampaha',
    province: 'Western',
    date: new Date().toISOString(),
    change: '-1.2%',
    trend: 'down'
  },
  {
    id: 3,
    crop: 'Tomato',
    variety: 'Local',
    price: 120.00,
    unit: 'kg',
    market: 'Kandy Central',
    district: 'Kandy',
    province: 'Central',
    date: new Date().toISOString(),
    change: '+5.8%',
    trend: 'up'
  }
];

// GET /api/prices - Fetch all prices or filter by query parameters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const crop = searchParams.get('crop');
    const district = searchParams.get('district');
    const province = searchParams.get('province');
    const market = searchParams.get('market');

    let filteredPrices = [...mockPrices];

    // Apply filters
    if (crop) {
      filteredPrices = filteredPrices.filter(p => 
        p.crop.toLowerCase().includes(crop.toLowerCase())
      );
    }
    if (district) {
      filteredPrices = filteredPrices.filter(p => 
        p.district.toLowerCase().includes(district.toLowerCase())
      );
    }
    if (province) {
      filteredPrices = filteredPrices.filter(p => 
        p.province.toLowerCase().includes(province.toLowerCase())
      );
    }
    if (market) {
      filteredPrices = filteredPrices.filter(p => 
        p.market.toLowerCase().includes(market.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredPrices,
      count: filteredPrices.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}

// POST /api/prices - Add new price data (for admin/data entry)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { crop, variety, price, unit, market, district, province } = body;

    // Validate required fields
    if (!crop || !price || !unit || !market || !district || !province) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real app, save to database
    const newPrice = {
      id: mockPrices.length + 1,
      crop,
      variety: variety || 'Standard',
      price: parseFloat(price),
      unit,
      market,
      district,
      province,
      date: new Date().toISOString(),
      change: '0%',
      trend: 'stable'
    };

    mockPrices.push(newPrice);

    return NextResponse.json({
      success: true,
      data: newPrice,
      message: 'Price data added successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding price:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add price data' },
      { status: 500 }
    );
  }
}
