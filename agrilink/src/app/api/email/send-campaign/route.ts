import { NextRequest, NextResponse } from 'next/server';
import { sendBulkCustomEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const { subject, message } = await request.json();

    // Validate input
    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    if (subject.trim().length === 0 || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Subject and message cannot be empty' },
        { status: 400 }
      );
    }

    // Send the email campaign
    const sentCount = await sendBulkCustomEmail(subject.trim(), message.trim());

    if (sentCount === 0) {
      return NextResponse.json(
        { error: 'No subscribers found or email service is not configured' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      sentCount,
      message: `Email campaign sent successfully to ${sentCount} subscribers`
    });

  } catch (error) {
    console.error('Email campaign API error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please check email configuration.' },
      { status: 500 }
    );
  }
}
