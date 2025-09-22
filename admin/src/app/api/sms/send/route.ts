// File: admin/src/app/api/send-test-sms/route.ts
import { NextRequest, NextResponse } from 'next/server';

const MOBITEL_API_URL = 'https://api.mspace.lk/sms/send';
const TEST_API_KEY = process.env.MSPACE_API_KEY || '';
const WHITELISTED_NUMBERS = ['tel:94702029244']; // Add your Mobitel test numbers here

export async function POST(req: NextRequest) {
  try {
const mobitelPayload = await req.json();
// Optionally validate required Mobitel fields here
const { destinationAddresses, message } = mobitelPayload;

// if (!WHITELISTED_NUMBERS.includes(destinationAddresses)) {
//   return NextResponse.json({ error: 'Number not whitelisted for testing' }, { status: 403 });
// }
const payload = {
  apiKey: TEST_API_KEY,
  recipient: destinationAddresses,
  message,
  // Add other required Mobitel fields here
};
    const mobitelRes = await fetch(MOBITEL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const mobitelText = await mobitelRes.text();
    // Optionally parse XML here if needed
    return NextResponse.json({ raw: mobitelText }, { status: mobitelRes.status });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send SMS', details: String(err) }, { status: 500 });
  }
}
