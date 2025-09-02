import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/database';
import axios from 'axios';

const MOBITEL_API_URL = process.env.MOBITEL_API_URL || 'https://api.mspace.lk/sms/send';
const MOBITEL_API_KEY = process.env.MOBITEL_API_KEY || '7e82020d76d946ddef1fb0c0ead4d082';
const MOBITEL_APP_ID = process.env.MOBITEL_APP_ID || 'APP_009085';
const MOBITEL_PASSWORD = process.env.MOBITEL_PASSWORD || '7e82020d76d946ddef1fb0c0ead4d082';
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

        // Try different Mobitel API formats since the application is now approved
        let response;
        let success = false;

        // Format 1: Standard Mobitel format with API key as password
        try {
          console.log('Trying Format 1: API key as password...');
          const payload1 = {
            version: "1.0",
            applicationId: MOBITEL_APP_ID,
            password: MOBITEL_API_KEY,
            message: message,
            destinationAddresses: [`tel:${formattedPhone}`],
            sourceAddress: MOBITEL_SOURCE_ADDRESS,
            deliveryStatusRequest: "1",
            encoding: "245",
            binaryHeader: "526574697265206170706c69636174696f6e20616e642072656c6561736520524b7320696620666f756e642065787069726564"
          };

          response = await axios.post(MOBITEL_API_URL, payload1, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 30000
          });
          success = true;
          console.log('Format 1 succeeded!');
        } catch (error1) {
          console.log('Format 1 failed, trying Format 2...');

          // Format 2: With Authorization header
          try {
            console.log('Trying Format 2: Authorization header...');
            const payload2 = {
              version: "1.0",
              applicationId: MOBITEL_APP_ID,
              message: message,
              destinationAddresses: [`tel:${formattedPhone}`],
              sourceAddress: MOBITEL_SOURCE_ADDRESS,
              deliveryStatusRequest: "1",
              encoding: "245"
            };

            response = await axios.post(MOBITEL_API_URL, payload2, {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${MOBITEL_API_KEY}`
              },
              timeout: 30000
            });
            success = true;
            console.log('Format 2 succeeded!');
          } catch (error2) {
            console.log('Format 2 failed, trying Format 3...');

            // Format 3: API key in header with different format
            try {
              console.log('Trying Format 3: API key in header...');
              const payload3 = {
                to: formattedPhone,
                message: message,
                from: MOBITEL_SOURCE_ADDRESS
              };

              response = await axios.post(MOBITEL_API_URL, payload3, {
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'apikey': MOBITEL_API_KEY
                },
                timeout: 30000
              });
              success = true;
              console.log('Format 3 succeeded!');
            } catch (error3) {
              console.log('All formats failed, throwing last error...');
              throw error3;
            }
          }
        }

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
          payload: success ? (response.config.data ? JSON.parse(response.config.data) : null) : null
        });

      } catch (error: any) {
        console.error(`Failed to send SMS to ${phone}:`, error.response?.data || error.message);

        results.push({
          phone,
          status: 'failed',
          error: error.response?.data?.message || error.response?.data || error.message,
          fullError: error.toString()
        });

        // Log failed SMS
        await db.collection('sms_logs').insertOne({
          phone,
          message,
          status: 'failed',
          error: error.message,
          sentAt: new Date(),
          category: category || 'custom',
          apiResponse: error.response?.data
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

  } catch (error: any) {
    console.error('SMS sending error:', error);
    return NextResponse.json({
      error: 'Failed to send SMS',
      details: error.message
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
