import { NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '../../../lib/database';
import { User } from '../../../lib/models/User';

export async function GET(req: Request) {
  try {
    const client = await connectToDatabase();
    const db = getDatabase(client);
    const users = await db.collection('customers').find({}).toArray();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ users: [], error: 'Failed to fetch customers.' }, { status: 500 });
  }
}
