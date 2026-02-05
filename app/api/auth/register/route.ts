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

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 30 characters' },
        { status: 400 }
      )
    }

    if (passcode.length !== 6 || !/^\d+$/.test(passcode)) {
      return NextResponse.json(
        { error: 'Passcode must be exactly 6 digits' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }

    // Create user (passcode will be hashed automatically)
    const user = new User({
      username: username.toLowerCase(),
      passcode,
    })

    await user.save()

    // Create session
    const session = await createSession(username.toLowerCase())

    const response = NextResponse.json(
      {
        success: true,
        username: username.toLowerCase(),
      },
      { status: 201 }
    )

    response.cookies.set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
