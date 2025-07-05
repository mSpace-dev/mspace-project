import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const envCheck = {
    SMTP_HOST: process.env.SMTP_HOST ? '✅ Set' : '❌ Missing',
    SMTP_PORT: process.env.SMTP_PORT ? '✅ Set' : '❌ Missing',
    SMTP_USER: process.env.SMTP_USER ? '✅ Set' : '❌ Missing',
    SMTP_PASS: process.env.SMTP_PASS ? '✅ Set' : '❌ Missing',
    MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ? '✅ Set' : '❌ Missing',
  };

  return NextResponse.json({
    message: 'Environment Variable Check',
    variables: envCheck,
    note: 'If any show ❌ Missing, check your .env.local file'
  });
}
