// src/app/api/health/route.ts
import { NextResponse } from "next/server";

// Respond to GET /api/health
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
