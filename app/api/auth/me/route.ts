import { NextResponse } from 'next/server'
import { getSession, parseSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      )
    }

    const parsed = parseSession(session)
    if (!parsed) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        user: {
          username: parsed.username,
          timestamp: parsed.timestamp,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { user: null },
      { status: 200 }
    )
  }
}
