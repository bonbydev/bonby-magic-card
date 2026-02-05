import mongoose, { Schema, Document } from "mongoose";

export interface IAnonymousPlay extends Document {
  collectionId: string;
  ipAddress: string;
  // The card value the player flipped
  flippedCard: number;
  playedAt: Date;
}

const AnonymousPlaySchema = new Schema<IAnonymousPlay>(
  {
    collectionId: {
      type: String,
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
      index: true,
    },
    flippedCard: {
      type: Number,
      required: true,
    },
    playedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  },
);

// Compound index to ensure one play per IP per collection
AnonymousPlaySchema.index({ collectionId: 1, ipAddress: 1 }, { unique: true });

// Auto-delete records older than 30 days
AnonymousPlaySchema.index({ playedAt: 1 }, { expireAfterSeconds: 2592000 });

const AnonymousPlay =
  mongoose.models.AnonymousPlay ||
  mongoose.model<IAnonymousPlay>("AnonymousPlay", AnonymousPlaySchema);

export default AnonymousPlay;
