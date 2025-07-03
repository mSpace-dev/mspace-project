import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message } = await request.json();

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'To, subject, and message are required' },
        { status: 400 }
      );
    }

    // For now, just return mock success
    return NextResponse.json({
      success: true,
      message: 'Test email would be sent successfully (email service not configured yet)',
      sentTo: to,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test email failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      emailConfigured: false,
      error: 'Email service not configured yet',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'not set',
        EMAIL_USER: process.env.EMAIL_USER ? '***configured***' : 'not set',
        EMAIL_PASS: process.env.EMAIL_PASS ? '***configured***' : 'not set'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Email configuration check error:', error);
    return NextResponse.json({
      emailConfigured: false,
      error: error instanceof Error ? error.message : 'Configuration check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
