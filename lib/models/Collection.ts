import mongoose, { Schema, Document } from "mongoose";

export interface ICollection extends Document {
  username: string;
  name: string;
  cards: number[];
  createdAt: Date;
}

const CollectionSchema: Schema = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    ref: "User",
    index: true,
  },
  name: {
    type: String,
    required: [true, "Collection name is required"],
    trim: true,
  },
  cards: {
    type: [Number],
    required: [true, "Cards are required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Collection ||
  mongoose.model<ICollection>("Collection", CollectionSchema);
