import type { NextApiRequest, NextApiResponse } from 'next';
import {dbConnect} from '../../../lib/dbConnect';
import { Subscription } from '../../../lib/models/Subscription';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).end();
  await dbConnect();

  const { userId, type } = req.query;
  if (typeof userId !== 'string' || typeof type !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing userId or type' });
  }

  await Subscription.findOneAndUpdate({ userId, type }, { isActive: false });

  return res.json({ success: true });
}