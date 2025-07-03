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

// GET /api/analytics - Get analytics data for charts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'category-comparison', 'commodity-changes', 'market-summary', 'available-dates'
    const date = searchParams.get('date');
    const category = searchParams.get('category');

    const db = await getDatabase();

    // Build date filter
    const dateFilter: any = {};
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      dateFilter.date = {
        $gte: targetDate,
        $lt: nextDay
      };
    } else {
      // Get latest date
      const latestDateResult = await db.collection('price_changes').findOne(
        {},
        { sort: { date: -1 }, projection: { date: 1 } }
      );
      if (latestDateResult) {
        dateFilter.date = latestDateResult.date;
      }
    }

    switch (type) {
      case 'category-comparison':
        // Pie chart data: commodities within a specific category
        if (!category) {
          return NextResponse.json({
            success: false,
            error: 'Category parameter is required for commodity comparison'
          }, { status: 400 });
        }

        const commodityFilter = { 
          ...dateFilter,
          commodity_category: new RegExp(category, 'i')
        };

        const commodityData = await db.collection('price_changes').aggregate([
          { $match: commodityFilter },
          {
            $group: {
              _id: '$commodity_name',
              avgPrice: { $avg: '$today_price' },
              count: { $sum: 1 },
              totalValue: { $sum: '$today_price' },
              unit: { $first: '$commodity_unit' },
              category: { $first: '$commodity_category' }
            }
          },
          { $sort: { totalValue: -1 } }
        ]).toArray();

        return NextResponse.json({
          success: true,
          data: commodityData.map(item => ({
            name: item._id, // For pie chart compatibility
            commodity: item._id,
            category: item.category,
            unit: item.unit,
            value: Math.round(item.avgPrice * 100) / 100, // Use avgPrice as the value for pie chart
            averagePrice: Math.round(item.avgPrice * 100) / 100,
            count: item.count,
            totalValue: Math.round(item.totalValue * 100) / 100
          }))
        });

      case 'commodity-changes':
        // Bar chart data: price changes for specific category
        const changesFilter = { ...dateFilter };
        if (category) {
          changesFilter.commodity_category = new RegExp(category, 'i');
        }

        const changesData = await db.collection('price_changes')
          .find(changesFilter)
          .sort({ change_percentage: -1 })
          .limit(20)
          .toArray();

        return NextResponse.json({
          success: true,
          data: changesData.map(item => ({
            commodity: item.commodity_name,
            category: item.commodity_category,
            market: item.market_name,
            yesterdayPrice: item.yesterday_price,
            todayPrice: item.today_price,
            changeAmount: item.change_amount,
            changePercentage: item.change_percentage,
            trend: item.trend,
            significantChange: item.significant_change
          }))
        });

      case 'market-summary':
        // Market comparison data
        const marketData = await db.collection('price_changes').aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: {
                market: '$market_name',
                type: '$market_type'
              },
              avgPrice: { $avg: '$today_price' },
              priceIncreases: {
                $sum: { $cond: [{ $gt: ['$change_percentage', 0] }, 1, 0] }
              },
              priceDecreases: {
                $sum: { $cond: [{ $lt: ['$change_percentage', 0] }, 1, 0] }
              },
              totalCommodities: { $sum: 1 }
            }
          },
          { $sort: { avgPrice: -1 } }
        ]).toArray();

        return NextResponse.json({
          success: true,
          data: marketData.map(item => ({
            market: item._id.market,
            marketType: item._id.type,
            averagePrice: Math.round(item.avgPrice * 100) / 100,
            priceIncreases: item.priceIncreases,
            priceDecreases: item.priceDecreases,
            totalCommodities: item.totalCommodities,
            stabilityScore: Math.round(((item.totalCommodities - item.priceIncreases - item.priceDecreases) / item.totalCommodities) * 100)
          }))
        });

      case 'available-dates':
        // Get available dates for date picker
        const dates = await db.collection('price_changes').distinct('date');
        const sortedDates = dates
          .map(date => new Date(date))
          .sort((a, b) => b.getTime() - a.getTime())
          .slice(0, 30) // Last 30 days
          .map(date => date.toISOString().split('T')[0]);

        return NextResponse.json({
          success: true,
          data: sortedDates
        });

      case 'available-categories':
        // Get available categories
        const categoriesResult = await db.collection('price_changes').distinct('commodity_category');
        const availableCategories = categoriesResult.filter(cat => cat && cat.trim() !== '');

        return NextResponse.json({
          success: true,
          data: availableCategories
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid analytics type. Use: category-comparison, commodity-changes, market-summary, available-dates, or available-categories'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics data',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
