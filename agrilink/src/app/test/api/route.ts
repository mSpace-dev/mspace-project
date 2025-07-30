import { NextRequest, NextResponse } from 'next/server';

// GET /test/api - Main test API overview and health check
export async function GET() {
  try {
    const testEndpoints = {
      '/test/api': {
        description: 'Test API overview and health check',
        methods: ['GET'],
        purpose: 'Get overview of all available test endpoints'
      },
      '/test/api/database': {
        description: 'Database connection and operations testing',
        methods: ['GET', 'POST'],
        purpose: 'Test MongoDB connection, read/write operations'
      },
      '/test/api/email': {
        description: 'Email service functionality testing',
        methods: ['GET', 'POST'],
        purpose: 'Test email configuration and sending capabilities'
      },
      '/test/api/environment': {
        description: 'Environment variables and configuration check',
        methods: ['GET'],
        purpose: 'Verify all required environment variables are set'
      },
      '/test/api/auth': {
        description: 'Authentication system testing',
        methods: ['GET', 'POST'],
        purpose: 'Test JWT token generation and validation'
      },
      '/test/api/api-endpoints': {
        description: 'API endpoints connectivity testing',
        methods: ['GET'],
        purpose: 'Test all major API endpoints for connectivity'
      }
    };

    const systemHealth = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: `${Math.floor(process.uptime())} seconds`,
      memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      nodeVersion: process.version,
      platform: process.platform
    };

    return NextResponse.json({
      success: true,
      message: 'AgriLink Test API - All testing endpoints are available',
      data: {
        overview: 'This test API provides comprehensive testing capabilities for all AgriLink systems',
        systemHealth,
        availableEndpoints: testEndpoints,
        usage: {
          description: 'Use these endpoints to verify functionality during development and deployment',
          examples: [
            'GET /test/api/environment - Check configuration',
            'GET /test/api/database - Test database connection',
            'POST /test/api/email - Send test emails',
            'GET /test/api - This overview'
          ]
        }
      }
    });

  } catch (error) {
    console.error('Test API overview error:', error);
    return NextResponse.json({
      success: false,
      message: 'Test API overview failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
