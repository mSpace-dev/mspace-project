import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import NewsletterMessage from '@/lib/models/NewsletterMessage';

const dummyMessages = [
  {
    title: "Welcome to AgriLink 2.0 - Enhanced Features for Sri Lankan Farmers",
    content: "We're excited to announce the launch of AgriLink 2.0 with powerful new features designed specifically for Sri Lankan agriculture. Our updated platform now includes AI-powered price predictions, real-time market analysis, and improved SMS alert system.",
    messageType: "service_announcement",
    priority: "high",
    emailSubject: "🚀 AgriLink 2.0 is Here - New Features for Better Farming!",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🚀 AgriLink 2.0 is Here!</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #16a34a;">Enhanced Features for Better Farming</h2>
          <p>Dear AgriLink Community,</p>
          <p>We're thrilled to announce the launch of AgriLink 2.0 with exciting new features:</p>
          <ul style="line-height: 1.6;">
            <li><strong>AI-Powered Price Predictions:</strong> Get accurate forecasts for your crops</li>
            <li><strong>Real-Time Market Analysis:</strong> Stay updated with live market trends</li>
            <li><strong>Improved SMS Alerts:</strong> Better notification system for price changes</li>
            <li><strong>Enhanced Mobile Experience:</strong> Optimized for your smartphone</li>
          </ul>
          <p style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}" 
               style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Explore New Features
            </a>
          </p>
          <p>Happy Farming!<br>The AgriLink Team</p>
        </div>
      </div>
    `,
    targetAudience: { allSubscribers: true, priceAlertsOnly: false, marketNewsOnly: false, weeklyDigestOnly: false }
  },
  {
    title: "New Partnership with Department of Agriculture - Verified Market Data",
    content: "AgriLink has partnered with the Department of Agriculture of Sri Lanka to provide verified and official market data. This ensures our price information is accurate and comes directly from government sources.",
    messageType: "platform_notice",
    priority: "high",
    emailSubject: "📊 Official Partnership: Verified Market Data from Department of Agriculture",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">📊 Official Partnership Announcement</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #0ea5e9;">Verified Market Data from Government Sources</h2>
          <p>Dear Valued Subscribers,</p>
          <p>We're proud to announce our official partnership with the <strong>Department of Agriculture of Sri Lanka</strong>.</p>
          
          <div style="background-color: #f0f9ff; padding: 15px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
            <p style="margin: 0;"><strong>What this means for you:</strong></p>
            <ul style="margin: 10px 0 0 0;">
              <li>100% verified market prices</li>
              <li>Direct government data integration</li>
              <li>More accurate price predictions</li>
              <li>Official market trend reports</li>
            </ul>
          </div>
          
          <p>This partnership ensures you receive the most reliable agricultural market information in Sri Lanka.</p>
          <p>Trust AgriLink for authentic market insights.</p>
          <p>Best regards,<br>AgriLink Sri Lanka</p>
        </div>
      </div>
    `,
    targetAudience: { allSubscribers: true, priceAlertsOnly: false, marketNewsOnly: false, weeklyDigestOnly: false }
  },
  {
    title: "New Crop Categories Added - Spices, Herbs, and Export Crops",
    content: "We've expanded our platform to include comprehensive tracking for spices, herbs, and export crops. Monitor prices for cinnamon, cardamom, pepper, tea, rubber, and coconut products.",
    messageType: "feature_update",
    priority: "medium",
    emailSubject: "🌿 New Categories: Spices, Herbs & Export Crops Now Available!",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🌿 New Crop Categories Available</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #dc2626;">Spices, Herbs & Export Crops</h2>
          <p>Great news for our farming community!</p>
          <p>We've added comprehensive tracking for high-value crops that are essential to Sri Lankan agriculture:</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px;">
              <h4 style="margin: 0 0 10px 0; color: #dc2626;">🌶️ Spices</h4>
              <ul style="margin: 0; font-size: 14px;">
                <li>Cinnamon</li>
                <li>Cardamom</li>
                <li>Black Pepper</li>
                <li>Cloves</li>
              </ul>
            </div>
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px;">
              <h4 style="margin: 0 0 10px 0; color: #16a34a;">🌿 Herbs</h4>
              <ul style="margin: 0; font-size: 14px;">
                <li>Curry Leaves</li>
                <li>Lemongrass</li>
                <li>Pandan</li>
                <li>Gotu Kola</li>
              </ul>
            </div>
            <div style="background-color: #fefce8; padding: 15px; border-radius: 6px;">
              <h4 style="margin: 0 0 10px 0; color: #ca8a04;">🥥 Export Crops</h4>
              <ul style="margin: 0; font-size: 14px;">
                <li>Tea</li>
                <li>Rubber</li>
                <li>Coconut Products</li>
                <li>Cashew</li>
              </ul>
            </div>
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px;">
              <h4 style="margin: 0 0 10px 0; color: #0ea5e9;">📊 New Features</h4>
              <ul style="margin: 0; font-size: 14px;">
                <li>Export price tracking</li>
                <li>Quality grade pricing</li>
                <li>Seasonal trends</li>
                <li>International rates</li>
              </ul>
            </div>
          </div>
          
          <p>Start tracking these valuable crops today and maximize your farming profits!</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/prices" 
               style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View New Categories
            </a>
          </p>
          <p>Happy Farming!<br>AgriLink Team</p>
        </div>
      </div>
    `,
    targetAudience: { allSubscribers: true, priceAlertsOnly: false, marketNewsOnly: false, weeklyDigestOnly: false }
  },
  {
    title: "Monsoon Season Market Insights - Prepare Your Crops",
    content: "With the monsoon season approaching, we've compiled essential market insights and price predictions. Learn which crops perform best during rainy season and how to optimize your farming strategy.",
    messageType: "market_insight",
    priority: "medium",
    emailSubject: "🌧️ Monsoon Market Insights - Optimize Your Farming Strategy",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🌧️ Monsoon Season Insights</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e40af;">Prepare Your Crops for Rainy Season</h2>
          <p>The monsoon season is approaching, and smart farmers are already preparing!</p>
          
          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">📈 Crops with High Monsoon Demand:</h3>
            <ul>
              <li><strong>Rice:</strong> Prices typically increase 15-20% during monsoon</li>
              <li><strong>Green Vegetables:</strong> Short supply drives prices up</li>
              <li><strong>Ginger & Turmeric:</strong> Peak demand season</li>
              <li><strong>Coconut:</strong> Steady demand for oil and fresh coconuts</li>
            </ul>
          </div>

          <div style="background-color: #fefce8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #ca8a04; margin-top: 0;">⚠️ Crops to Harvest Before Monsoon:</h3>
            <ul>
              <li>Tomatoes and other delicate vegetables</li>
              <li>Fruits that don't store well in humidity</li>
              <li>Leafy greens susceptible to fungal diseases</li>
            </ul>
          </div>

          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #16a34a; margin-top: 0;">💡 Monsoon Farming Tips:</h3>
            <ul>
              <li>Ensure proper drainage in your fields</li>
              <li>Stock up on fungicides and pesticides</li>
              <li>Consider greenhouse farming for high-value crops</li>
              <li>Plan storage facilities for harvested crops</li>
            </ul>
          </div>

          <p>Stay ahead of the market with AgriLink's weather-based farming insights!</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/demandforecast" 
               style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Detailed Forecasts
            </a>
          </p>
          <p>Best of luck this season!<br>AgriLink Analytics Team</p>
        </div>
      </div>
    `,
    targetAudience: { allSubscribers: false, priceAlertsOnly: false, marketNewsOnly: true, weeklyDigestOnly: true }
  },
  {
    title: "Limited Time: Premium SMS Alerts at 50% Discount",
    content: "For a limited time, upgrade to Premium SMS Alerts at 50% off. Get instant notifications for price changes, weather alerts, and market opportunities directly to your phone.",
    messageType: "special_offer",
    priority: "high",
    emailSubject: "🎉 50% OFF Premium SMS Alerts - Limited Time Offer!",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🎉 Limited Time Offer</h1>
          <div style="background-color: rgba(255,255,255,0.2); padding: 10px; border-radius: 6px; margin-top: 10px;">
            <span style="font-size: 18px; font-weight: bold;">50% OFF Premium SMS Alerts</span>
          </div>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #7c3aed;">Upgrade Your Farming Intelligence</h2>
          <p>Don't miss out on this exclusive offer for AgriLink subscribers!</p>
          
          <div style="background-color: #faf5ff; border: 2px dashed #7c3aed; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h3 style="color: #7c3aed; margin: 0 0 10px 0;">Premium SMS Alerts</h3>
            <div style="font-size: 24px; color: #dc2626; margin: 10px 0;">
              <span style="text-decoration: line-through;">Rs. 500/month</span>
              <span style="margin-left: 10px; color: #16a34a; font-weight: bold;">Rs. 250/month</span>
            </div>
            <p style="margin: 0; color: #7c3aed; font-weight: bold;">Save Rs. 250 every month!</p>
          </div>

          <h3 style="color: #7c3aed;">What You Get:</h3>
          <ul style="line-height: 1.8;">
            <li>📱 <strong>Instant Price Alerts:</strong> Real-time SMS when prices change</li>
            <li>🌧️ <strong>Weather Warnings:</strong> Severe weather alerts for your district</li>
            <li>📊 <strong>Market Opportunities:</strong> Notifications about high-demand crops</li>
            <li>🚛 <strong>Transport Alerts:</strong> When buyers are in your area</li>
            <li>💰 <strong>Profit Maximizer:</strong> Best time to sell recommendations</li>
          </ul>

          <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #dc2626; font-weight: bold;">⏰ Offer Valid Until: July 31, 2025</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/premium-upgrade" 
               style="background-color: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold;">
              Claim 50% Discount Now
            </a>
          </div>

          <p style="text-align: center; font-size: 14px; color: #6b7280;">
            Questions? Reply to this email or call us at 0117-123-456
          </p>
          <p>Happy Farming!<br>AgriLink Sales Team</p>
        </div>
      </div>
    `,
    targetAudience: { allSubscribers: true, priceAlertsOnly: false, marketNewsOnly: false, weeklyDigestOnly: false }
  },
  {
    title: "AgriLink Mobile App Beta Testing - Join Now",
    content: "Be among the first to test our new mobile app! Get early access to our iOS and Android app with exclusive features for mobile users. Limited spots available for beta testing.",
    messageType: "platform_notice",
    priority: "medium",
    emailSubject: "📱 Beta Test Our Mobile App - Limited Spots Available!",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">📱 Mobile App Beta Testing</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #059669;">Join Our Exclusive Beta Program</h2>
          <p>We're excited to invite you to test our brand new AgriLink mobile app!</p>
          
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">🚀 Exclusive Beta Features:</h3>
            <ul>
              <li><strong>Offline Price Data:</strong> Access prices without internet</li>
              <li><strong>Camera Price Scanner:</strong> Identify crops and get instant prices</li>
              <li><strong>GPS Market Finder:</strong> Find nearest markets and buyers</li>
              <li><strong>Voice Commands:</strong> Check prices using voice (Sinhala/Tamil)</li>
              <li><strong>Push Notifications:</strong> Instant alerts on your phone</li>
            </ul>
          </div>

          <div style="display: flex; gap: 20px; margin: 20px 0;">
            <div style="flex: 1; text-align: center; background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
              <div style="font-size: 30px; margin-bottom: 10px;">🍎</div>
              <p style="margin: 0; font-weight: bold;">iOS Beta</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">TestFlight Access</p>
            </div>
            <div style="flex: 1; text-align: center; background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
              <div style="font-size: 30px; margin-bottom: 10px;">🤖</div>
              <p style="margin: 0; font-weight: bold;">Android Beta</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">Play Console Access</p>
            </div>
          </div>

          <div style="background-color: #fefce8; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #ca8a04;"><strong>📋 Requirements:</strong></p>
            <ul style="margin: 10px 0 0 0; color: #ca8a04;">
              <li>Active AgriLink subscriber</li>
              <li>Smartphone with iOS 13+ or Android 8+</li>
              <li>Willingness to provide feedback</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/beta-signup" 
               style="background-color: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold;">
              Join Beta Program
            </a>
          </div>

          <p style="text-align: center; font-size: 14px; color: #dc2626; font-weight: bold;">
            Limited to first 100 applicants
          </p>
          <p>Thank you for being part of AgriLink's journey!<br>AgriLink Development Team</p>
        </div>
      </div>
    `,
    targetAudience: { allSubscribers: true, priceAlertsOnly: false, marketNewsOnly: false, weeklyDigestOnly: false }
  }
];

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Check if messages already exist to avoid duplicates
    const existingCount = await NewsletterMessage.countDocuments();
    
    if (existingCount > 0) {
      return NextResponse.json({
        message: 'Newsletter messages already exist in database',
        count: existingCount
      });
    }

    // Insert dummy messages
    const insertedMessages = await NewsletterMessage.insertMany(dummyMessages);

    return NextResponse.json({
      message: 'Successfully created dummy newsletter messages',
      count: insertedMessages.length,
      messages: insertedMessages.map(msg => ({
        id: msg._id,
        title: msg.title,
        messageType: msg.messageType,
        priority: msg.priority
      }))
    });

  } catch (error) {
    console.error('Error creating dummy messages:', error);
    return NextResponse.json(
      { error: 'Failed to create dummy newsletter messages' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const messageType = searchParams.get('type');
    const priority = searchParams.get('priority');
    const isActive = searchParams.get('active');

    let filter: any = {};
    
    if (messageType) filter.messageType = messageType;
    if (priority) filter.priority = priority;
    if (isActive !== null) filter.isActive = isActive === 'true';

    const messages = await NewsletterMessage.find(filter)
      .sort({ createdAt: -1 });

    return NextResponse.json({
      messages,
      count: messages.length
    });

  } catch (error) {
    console.error('Error fetching newsletter messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletter messages' },
      { status: 500 }
    );
  }
}
