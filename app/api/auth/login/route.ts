import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import { createSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { username, passcode } = await request.json()

    // Validate inputs
    if (!username || !passcode) {
      return NextResponse.json(
        { error: 'Username and passcode are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await User.findOne({ username: username.toLowerCase() }).select('+passcode')

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or passcode' },
        { status: 401 }
      )
    }

    // Verify passcode
    const isValid = await user.comparePasscode(passcode)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid username or passcode' },
        { status: 401 }
      )
    }

    // Create session
    const session = await createSession(username.toLowerCase())

    const response = NextResponse.json(
      {
        success: true,
        username: username.toLowerCase(),
      },
      { status: 200 }
    )

    response.cookies.set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
