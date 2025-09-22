import { NextResponse } from 'next/server';

// In-memory store for received notifications (replace with DB in production)
type Notification = { receivedAt: string; data: String | object };
let notifications: Notification[] = [];

// Handle POST requests from Mobitel mSpace (notification delivery)
export async function POST(req: Request) {
	try {
		const contentType = req.headers.get('content-type');
		let data;
		if (contentType && contentType.includes('application/json')) {
			data = await req.json();
		} else {
			// For XML or form submissions, parse as text
			data = await req.text();
		}
		// Store notification (raw for now)
		notifications.push({ receivedAt: new Date().toISOString(), data });
		return NextResponse.json({ status: 'success', message: 'Notification received' });
	} catch (error) {
		return NextResponse.json({ status: 'error', message: error?.toString() }, { status: 500 });
	}
}

// Handle GET requests to view received notifications
export async function GET() {
	return NextResponse.json({ notifications });
}
