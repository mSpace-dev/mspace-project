import { NextRequest, NextResponse } from 'next/server';

// Mock SMS service
const sendSMS = async (phone: string, message: string) => {
  // In production, integrate with SMS service like Twilio, AWS SNS, or local SMS gateway
  console.log(`SMS to ${phone}: ${message}`);
  return { success: true, messageId: `msg_${Date.now()}` };
};

// POST /api/sms/send - Send SMS notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, message, type } = body;

    // Validate required fields
    if (!phone || !message) {
      return NextResponse.json(
        { success: false, error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Validate phone number
    const phoneRegex = /^\+94[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Send SMS
    const result = await sendSMS(phone, message);

    if (!result.success) {
      throw new Error('Failed to send SMS');
    }

    return NextResponse.json({
      success: true,
      data: {
        messageId: result.messageId,
        phone,
        message,
        type: type || 'notification',
        sentAt: new Date().toISOString()
      },
      message: 'SMS sent successfully'
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}

// POST /api/sms/send-alert - Send price alert SMS
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId, crop, currentPrice, threshold, condition, userPhone } = body;

    if (!alertId || !crop || !currentPrice || !threshold || !condition || !userPhone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format alert message
    let message = `🔔 AgriLink Alert\n`;
    message += `${crop} price: Rs.${currentPrice}/kg\n`;
    
    if (condition === 'above') {
      message += `Price is above your threshold of Rs.${threshold}/kg\n`;
    } else if (condition === 'below') {
      message += `Price is below your threshold of Rs.${threshold}/kg\n`;
    } else {
      message += `Significant price change detected\n`;
    }
    
    message += `Time: ${new Date().toLocaleString('en-LK')}\n`;
    message += `Reply STOP to unsubscribe`;

    // Send SMS
    const result = await sendSMS(userPhone, message);

    if (!result.success) {
      throw new Error('Failed to send alert SMS');
    }

    return NextResponse.json({
      success: true,
      data: {
        alertId,
        messageId: result.messageId,
        phone: userPhone,
        message,
        sentAt: new Date().toISOString()
      },
      message: 'Alert SMS sent successfully'
    });
  } catch (error) {
    console.error('Error sending alert SMS:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send alert SMS' },
      { status: 500 }
    );
  }
}
