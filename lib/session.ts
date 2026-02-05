import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'card-game-session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export async function createSession(username: string): Promise<string> {
  const timestamp = Date.now()
  const sessionValue = `${username}-${timestamp}`
  
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })

  return sessionValue
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE_NAME)
  return session?.value || null
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export function parseSession(sessionValue: string): { username: string; timestamp: number } | null {
  const parts = sessionValue.split('-')
  if (parts.length < 2) return null

  const username = parts.slice(0, -1).join('-') // Handle usernames with hyphens
  const timestamp = parseInt(parts[parts.length - 1], 10)

  if (!username || isNaN(timestamp)) return null

  return { username, timestamp }
}
