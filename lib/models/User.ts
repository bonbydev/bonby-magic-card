import mongoose, { Schema, Document } from 'mongoose'
import bcryptjs from 'bcryptjs'

export interface IUser extends Document {
  username: string
  passcode: string
  createdAt: Date
  comparePasscode(passcode: string): Promise<boolean>
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9_-]{3,}$/, 'Username must be at least 3 characters and contain only lowercase letters, numbers, underscores, or dashes'],
  },
  passcode: {
    type: String,
    required: [true, 'Please provide a passcode'],
    minlength: 6,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Hash passcode before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('passcode')) {
    return
  }

  try {
    const salt = await bcryptjs.genSalt(10)
    const hashed = await bcryptjs.hash(this.passcode, salt)
    this.passcode = hashed
  } catch (error) {
    throw error
  }
})

// Compare passcode method
UserSchema.methods.comparePasscode = async function (passcode: string): Promise<boolean> {
  return await bcryptjs.compare(passcode, this.passcode)
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
