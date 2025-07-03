// src/app/api/alerts/subscribe/route.ts
import { NextResponse } from 'next/server'
import { dbConnect }    from '@/lib/dbConnect'
import { Subscription } from '@/lib/models/Subscription'

export async function POST(request: Request) {
  try {
    await dbConnect()

    const { userId, type, options } = await request.json()

    if (!userId || !type || !options?.crops?.length || !options?.location) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const sub = await Subscription.findOneAndUpdate(
      { userId, type },
      { userId, type, ...options, isActive: true },
      { upsert: true, new: true }
    )

    return NextResponse.json({ success: true, data: sub }, { status: 201 })
  } catch (err: any) {
    console.error('Subscribe Error →', err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
