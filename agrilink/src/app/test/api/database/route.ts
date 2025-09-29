import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import mongoose from 'mongoose';

// GET /test/api/database - Test database connection and operations
export async function GET() {
  try {
    await dbConnect();
    
    const connectionState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    const dbStats = {
      connectionState: states[connectionState as keyof typeof states],
      dbName: mongoose.connection.db?.databaseName || 'Unknown',
      host: mongoose.connection.host || 'Unknown',
      port: mongoose.connection.port || 'Unknown',
      collections: await mongoose.connection.db?.listCollections().toArray() || []
    };

    return NextResponse.json({
      success: true,
      message: 'Database connection test completed',
      timestamp: new Date().toISOString(),
      data: dbStats
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST /test/api/database - Test database write operations
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { collection, testData } = body;

    if (!collection) {
      return NextResponse.json({
        success: false,
        error: 'Collection name is required'
      }, { status: 400 });
    }

    // Test write operation (insert test document)
    const testDoc = {
      ...testData,
      _testDocument: true,
      createdAt: new Date(),
      testId: `test_${Date.now()}`
    };

    const db = mongoose.connection.db;
    const result = await db?.collection(collection).insertOne(testDoc);

    // Clean up - remove test document
    if (result?.insertedId) {
      await db?.collection(collection).deleteOne({ _id: result.insertedId });
    }

    return NextResponse.json({
      success: true,
      message: 'Database write test completed successfully',
      data: {
        collection,
        testDocumentId: result?.insertedId,
        operationCompleted: 'insert and cleanup successful'
      },
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('Database write test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database write test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
