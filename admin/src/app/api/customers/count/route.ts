import { NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/database';

export async function GET() {
  try {
    const client = await connectToDatabase();
    const db = getDatabase(client);

    // Get total customer count
    const totalCustomers = await db.collection('customers').countDocuments();

    return NextResponse.json({ count: totalCustomers });
  } catch (error) {
    console.error('Failed to fetch customer count:', error);
    return NextResponse.json({ error: 'Failed to fetch customer count' }, { status: 500 });
  }
}
