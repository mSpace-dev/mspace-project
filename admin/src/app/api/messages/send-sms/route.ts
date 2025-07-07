import { NextRequest, NextResponse } from 'next/server';

// Mock SMS service - replace with actual SMS provider
const sendSMS = async (phone: string, message: string) => {
  // Simulate SMS sending
  console.log(`SMS to ${phone}: ${message}`);
  
  // In production, integrate with SMS providers like:
  // - MSpace (for Sri Lanka)
  // - Twilio
  // - AWS SNS
  // - Local SMS gateways
  
  return { 
    success: true, 
    messageId: `sms_${Date.now()}`,
    cost: 0.05 // Cost per SMS
  };
};

export async function POST(request: NextRequest) {
  try {
    const { message, recipient, phoneNumber } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    if (message.length > 160) {
      return NextResponse.json(
        { error: 'SMS message cannot exceed 160 characters' },
        { status: 400 }
      );
    }

    let sentCount = 0;
    let failedCount = 0;
    const results = [];

    if (recipient === 'specific') {
      if (!phoneNumber) {
        return NextResponse.json(
          { error: 'Phone number is required for specific SMS' },
          { status: 400 }
        );
      }

      // Validate phone number format
      const phoneRegex = /^\+94[0-9]{9}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return NextResponse.json(
          { error: 'Invalid phone number format. Use +94XXXXXXXXX' },
          { status: 400 }
        );
      }

      try {
        const result = await sendSMS(phoneNumber, message);
        if (result.success) {
          sentCount = 1;
          results.push({ phone: phoneNumber, status: 'sent', messageId: result.messageId });
        } else {
          failedCount = 1;
          results.push({ phone: phoneNumber, status: 'failed' });
        }
      } catch (error) {
        failedCount = 1;
        results.push({ 
          phone: phoneNumber, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    } else {
      // Bulk SMS sending
      // Mock phone numbers - replace with actual user database
      const phoneNumbers = [
        '+94771234567',
        '+94701234567',
        '+94781234567',
        '+94721234567',
        '+94761234567'
      ];

      for (const phone of phoneNumbers) {
        try {
          const result = await sendSMS(phone, message);
          if (result.success) {
            sentCount++;
            results.push({ phone, status: 'sent', messageId: result.messageId });
          } else {
            failedCount++;
            results.push({ phone, status: 'failed' });
          }
          
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          failedCount++;
          results.push({ 
            phone, 
            status: 'failed', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }
    }

    return NextResponse.json({
      success: sentCount > 0,
      sentCount,
      failedCount,
      totalAttempted: sentCount + failedCount,
      results,
      message: `SMS sent to ${sentCount} recipients${failedCount > 0 ? `, ${failedCount} failed` : ''}`
    });

  } catch (error) {
    console.error('Send SMS API error:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}
