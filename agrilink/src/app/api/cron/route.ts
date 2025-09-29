import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { sendBulkNotification, emailTemplates } from '@/lib/emailService';
import EmailSubscription from '@/lib/models/EmailSubscription';

// This endpoint can be called by a cron job service (like Vercel Cron or external cron)
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authorization header check for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { jobType, force } = body;

    const results: any = {};

    switch (jobType) {
      case 'weekly_digest':
        // Send weekly digest (normally on Sundays)
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        if (dayOfWeek === 0 || force) { // Sunday or forced
          const marketData = {
            // You can fetch real market data here
            weeklyHighlights: [
              'Rice prices stabilized at Rs. 180-200/kg',
              'Vegetable prices decreased by 15% on average',
              'Fruit exports increased, affecting local prices',
              'Next week forecast shows potential price increases in leafy vegetables'
            ]
          };
          
          const template = emailTemplates.weeklyDigest(marketData);
          const sentCount = await sendBulkNotification(template, { weeklyDigest: true });
          results.weekly_digest = { sent: sentCount, day: dayOfWeek };
        } else {
          results.weekly_digest = { skipped: 'Not Sunday', day: dayOfWeek };
        }
        break;

      case 'price_check':
        // Check for significant price changes and send alerts
        // This is a placeholder - you would integrate with your price monitoring system
        const significantChanges = await checkForPriceChanges();
        
        for (const change of significantChanges) {
          const template = emailTemplates.priceAlert(change);
          const sentCount = await sendBulkNotification(template, { priceAlerts: true });
          results[`price_alert_${change.product}`] = { sent: sentCount };
        }
        break;

      case 'daily_summary':
        // Send daily market summary
        const dailyData = await getDailyMarketSummary();
        if (dailyData.hasSignificantChanges || force) {
          const template = {
            subject: '📊 Daily Market Summary - AgriLink',
            html: generateDailyMarketEmailHTML(dailyData),
            text: generateDailyMarketEmailText(dailyData)
          };
          
          const sentCount = await sendBulkNotification(template, { marketNews: true });
          results.daily_summary = { sent: sentCount };
        } else {
          results.daily_summary = { skipped: 'No significant changes' };
        }
        break;

      case 'cleanup':
        // Clean up old unsubscribed emails (older than 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const deletedCount = await EmailSubscription.deleteMany({
          isActive: false,
          updatedAt: { $lt: sixMonthsAgo }
        });
        
        results.cleanup = { deleted: deletedCount.deletedCount };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid job type. Use: weekly_digest, price_check, daily_summary, cleanup' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: 'Automated job completed successfully',
      jobType,
      timestamp: new Date().toISOString(),
      results
    });

  } catch (error) {
    console.error('Automated job error:', error);
    return NextResponse.json(
      { error: 'Failed to run automated job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper functions (these would integrate with your actual data sources)
async function checkForPriceChanges() {
  // Placeholder - integrate with your price monitoring system
  // This should check your price database for significant changes
  return [
    {
      product: 'Rice',
      price: 220,
      location: 'Colombo',
      change: 8.5
    }
    // Add more price changes here
  ];
}

async function getDailyMarketSummary() {
  // Placeholder - fetch from your price database
  return {
    hasSignificantChanges: true,
    topChanges: [
      { product: 'Rice', change: '+8.5%' },
      { product: 'Onions', change: '-12.3%' }
    ],
    averageChange: '+2.1%',
    mostActiveMarkets: ['Colombo', 'Kandy', 'Galle']
  };
}

function generateDailyMarketEmailHTML(data: any) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #16a34a; margin-bottom: 10px;">📊 Daily Market Summary</h1>
        <p style="color: #666; font-size: 16px;">${new Date().toLocaleDateString()}</p>
      </div>
      
      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0;">
        <h2 style="color: #16a34a; margin-top: 0;">Today's Highlights</h2>
        <ul style="color: #333; line-height: 1.6;">
          ${data.topChanges.map((change: any) => 
            `<li>${change.product}: ${change.change}</li>`
          ).join('')}
        </ul>
        <p><strong>Average Market Change:</strong> ${data.averageChange}</p>
        <p><strong>Most Active Markets:</strong> ${data.mostActiveMarkets.join(', ')}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/prices" 
           style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
          View Live Prices
        </a>
      </div>
    </div>
  `;
}

function generateDailyMarketEmailText(data: any) {
  return `
Daily Market Summary - ${new Date().toLocaleDateString()}

Today's Highlights:
${data.topChanges.map((change: any) => `- ${change.product}: ${change.change}`).join('\n')}

Average Market Change: ${data.averageChange}
Most Active Markets: ${data.mostActiveMarkets.join(', ')}

View live prices: ${process.env.NEXT_PUBLIC_BASE_URL}/prices
  `;
}
