import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail, sendPriceAlert, sendEmail } from '@/lib/emailService';

// POST /test/api/email - Test email functionality
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, email, data } = body;

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email address is required'
      }, { status: 400 });
    }

    console.log('Testing email send to:', email, 'Type:', type || 'simple');

    let result = false;
    let emailDetails = {};

    switch (type || 'simple') {
      case 'simple':
        // Simple test email
        const testTemplate = {
          subject: 'AgriLink Email Test 📧',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #16a34a;">Email Test Successful! 🎉</h1>
              <p>This is a test email from your AgriLink application.</p>
              <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3>Test Details:</h3>
                <ul>
                  <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
                  <li><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</li>
                  <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST || 'Not configured'}</li>
                </ul>
              </div>
              <p>If you received this email, your email configuration is working correctly!</p>
            </div>
          `,
          text: `AgriLink Email Test - Email Test Successful! This is a test email from your AgriLink application. Test Details: Timestamp: ${new Date().toLocaleString()}, Environment: ${process.env.NODE_ENV || 'development'}, SMTP Host: ${process.env.SMTP_HOST || 'Not configured'}. If you received this email, your email configuration is working correctly!`
        };
        result = await sendEmail(email, testTemplate);
        emailDetails = { type: 'simple', template: 'test' };
        break;

      case 'welcome':
        // Test welcome email
        result = await sendWelcomeEmail(email, data?.name || 'Test User');
        emailDetails = { type: 'welcome', template: 'welcome' };
        break;

      case 'price-alert':
        // Test price alert email
        const alertData = data || {
          crops: [
            { name: 'Rice', currentPrice: 85.50, threshold: 80.00, market: 'Pettah' },
            { name: 'Coconut', currentPrice: 65.00, threshold: 60.00, market: 'Keells' }
          ]
        };
        result = await sendPriceAlert(email, alertData.crops);
        emailDetails = { type: 'price-alert', template: 'price-alert' };
        break;

      case 'newsletter':
        // Test newsletter email
        const newsletterTemplate = {
          subject: 'AgriLink Newsletter - Test Edition 📊',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <header style="background: linear-gradient(135deg, #16a34a, #2563eb); color: white; padding: 30px; text-align: center;">
                <h1>AgriLink Newsletter</h1>
                <p>Market Updates & Agricultural Insights</p>
              </header>
              <div style="padding: 20px;">
                <h2>This Week's Highlights</h2>
                <ul>
                  <li>Rice prices increased by 3% in Colombo markets</li>
                  <li>New organic certification program launched</li>
                  <li>Weather forecast: Favorable conditions for vegetable farming</li>
                </ul>
                <p><em>This is a test newsletter email.</em></p>
              </div>
            </div>
          `,
          text: `AgriLink Newsletter - Test Edition. Market Updates & Agricultural Insights. This Week's Highlights: Rice prices increased by 3% in Colombo markets, New organic certification program launched, Weather forecast: Favorable conditions for vegetable farming. This is a test newsletter email.`
        };
        result = await sendEmail(email, newsletterTemplate);
        emailDetails = { type: 'newsletter', template: 'newsletter' };
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid email type. Available types: simple, welcome, price-alert, newsletter'
        }, { status: 400 });
    }

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        data: {
          recipient: email,
          ...emailDetails,
          sentAt: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to send test email',
        error: 'Email delivery failed'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Email test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /test/api/email - Get email configuration status
export async function GET() {
  try {
    const emailConfig = {
      SMTP_HOST: process.env.SMTP_HOST ? '✅ Configured' : '❌ Missing',
      SMTP_PORT: process.env.SMTP_PORT ? '✅ Configured' : '❌ Missing',
      SMTP_USER: process.env.SMTP_USER ? '✅ Configured' : '❌ Missing',
      SMTP_PASS: process.env.SMTP_PASS ? '✅ Configured' : '❌ Missing',
      FROM_EMAIL: process.env.SMTP_FROM_EMAIL ? '✅ Configured' : '❌ Missing'
    };

    const isFullyConfigured = Object.values(emailConfig).every(status => status.includes('✅'));

    return NextResponse.json({
      success: true,
      message: 'Email configuration check completed',
      data: {
        configuration: emailConfig,
        status: isFullyConfigured ? 'Ready' : 'Incomplete',
        availableTests: ['simple', 'welcome', 'price-alert', 'newsletter']
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Email configuration check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
