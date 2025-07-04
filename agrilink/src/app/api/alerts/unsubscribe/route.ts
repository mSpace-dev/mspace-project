// src/app/api/alerts/unsubscribe/route.ts
import { NextResponse } from 'next/server'
import { dbConnect }    from '@/lib/dbConnect'
import { Subscription } from '@/lib/models/Subscription'

export async function DELETE(request: Request) {
  try {
    await dbConnect()

    // pull userId & type from the query string
    const url    = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const type   = url.searchParams.get('type')

    if (!userId || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or type' },
        { status: 400 }
      )
    }

    await Subscription.findOneAndUpdate(
      { userId, type },
      { isActive: false }
    )

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err: any) {
    console.error('Unsubscribe Error →', err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
