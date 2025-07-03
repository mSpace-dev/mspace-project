import {dbConnect} from '../lib/dbConnect';
import { Subscription } from '../lib/models/Subscription';

async function sendSMS(to: string, message: string) {
  const username = process.env.MSPACE_USERNAME!;
  const password = process.env.MSPACE_PASSWORD!;
  const apiUrl = 'https://tap.mspace.lk/tapsendsms/bulksms';

  const body = new URLSearchParams({
    msisdn: to.replace('+', ''),
    message,
    senderId: 'AGRILINK',
    username,
    password,
  });

  // Node 18+ offers fetch globally
  const resp = await fetch(apiUrl, { method: 'POST', body });
  return resp.text();
}

async function run() {
  await dbConnect();
  const subs = await Subscription.find({ isActive: true, type: 'daily' });

  for (const s of subs) {
    // fetch today's price for crop & location from your prices service
    const price = 100.0; // placeholder
    const msg = `Today the price of ${s.crops.join(", ")} in ${s.location} is Rs.${price}`;
    // Use each subscriber's phone number stored in a field (e.g. s.phone)
    await sendSMS(s.location /* replace with s.phone field */, msg);
  }

  process.exit(0);
}

run().catch(console.error);
