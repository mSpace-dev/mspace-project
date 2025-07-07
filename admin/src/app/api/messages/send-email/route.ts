import { NextRequest, NextResponse } from 'next/server';
import { sendBulkCustomEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const { subject, message, recipient } = await request.json();

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { error: 'Email subject is required' },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Email message is required' },
        { status: 400 }
      );
    }

    let sentCount = 0;

    if (recipient === 'specific') {
      // For specific email sending, you would implement single email sending
      return NextResponse.json(
        { error: 'Specific email sending not implemented yet' },
        { status: 400 }
      );
    } else {
      // Send to all subscribers
      sentCount = await sendBulkCustomEmail(subject.trim(), message.trim());
    }

    if (sentCount === 0) {
      return NextResponse.json(
        { error: 'No subscribers found or email service not configured' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      sentCount,
      message: `Email sent successfully to ${sentCount} recipients`
    });

  } catch (error) {
    console.error('Send Email API error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
