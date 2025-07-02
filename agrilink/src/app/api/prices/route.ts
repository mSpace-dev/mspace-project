import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db } from 'mongodb';


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'Agrilink';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

async function getDatabase(): Promise<Db> {
  if (!clientPromise) {
    client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect();
  }
  
  const connectedClient = await clientPromise;
  return connectedClient.db(DB_NAME);
}

interface PriceData {
  id: string;
  commodity: string;
  category: string;
  unit: string;
  market: string;
  marketType: 'wholesale' | 'retail';
  location: string;
  yesterdayPrice: number | null;
  todayPrice: number | null;
  changePercent: number | null;
  changeAmount: number | null;
  trend: 'increase' | 'decrease' | 'stable';
  significantChange: boolean;
  date: string;
}

// GET /api/prices - Fetch price data with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const marketType = searchParams.get('marketType');
    const commodity = searchParams.get('commodity');
    const location = searchParams.get('location');
    const significantOnly = searchParams.get('significantOnly') === 'true';

    const db = await getDatabase();

    // Build the MongoDB query filter
    const filter: any = {};

    // Get the latest date first
    const latestDateResult = await db.collection('price_changes').findOne(
      {},
      { sort: { date: -1 }, projection: { date: 1 } }
    );

    if (latestDateResult) {
      filter.date = latestDateResult.date;
    }

    if (category) {
      filter.commodity_category = new RegExp(category, 'i');
    }

    if (marketType) {
      filter.market_type = marketType;
    }

    if (commodity) {
      filter.commodity_name = new RegExp(commodity, 'i');
    }

    if (location) {
      filter.market_location = new RegExp(location, 'i');
    }

    if (significantOnly) {
      filter.significant_change = true;
    }

    // Get the price changes from MongoDB
    const results = await db.collection('price_changes')
      .find(filter)
      .sort({ change_percentage: -1 })
      .toArray();

    // Transform the results to match the expected format
    const prices: PriceData[] = results.map((row: any) => ({
      id: row._id.toString(),
      commodity: row.commodity_name,
      category: row.commodity_category,
      unit: row.commodity_unit,
      market: row.market_name,
      marketType: row.market_type,
      location: row.market_location,
      yesterdayPrice: row.yesterday_price,
      todayPrice: row.today_price,
      changeAmount: row.change_amount,
      changePercent: row.change_percentage,
      trend: row.trend,
      significantChange: row.significant_change,
      date: row.date instanceof Date ? row.date.toISOString() : row.date
    }));

    return NextResponse.json({
      success: true,
      data: prices,
      total: prices.length,
      filters: {
        category,
        marketType,
        commodity,
        location,
        significantOnly
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('MongoDB error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch prices from database',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// POST /api/prices - Add new price data (for admin/data entry)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { commodity, category, unit, market, marketType, location, price } = body;

        // Validate required fields
        if (!commodity || !price || !unit || !market || !marketType || !location) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const db = await getDatabase();

        // Create new price entry
        const newPrice = {
            commodity_name: commodity,
            commodity_category: category || 'Other',
            commodity_unit: unit,
            market_name: market,
            market_type: marketType,
            market_location: location,
            today_price: parseFloat(price),
            yesterday_price: null,
            change_amount: 0,
            change_percentage: 0,
            trend: 'stable',
            significant_change: false,
            date: new Date(),
            created_at: new Date(),
            updated_at: new Date()
        };

        const result = await db.collection('price_changes').insertOne(newPrice);

        return NextResponse.json({
            success: true,
            data: {
                id: result.insertedId,
                ...newPrice
            },
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


