import { NextRequest, NextResponse } from 'next/server';
import { migrateToNewStructure } from '@/lib/migrations/productMigration';

export async function POST(req: NextRequest) {
  try {
    // You might want to add authentication here to ensure only admins can run migrations
    
    const result = await migrateToNewStructure();
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      data: result
    }, { status: 200 });

  } catch (error) {
    console.error('Migration API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
