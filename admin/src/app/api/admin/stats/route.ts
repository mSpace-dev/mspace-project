import { NextResponse } from "next/server";

export async function GET() {
  // Replace with real DB queries
  return NextResponse.json({
    totalUsers: 1200,
    smsSentToday: 340,
    recentAlerts: 5,
    nextSms: "6:00 AM",
  });
}