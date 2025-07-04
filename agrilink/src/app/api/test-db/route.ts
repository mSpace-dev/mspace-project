import { NextResponse } from "next/server";

export async function GET() {
  // fetch from DB
  return NextResponse.json({ data: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  // write to DB
  return NextResponse.json({ created: true }, { status: 201 });
}
