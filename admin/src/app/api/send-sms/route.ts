import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/database';
import axios from 'axios';

const MOBITEL_API_URL = process.env.MOBITEL_API_URL || 'https://api.mspace.lk/sms/send';
const MOBITEL_APP_ID = process.env.MOBITEL_APP_ID || 'APP_009085';
const MOBITEL_PASSWORD = process.env.MOBITEL_PASSWORD || 'password';
const MOBITEL_SOURCE_ADDRESS = process.env.MOBITEL_SOURCE_ADDRESS || '77011';

export async function POST(request: NextRequest) {
  try {
    const { recipients, message, category } = await request.json();

    console.log('SMS Request:', { recipients, message, category });

    // Connect to MongoDB
    const client = await connectToDatabase();
    const db = getDatabase(client);

    // Get recipients based on category or specific phone numbers
    let phoneNumbers: string[] = [];

    if (category === 'all') {
      const customers = await db.collection('customers').find({}, { projection: { phone: 1 } }).toArray();
      phoneNumbers = customers.map(c => c.phone).filter(Boolean);
    } else if (category) {
      const customers = await db.collection('customers').find({ category }, { projection: { phone: 1 } }).toArray();
      phoneNumbers = customers.map(c => c.phone).filter(Boolean);
    } else if (recipients && Array.isArray(recipients)) {
      phoneNumbers = recipients;
    }

    console.log('Phone numbers to send to:', phoneNumbers);

    if (phoneNumbers.length === 0) {
      return NextResponse.json({ error: 'No recipients found' }, { status: 400 });
    }

    // Send SMS to each recipient
    const results = [];
    for (const phone of phoneNumbers) {
      try {
        console.log(`Sending SMS to ${phone}...`);

        // Format phone number for Mobitel API (ensure it starts with country code)
        const formattedPhone = phone.startsWith('+94') ? phone.substring(1) :
                              phone.startsWith('94') ? phone :
                              phone.startsWith('0') ? '94' + phone.substring(1) :
                              '94' + phone;

        // Use the exact Mobitel API payload format from documentation
        const payload = {
          version: "1.0",
          applicationId: MOBITEL_APP_ID,
          password: MOBITEL_PASSWORD,
          message: message,
          destinationAddresses: [`tel:${formattedPhone}`],
          sourceAddress: MOBITEL_SOURCE_ADDRESS,
          deliveryStatusRequest: "1",
          encoding: "245",
          binaryHeader: "526574697265206170706c69636174696f6e20616e642072656c6561736520524b7320696620666f756e642065787069726564"
        };

        console.log('Mobitel API Payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post(MOBITEL_API_URL, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000
        });

        console.log('Mobitel API Response:', response.data);

        results.push({
          phone,
          status: 'sent',
          messageId: response.data?.messageId || response.data?.requestId || 'unknown',
          response: response.data
        });

        // Log the SMS in database
        await db.collection('sms_logs').insertOne({
          phone,
          message,
          status: 'sent',
          sentAt: new Date(),
          category: category || 'custom',
          apiResponse: response.data,
          formattedPhone,
          payload
        });

      } catch (error) {
        const err = error as { response?: { data?: { message?: string } }; message?: string; toString: () => string };
        console.error(`Failed to send SMS to ${phone}:`, err.response?.data || err.message);

        results.push({
          phone,
          status: 'failed',
          error: err.response?.data?.message || err.response?.data || err.message,
          fullError: err.toString()
        });

        // Log failed SMS
        await db.collection('sms_logs').insertOne({
          phone,
          message,
          status: 'failed',
          error: err.message,
          sentAt: new Date(),
          category: category || 'custom',
          apiResponse: err.response?.data
        });
      }
    }

    const sentCount = results.filter(r => r.status === 'sent').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    console.log(`SMS Results: ${sentCount} sent, ${failedCount} failed`);

    return NextResponse.json({
      success: sentCount > 0,
      message: `SMS sent to ${sentCount} recipients, ${failedCount} failed`,
      results,
      totalRecipients: phoneNumbers.length
    });

  } catch (error) {
    const err = error as { message?: string };
    console.error('SMS sending error:', err);
    return NextResponse.json({
      error: 'Failed to send SMS',
      details: err?.message || 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to fetch SMS logs
export async function GET() {
  try {
    const client = await connectToDatabase();
    const db = getDatabase(client);

    const logs = await db.collection('sms_logs')
      .find({})
      .sort({ sentAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Failed to fetch SMS logs:', error);
    return NextResponse.json({ error: 'Failed to fetch SMS logs' }, { status: 500 });
  }
}
