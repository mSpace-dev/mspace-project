import { NextRequest, NextResponse } from 'next/server';

// GET /test/api/environment - Check environment variables and configuration
export async function GET() {
  try {
    const envVariables = {
      // Database Configuration
      MONGODB_URI: process.env.MONGODB_URI ? '✅ Configured' : '❌ Missing',
      
      // Email Configuration
      SMTP_HOST: process.env.SMTP_HOST ? '✅ Configured' : '❌ Missing',
      SMTP_PORT: process.env.SMTP_PORT ? '✅ Configured' : '❌ Missing',
      SMTP_USER: process.env.SMTP_USER ? '✅ Configured' : '❌ Missing',
      SMTP_PASS: process.env.SMTP_PASS ? '✅ Configured' : '❌ Missing',
      SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL ? '✅ Configured' : '❌ Missing',
      
      // Application Configuration
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ? '✅ Configured' : '❌ Missing',
      NODE_ENV: process.env.NODE_ENV || 'development',
      
      // JWT Configuration
      JWT_SECRET: process.env.JWT_SECRET ? '✅ Configured' : '❌ Missing',
      
      // NextAuth Configuration
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Configured' : '❌ Missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✅ Configured' : '❌ Missing',
    };

    // Count configured vs missing variables
    const configuredCount = Object.values(envVariables).filter(status => 
      typeof status === 'string' && status.includes('✅')
    ).length;
    const totalCount = Object.keys(envVariables).length - 1; // Exclude NODE_ENV from count
    const missingVariables = Object.entries(envVariables)
      .filter(([key, value]) => key !== 'NODE_ENV' && typeof value === 'string' && value.includes('❌'))
      .map(([key]) => key);

    // Determine overall status
    let overallStatus = 'Complete';
    let statusColor = '🟢';
    if (missingVariables.length > 0) {
      if (missingVariables.length <= 2) {
        overallStatus = 'Mostly Complete';
        statusColor = '🟡';
      } else {
        overallStatus = 'Incomplete';
        statusColor = '🔴';
      }
    }

    // Additional runtime checks
    const runtimeChecks = {
      portAvailable: process.env.PORT || '3000',
      timezoneCorrect: Intl.DateTimeFormat().resolvedOptions().timeZone,
      memoryUsage: process.memoryUsage().heapUsed,
      uptimeSeconds: process.uptime()
    };

    return NextResponse.json({
      success: true,
      message: 'Environment configuration check completed',
      data: {
        status: `${statusColor} ${overallStatus}`,
        configured: `${configuredCount}/${totalCount}`,
        environment: envVariables,
        missing: missingVariables,
        runtime: runtimeChecks,
        recommendations: missingVariables.length > 0 ? [
          'Create or update your .env.local file in the project root',
          'Ensure all required environment variables are set',
          'Restart the development server after updating environment variables',
          'Check the email-setup-guide.env file for email configuration examples'
        ] : ['All environment variables are properly configured! 🎉']
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Environment check error:', error);
    return NextResponse.json({
      success: false,
      message: 'Environment configuration check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
