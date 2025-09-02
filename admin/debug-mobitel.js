// Debug script to test Mobitel API directly with correct format
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Mobitel API credentials (from environment variables)
const MOBITEL_APP_ID = process.env.MOBITEL_APP_ID || 'APP_009085';
const MOBITEL_API_KEY = process.env.MOBITEL_API_KEY || '7e82020d76d946ddef1fb0c0ead4d082';
const MOBITEL_PASSWORD = process.env.MOBITEL_PASSWORD || '7e82020d76d946ddef1fb0c0ead4d082'; // Use API key as password
const MOBITEL_SOURCE_ADDRESS = process.env.MOBITEL_SOURCE_ADDRESS || '77011';

// Correct Mobitel API endpoint
const MOBITEL_API_URL = process.env.MOBITEL_API_URL || 'https://api.mspace.lk/sms/send';

const TEST_PHONE = '94710988816'; // Replace with your actual number (format: 947xxxxxxxx)
const TEST_MESSAGE = '🧪 Debug Test SMS from AgriLink API - Testing Mobitel Mspace API';

async function testMobitelAPI() {
  console.log('🔍 Testing Mobitel API with approved credentials...');
  console.log('Application ID:', MOBITEL_APP_ID);
  console.log('API Key:', MOBITEL_API_KEY ? 'Present' : 'Missing');
  console.log('Source Address:', MOBITEL_SOURCE_ADDRESS);
  // Format phone number for Mobitel API (ensure it starts with country code)
  const formattedPhone = TEST_PHONE.startsWith('+94') ? TEST_PHONE.substring(1) :
                        TEST_PHONE.startsWith('94') ? TEST_PHONE :
                        TEST_PHONE.startsWith('0') ? '94' + TEST_PHONE.substring(1) :
                        '94' + TEST_PHONE;

  console.log('📞 Formatted phone:', formattedPhone);
  console.log('---');

  // Try different Mobitel API formats
  const formats = [
    {
      name: 'Format 1: API Key as Password',
      payload: {
        version: "1.0",
        applicationId: MOBITEL_APP_ID,
        password: MOBITEL_API_KEY,
        message: TEST_MESSAGE,
        destinationAddresses: [`tel:${formattedPhone}`],
        sourceAddress: MOBITEL_SOURCE_ADDRESS,
        deliveryStatusRequest: "1",
        encoding: "245",
        binaryHeader: "526574697265206170706c69636174696f6e20616e642072656c6561736520524b7320696620666f756e642065787069726564"
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    },
    {
      name: 'Format 2: Authorization Header',
      payload: {
        version: "1.0",
        applicationId: MOBITEL_APP_ID,
        message: TEST_MESSAGE,
        destinationAddresses: [`tel:${formattedPhone}`],
        sourceAddress: MOBITEL_SOURCE_ADDRESS,
        deliveryStatusRequest: "1",
        encoding: "245"
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${MOBITEL_API_KEY}`
      }
    },
    {
      name: 'Format 3: API Key Header',
      payload: {
        to: formattedPhone,
        message: TEST_MESSAGE,
        from: MOBITEL_SOURCE_ADDRESS
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'apikey': MOBITEL_API_KEY
      }
    }
  ];

  for (const format of formats) {
    try {
      console.log(`\n🌐 Testing ${format.name}...`);
      console.log(`📤 Payload:`, JSON.stringify(format.payload, null, 2));

      const response = await axios.post(MOBITEL_API_URL, format.payload, {
        headers: format.headers,
        timeout: 30000
      });

      console.log('✅ SUCCESS!');
      console.log('📨 Response:', JSON.stringify(response.data, null, 2));
      console.log(`🎉 ${format.name} is working correctly!`);

      return { success: true, format: format.name, response: response.data };

    } catch (error) {
      console.log(`❌ ${format.name} failed!`);
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data || error.message);
    }
  }

  console.log('\n❌ All formats failed!');
  console.log('💡 Possible issues:');
  console.log('1. SMS subscription not activated (send REG agrilink to 77011)');
  console.log('2. Insufficient SMS credits');
  console.log('3. Phone number not whitelisted for testing');
  console.log('4. API service temporarily down');

  return { success: false, error: 'All formats failed' };
}

// Run the test
testMobitelAPI().catch(console.error);
