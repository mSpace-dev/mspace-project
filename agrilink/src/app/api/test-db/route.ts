import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    const DB_NAME = process.env.DB_NAME || 'agrilink';
    
    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI exists:', !!MONGODB_URI);
    console.log('DB Name:', DB_NAME);
    
    if (!MONGODB_URI) {
      return NextResponse.json({
        success: false,
        error: 'MONGODB_URI environment variable not set',
        available_vars: Object.keys(process.env).filter(key => key.includes('MONGO'))
      }, { status: 500 });
    }
    
    // Show partial URI for debugging (hide credentials)
    const maskedUri = MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log('Masked URI:', maskedUri);
    
    const client = new MongoClient(MONGODB_URI);
    
    // Test connection with timeout
    await client.connect();
    
    // Test basic operation
    await client.db(DB_NAME).admin().ping();
    
    // List collections to verify access
    const collections = await client.db(DB_NAME).listCollections().toArray();
    
    await client.close();
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      database: DB_NAME,
      collections: collections.map(c => c.name),
      connection_test: 'passed'
    });
    
  } catch (error: any) {
    console.error('MongoDB connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'MongoDB connection failed',
      details: {
        message: error.message,
        code: error.code,
        codeName: error.codeName,
        type: error.constructor.name
      }
    }, { status: 500 });
  }
}
