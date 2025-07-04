import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { sendWelcomeEmail, sendPriceAlert, emailTemplates, sendEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { type, email, data } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Testing email send to:', email, 'Type:', type || 'simple-test');

    let result = false;

    switch (type || 'simple') {
      case 'simple':
        // Simple test email
        const testTemplate = {
          subject: 'AgriLink Email Test 📧',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #16a34a;">Email Test Successful! 🎉</h1>
              <p>This is a test email from AgriLink to verify that email functionality is working correctly.</p>
              <p><strong>Test Details:</strong></p>
              <ul>
                <li>Sent at: ${new Date().toLocaleString()}</li>
                <li>To: ${email}</li>
                <li>Service: AgriLink Email Service</li>
              </ul>
              <p>If you received this email, your email configuration is working properly!</p>
            </div>
          `,
          text: `Email Test Successful! This is a test email from AgriLink. Sent at: ${new Date().toLocaleString()}`
        };
        result = await sendEmail(email, testTemplate);
        break;

      case 'welcome':
        result = await sendWelcomeEmail(email, 'test-token-123');
        break;

      case 'price_alert':
        const priceData = data || {
          product: 'Rice',
          price: 250,
          location: 'Colombo',
          change: 5.2
        };
        result = await sendPriceAlert(email, priceData);
        break;

      case 'test_connection':
        // Just test email configuration without sending
        return NextResponse.json({
          message: 'Email service configuration test',
          config: {
            host: process.env.SMTP_HOST || 'Not configured',
            port: process.env.SMTP_PORT || 'Not configured',
            user: process.env.SMTP_USER ? 'Configured' : 'Not configured',
            pass: process.env.SMTP_PASS ? 'Configured' : 'Not configured',
          }
        });

      default:
        // Default to simple test
        const defaultTemplate = {
          subject: 'AgriLink Email Test 📧',
          html: `<h1>Email Test</h1><p>This is a test email from AgriLink sent at ${new Date().toLocaleString()}</p>`,
          text: `Email Test - This is a test email from AgriLink sent at ${new Date().toLocaleString()}`
        };
        result = await sendEmail(email, defaultTemplate);
        break;
    }

    return NextResponse.json({
      message: `Test email sent successfully`,
      success: result,
      type,
      email
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Failed to send test email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email test endpoint is ready',
    instructions: 'Send a POST request with {"email": "your-email@example.com", "type": "simple"} to test email functionality',
    available_types: ['simple', 'welcome', 'price_alert', 'test_connection'],
    configuration: {
      smtp_host: process.env.SMTP_HOST || 'Not set',
      smtp_port: process.env.SMTP_PORT || 'Not set',
      smtp_user: process.env.SMTP_USER ? 'Set' : 'Not set',
      smtp_pass: process.env.SMTP_PASS ? 'Set' : 'Not set',
    }
  });
}
