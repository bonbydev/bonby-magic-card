// Simple password hashing using built-in crypto
import crypto from 'crypto'

export function hashPasscode(passcode: string): string {
  return crypto.createHash('sha256').update(passcode).digest('hex')
}

export function verifyPasscode(passcode: string, hash: string): boolean {
  return hashPasscode(passcode) === hash
}
