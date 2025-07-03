import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '../../../lib/dbConnect';
import { Subscription } from '../../../lib/models/Subscription';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  await dbConnect();

  const { userId, type, options } = req.body;
  if (!userId || !type || !options?.crops?.length || !options?.location) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  // Upsert subscription
  const sub = await Subscription.findOneAndUpdate(
    { userId, type },
    { ...options, isActive: true },
    { upsert: true, new: true }
  );

  return res.status(201).json({ success: true, data: sub });
}

