import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/dbConnect';
import Price from '../../../lib/models/Price';

// Sample price data for Sri Lankan markets
const samplePriceData = [
  // Rice varieties
  {
    productName: 'Rice',
    variety: 'Nadu',
    category: 'grains',
    pricePerKg: 95.50,
    unit: 'kg',
    market: 'Pettah Wholesale Market',
    location: { district: 'Colombo', province: 'Western', market: 'Pettah Wholesale Market' },
    date: new Date(),
    source: 'market',
    quality: 'standard',
    verified: true
  },
  {
    productName: 'Rice',
    variety: 'Samba',
    category: 'grains',
    pricePerKg: 105.00,
    unit: 'kg',
    market: 'Pettah Wholesale Market',
    location: { district: 'Colombo', province: 'Western', market: 'Pettah Wholesale Market' },
    date: new Date(),
    source: 'market',
    quality: 'standard',
    verified: true
  },
  {
    productName: 'Rice',
    variety: 'Red Rice',
    category: 'grains',
    pricePerKg: 135.00,
    unit: 'kg',
    market: 'Kandy Central Market',
    location: { district: 'Kandy', province: 'Central', market: 'Kandy Central Market' },
    date: new Date(),
    source: 'market',
    quality: 'organic',
    verified: true
  },
  
  // Coconut products
  {
    productName: 'Coconut',
    variety: 'King Coconut',
    category: 'coconut',
    pricePerKg: 45.00,
    unit: 'pieces',
    market: 'Gampaha Market',
    location: { district: 'Gampaha', province: 'Western', market: 'Gampaha Market' },
    date: new Date(),
    source: 'market',
    quality: 'premium',
    verified: true
  },
  {
    productName: 'Coconut',
    variety: 'Regular Coconut',
    category: 'coconut',
    pricePerKg: 38.00,
    unit: 'pieces',
    market: 'Colombo Manning Market',
    location: { district: 'Colombo', province: 'Western', market: 'Colombo Manning Market' },
    date: new Date(),
    source: 'market',
    quality: 'standard',
    verified: true
  },
  
  // Vegetables
  {
    productName: 'Potato',
    category: 'vegetables',
    pricePerKg: 285.00,
    unit: 'kg',
    market: 'Nuwara Eliya Market',
    location: { district: 'Nuwara Eliya', province: 'Central', market: 'Nuwara Eliya Market' },
    date: new Date(),
    source: 'market',
    quality: 'premium',
    verified: true
  },
  {
    productName: 'Onion',
    variety: 'Big Onion',
    category: 'vegetables',
    pricePerKg: 450.00,
    unit: 'kg',
    market: 'Dambulla Economic Centre',
    location: { district: 'Matale', province: 'Central', market: 'Dambulla Economic Centre' },
    date: new Date(),
    source: 'market',
    quality: 'standard',
    verified: true
  },
  {
    productName: 'Tomato',
    category: 'vegetables',
    pricePerKg: 320.00,
    unit: 'kg',
    market: 'Badulla Market',
    location: { district: 'Badulla', province: 'Uva', market: 'Badulla Market' },
    date: new Date(),
    source: 'market',
    quality: 'standard',
    verified: true
  },
  {
    productName: 'Carrot',
    category: 'vegetables',
    pricePerKg: 275.00,
    unit: 'kg',
    market: 'Nuwara Eliya Market',
    location: { district: 'Nuwara Eliya', province: 'Central', market: 'Nuwara Eliya Market' },
    date: new Date(),
    source: 'market',
    quality: 'premium',
    verified: true
  },
  {
    productName: 'Cabbage',
    category: 'vegetables',
    pricePerKg: 165.00,
    unit: 'kg',
    market: 'Bandarawela Market',
    location: { district: 'Badulla', province: 'Uva', market: 'Bandarawela Market' },
    date: new Date(),
    source: 'market',
    quality: 'standard',
    verified: true
  },
  
  // Fruits
  {
    productName: 'Mango',
    variety: 'Karuthacolomban',
    category: 'fruits',
    pricePerKg: 450.00,
    unit: 'kg',
    market: 'Jaffna Market',
    location: { district: 'Jaffna', province: 'Northern', market: 'Jaffna Market' },
    date: new Date(),
    source: 'market',
    quality: 'premium',
    verified: true
  },
  {
    productName: 'Banana',
    variety: 'Ambul',
    category: 'fruits',
    pricePerKg: 185.00,
    unit: 'kg',
    market: 'Kegalle Market',
    location: { district: 'Kegalle', province: 'Sabaragamuwa', market: 'Kegalle Market' },
    date: new Date(),
    source: 'market',
    quality: 'standard',
    verified: true
  },
  {
    productName: 'Papaya',
    category: 'fruits',
    pricePerKg: 225.00,
    unit: 'kg',
    market: 'Anuradhapura Market',
    location: { district: 'Anuradhapura', province: 'North Central', market: 'Anuradhapura Market' },
    date: new Date(),
    source: 'market',
    quality: 'standard',
    verified: true
  },
  
  // Spices
  {
    productName: 'Cinnamon',
    category: 'spices',
    pricePerKg: 2800.00,
    unit: 'kg',
    market: 'Galle Market',
    location: { district: 'Galle', province: 'Southern', market: 'Galle Market' },
    date: new Date(),
    source: 'market',
    quality: 'premium',
    verified: true
  },
  {
    productName: 'Black Pepper',
    category: 'spices',
    pricePerKg: 3200.00,
    unit: 'kg',
    market: 'Matale Market',
    location: { district: 'Matale', province: 'Central', market: 'Matale Market' },
    date: new Date(),
    source: 'market',
    quality: 'premium',
    verified: true
  },
  
  // Historical data (yesterday's prices for comparison)
  {
    productName: 'Rice',
    variety: 'Nadu',
    category: 'grains',
    pricePerKg: 93.00,
    unit: 'kg',
    market: 'Pettah Wholesale Market',
    location: { district: 'Colombo', province: 'Western', market: 'Pettah Wholesale Market' },
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    source: 'market',
    quality: 'standard',
    verified: true
  },
  {
    productName: 'Potato',
    category: 'vegetables',
    pricePerKg: 275.00,
    unit: 'kg',
    market: 'Nuwara Eliya Market',
    location: { district: 'Nuwara Eliya', province: 'Central', market: 'Nuwara Eliya Market' },
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    source: 'market',
    quality: 'premium',
    verified: true
  }
];

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Clear existing sample data
    await Price.deleteMany({ source: 'api' });
    
    // Insert new sample data
    const pricesWithApiSource = samplePriceData.map(price => ({
      ...price,
      source: 'api' // Mark as API-generated data
    }));
    
    const insertedPrices = await Price.insertMany(pricesWithApiSource);
    
    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${insertedPrices.length} price records`,
      data: {
        inserted: insertedPrices.length,
        samples: insertedPrices.slice(0, 5).map(p => ({
          product: `${p.productName} ${p.variety || ''}`.trim(),
          price: `Rs.${p.pricePerKg}/${p.unit}`,
          location: `${p.location.district}, ${p.location.province}`,
          date: p.date
        }))
      }
    });
  } catch (error) {
    console.error('Error seeding price data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed price data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    
    const priceCount = await Price.countDocuments();
    const recentPrices = await Price.find()
      .sort({ date: -1 })
      .limit(10)
      .lean();
    
    return NextResponse.json({
      success: true,
      data: {
        totalPrices: priceCount,
        recentPrices: recentPrices.map(p => ({
          product: `${p.productName} ${p.variety || ''}`.trim(),
          price: `Rs.${p.pricePerKg}/${p.unit}`,
          location: `${p.location.district}, ${p.location.province}`,
          market: p.market,
          date: p.date,
          verified: p.verified
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching price data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch price data' },
      { status: 500 }
    );
  }
}
