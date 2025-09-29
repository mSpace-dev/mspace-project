// Test script to send SMS to your Mobitel number
// Run this in browser console or as a separate Node.js script

const testSMS = async () => {
  const yourPhoneNumber = "0771234567"; // Replace with your actual Mobitel number

  const response = await fetch('http://localhost:3000/api/send-sms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipients: [yourPhoneNumber],
      message: "🧪 Test SMS from AgriLink Admin Dashboard! Your API integration is working correctly.",
      category: "custom"
    }),
  });

  const result = await response.json();
  console.log('SMS Test Result:', result);

  if (result.success) {
    console.log('✅ SMS sent successfully!');
    console.log('📱 Check your phone for the test message');
  } else {
    console.error('❌ SMS failed:', result.error);
  }

  return result;
};

// Run the test
testSMS();
