import mongoose, { Schema, Document } from "mongoose";

export interface IUserPlay extends Document {
  collectionId: string;
  username: string;
  flippedCard: number;
  playedAt: Date;
}

const UserPlaySchema = new Schema<IUserPlay>(
  {
    collectionId: {
      type: String,
      required: true,
      index: true,
    },
    username: {
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

// Ensure one counted play per user per collection
UserPlaySchema.index({ collectionId: 1, username: 1 }, { unique: true });

// Auto-delete records older than 30 days (same as AnonymousPlay)
UserPlaySchema.index({ playedAt: 1 }, { expireAfterSeconds: 2592000 });

const UserPlay =
  mongoose.models.UserPlay ||
  mongoose.model<IUserPlay>("UserPlay", UserPlaySchema);

export default UserPlay;
