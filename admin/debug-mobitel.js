// Debug script to test Mobitel API directly with correct format
const axios = require('axios');

// Mobitel API credentials (from your documentation)
const MOBITEL_APP_ID = 'APP_009085';
const MOBITEL_PASSWORD = 'password'; // Replace with actual password
const MOBITEL_SOURCE_ADDRESS = '77011';

// Correct Mobitel API endpoint
const MOBITEL_API_URL = 'https://api.mspace.lk/sms/send';

const TEST_PHONE = '94702029244'; // Replace with your actual number (format: 947xxxxxxxx)
const TEST_MESSAGE = '🧪 Debug Test SMS from AgriLink API - Testing Mobitel Mspace API';

async function testMobitelAPI() {
  console.log('🔍 Testing Mobitel API with correct format...');
  console.log('Application ID:', MOBITEL_APP_ID);
  console.log('Password:', MOBITEL_PASSWORD ? 'Present' : 'Missing');
  console.log('Source Address:', MOBITEL_SOURCE_ADDRESS);
  console.log('Phone:', TEST_PHONE);
  console.log('Message:', TEST_MESSAGE);
  console.log('---');

  try {
    console.log(`🌐 Sending to: ${MOBITEL_API_URL}`);

    // Format phone number for Mobitel API (ensure it starts with country code)
    const formattedPhone = TEST_PHONE.startsWith('+94') ? TEST_PHONE.substring(1) :
                          TEST_PHONE.startsWith('94') ? TEST_PHONE :
                          TEST_PHONE.startsWith('0') ? '94' + TEST_PHONE.substring(1) :
                          '94' + TEST_PHONE;

    console.log('📞 Formatted phone:', formattedPhone);

    // Use the exact Mobitel API payload format from documentation
    const payload = {
      version: "1.0",
      applicationId: MOBITEL_APP_ID,
      password: MOBITEL_PASSWORD,
      message: TEST_MESSAGE,
      destinationAddresses: [`tel:${formattedPhone}`],
      sourceAddress: MOBITEL_SOURCE_ADDRESS,
      deliveryStatusRequest: "1",
      encoding: "245",
      binaryHeader: "526574697265206170706c69636174696f6e20616e642072656c6561736520524b7320696620666f756e642065787069726564"
    };

    console.log('📤 Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(MOBITEL_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ SUCCESS!');
    console.log('📨 Response:', JSON.stringify(response.data, null, 2));
    console.log('🎉 Mobitel API is working correctly!');

    return { success: true, response: response.data };

  } catch (error) {
    console.log('❌ Request failed!');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error Response:', error.response?.data);
    console.log('Error Message:', error.message);

    console.log('');
    console.log('❌ Possible issues:');
    console.log('1. Incorrect applicationId or password');
    console.log('2. Invalid phone number format');
    console.log('3. Insufficient SMS credits');
    console.log('4. Mobitel API service temporarily down');
    console.log('5. Network/firewall blocking the request');

    console.log('');
    console.log('💡 Suggestions:');
    console.log('- Verify your applicationId and password in Mobitel Mspace dashboard');
    console.log('- Ensure phone number is in format: 947xxxxxxxx');
    console.log('- Check your account has sufficient credits');
    console.log('- Try again later if service is temporarily down');

    return { success: false, error: error.response?.data || error.message };
  }
}

// Run the test
testMobitelAPI().catch(console.error);
