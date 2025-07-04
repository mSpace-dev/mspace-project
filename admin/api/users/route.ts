import { NextResponse } from "next/server";

export async function GET() {
  // Replace with real DB queries
  return NextResponse.json({
    users: [
      { id: 1, name: "Kamal", phone: "0771234567", district: "Colombo", crops: ["Rice", "Onion"] },
      { id: 2, name: "Sunil", phone: "0779876543", district: "Kandy", crops: ["Coconut"] },
    ],
  });
}