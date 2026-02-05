import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Collection from '@/lib/models/Collection'
import { getSession, parseSession } from '@/lib/session'
import mongoose from 'mongoose'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const parsed = parseSession(session)
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid collection ID' },
        { status: 400 }
      )
    }

    // Delete collection (only if it belongs to the user)
    const result = await Collection.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      username: parsed.username,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Collection not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Delete collection error:', error)
    return NextResponse.json(
      { error: 'An error occurred while deleting the collection' },
      { status: 500 }
    )
  }
}
