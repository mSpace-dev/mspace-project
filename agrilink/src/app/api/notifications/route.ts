import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { sendBulkNotification, sendPriceAlert, emailTemplates } from '@/lib/emailService';
import EmailSubscription from '@/lib/models/EmailSubscription';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { type, data, preferences } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Notification type is required' },
        { status: 400 }
      );
    }

    let template;
    let targetPreferences = {};

    switch (type) {
      case 'price_alert':
        if (!data || !data.product || !data.price || !data.location) {
          return NextResponse.json(
            { error: 'Price alert requires product, price, and location data' },
            { status: 400 }
          );
        }
        template = emailTemplates.priceAlert(data);
        targetPreferences = { priceAlerts: true };
        break;

      case 'weekly_digest':
        template = emailTemplates.weeklyDigest(data || {});
        targetPreferences = { weeklyDigest: true };
        break;

      case 'market_news':
        if (!data || !data.subject || !data.content) {
          return NextResponse.json(
            { error: 'Market news requires subject and content' },
            { status: 400 }
          );
        }
        template = {
          subject: data.subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #16a34a; margin-bottom: 10px;">📰 Market News</h1>
              </div>
              <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0;">
                ${data.content}
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/prices" 
                   style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  View Live Prices
                </a>
              </div>
            </div>
          `,
          text: `Market News\n\n${data.content}\n\nView live prices: ${process.env.NEXT_PUBLIC_BASE_URL}/prices`
        };
        targetPreferences = { marketNews: true };
        break;

      case 'forecast_update':
        if (!data || !data.forecast) {
          return NextResponse.json(
            { error: 'Forecast update requires forecast data' },
            { status: 400 }
          );
        }
        template = {
          subject: '📈 Market Forecast Update',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin-bottom: 10px;">📈 Market Forecast Update</h1>
              </div>
              <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0;">
                <h2 style="color: #2563eb; margin-top: 0;">Latest Predictions</h2>
                <p style="color: #333; line-height: 1.6;">${data.forecast}</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/demandforecast" 
                   style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  View Detailed Forecast
                </a>
              </div>
            </div>
          `,
          text: `Market Forecast Update\n\nLatest Predictions:\n${data.forecast}\n\nView detailed forecast: ${process.env.NEXT_PUBLIC_BASE_URL}/demandforecast`
        };
        targetPreferences = { forecastUpdates: true };
        break;

      case 'order_claimed':
        if (!data || !data.customerEmail || !data.sellerName || !data.estimatedDeliveryDate) {
          return NextResponse.json(
            { error: 'Order claimed notification requires customerEmail, sellerName, and estimatedDeliveryDate' },
            { status: 400 }
          );
        }
        template = {
          subject: '✅ Your Order Has Been Claimed!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #16a34a; margin-bottom: 10px;">✅ Great News!</h1>
                <h2 style="color: #333; margin: 0;">Your Order Has Been Claimed</h2>
              </div>
              <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0;">
                <p style="color: #333; line-height: 1.6; margin: 0;">
                  <strong>${data.sellerName}</strong> has accepted your order and will deliver it by 
                  <strong>${new Date(data.estimatedDeliveryDate).toLocaleDateString()}</strong>.
                </p>
              </div>
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
                <p style="color: #666; margin: 5px 0;"><strong>Order ID:</strong> #${data.orderId?.slice(-8) || 'N/A'}</p>
                <p style="color: #666; margin: 5px 0;"><strong>Seller:</strong> ${data.sellerName}</p>
                <p style="color: #666; margin: 5px 0;"><strong>Estimated Delivery:</strong> ${new Date(data.estimatedDeliveryDate).toLocaleDateString()}</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/customer/orders" 
                   style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Track Your Order
                </a>
              </div>
            </div>
          `,
          text: `Great News! Your Order Has Been Claimed\n\n${data.sellerName} has accepted your order and will deliver it by ${new Date(data.estimatedDeliveryDate).toLocaleDateString()}.\n\nOrder ID: #${data.orderId?.slice(-8) || 'N/A'}\nSeller: ${data.sellerName}\nEstimated Delivery: ${new Date(data.estimatedDeliveryDate).toLocaleDateString()}\n\nTrack your order: ${process.env.NEXT_PUBLIC_BASE_URL}/customer/orders`
        };
        // Send directly to customer email
        break;

      case 'order_status_update':
        if (!data || !data.customerEmail || !data.status || !data.sellerName) {
          return NextResponse.json(
            { error: 'Order status update notification requires customerEmail, status, and sellerName' },
            { status: 400 }
          );
        }
        template = {
          subject: `📦 Order Update: ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin-bottom: 10px;">📦 Order Status Update</h1>
              </div>
              <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0;">
                <p style="color: #333; line-height: 1.6; margin: 0;">
                  Your order has been updated to <strong>${data.status.charAt(0).toUpperCase() + data.status.slice(1)}</strong> by ${data.sellerName}.
                </p>
                ${data.note ? `<p style="color: #666; margin: 10px 0 0 0; font-style: italic;">"${data.note}"</p>` : ''}
              </div>
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
                <p style="color: #666; margin: 5px 0;"><strong>Order ID:</strong> #${data.orderId?.slice(-8) || 'N/A'}</p>
                <p style="color: #666; margin: 5px 0;"><strong>Status:</strong> ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}</p>
                <p style="color: #666; margin: 5px 0;"><strong>Seller:</strong> ${data.sellerName}</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/customer/orders" 
                   style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  View Order Details
                </a>
              </div>
            </div>
          `,
          text: `Order Status Update\n\nYour order has been updated to ${data.status.charAt(0).toUpperCase() + data.status.slice(1)} by ${data.sellerName}.\n\n${data.note ? `Note: "${data.note}"\n\n` : ''}Order ID: #${data.orderId?.slice(-8) || 'N/A'}\nStatus: ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}\nSeller: ${data.sellerName}\n\nView order details: ${process.env.NEXT_PUBLIC_BASE_URL}/customer/orders`
        };
        // Send directly to customer email
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }

    // Handle direct email notifications (order_claimed, order_status_update)
    if (type === 'order_claimed' || type === 'order_status_update') {
      const { sendEmail } = require('@/lib/emailService');
      try {
        await sendEmail(data.customerEmail, template.subject, template.html, template.text);
        return NextResponse.json({
          message: `Successfully sent ${type} notification to customer`,
          sentCount: 1,
          type
        });
      } catch (error) {
        console.error(`Failed to send ${type} notification:`, error);
        return NextResponse.json(
          { error: 'Failed to send notification to customer' },
          { status: 500 }
        );
      }
    }

    // Send bulk notification for other types
    const sentCount = await sendBulkNotification(template, preferences || targetPreferences);

    return NextResponse.json({
      message: `Successfully sent ${type} notification to ${sentCount} subscribers`,
      sentCount,
      type
    });

  } catch (error) {
    console.error('Notification sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

// Get notification stats
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'stats') {
      // Get subscriber statistics
      const total = await EmailSubscription.countDocuments({ isActive: true });
      const priceAlerts = await EmailSubscription.countDocuments({ 
        isActive: true, 
        'preferences.priceAlerts': true 
      });
      const weeklyDigest = await EmailSubscription.countDocuments({ 
        isActive: true, 
        'preferences.weeklyDigest': true 
      });
      const marketNews = await EmailSubscription.countDocuments({ 
        isActive: true, 
        'preferences.marketNews': true 
      });
      const forecastUpdates = await EmailSubscription.countDocuments({ 
        isActive: true, 
        'preferences.forecastUpdates': true 
      });

      return NextResponse.json({
        total,
        preferences: {
          priceAlerts,
          weeklyDigest,
          marketNews,
          forecastUpdates
        }
      });
    }

    return NextResponse.json(
      { error: 'Please specify stats type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Get notification stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
