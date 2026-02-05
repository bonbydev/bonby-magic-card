import mongoose, { Schema, Document } from 'mongoose'

export interface ICollection extends Document {
  _id: string
  username: string
  name: string
  cards: number[]
  createdAt: Date
}

const CollectionSchema: Schema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    ref: 'User',
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Collection name is required'],
    trim: true,
  },
  cards: {
    type: [Number],
    required: [true, 'Cards are required'],
    validate: {
      validator: function (v: number[]) {
        return v.length === 5 && v.every((card) => typeof card === 'number' && card >= 0 && card <= 999)
      },
      message: 'Cards must be an array of 5 numbers between 0 and 999',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Collection || mongoose.model<ICollection>('Collection', CollectionSchema)
