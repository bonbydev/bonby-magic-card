import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Collection from "@/lib/models/Collection";
import UserPlay from "@/lib/models/UserPlay";
import { getSession, parseSession } from "@/lib/session";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = parseSession(session);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { collectionId, flippedCard } = await request.json();

    if (!collectionId) {
      return NextResponse.json(
        { error: "Collection ID is required" },
        { status: 400 },
      );
    }

    if (typeof flippedCard !== "number" || !Number.isFinite(flippedCard)) {
      return NextResponse.json(
        { error: "Flipped card value is required" },
        { status: 400 },
      );
    }

    // Validate collection ID
    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      return NextResponse.json(
        { error: "Invalid collection ID" },
        { status: 400 },
      );
    }

    // Ensure collection exists (and belongs to the current user)
    const collection = await Collection.findOne({
      _id: new mongoose.Types.ObjectId(collectionId),
      username: parsed.username,
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found or unauthorized" },
        { status: 404 },
      );
    }

    // Upsert the user's play for this collection so each user is counted once
    await UserPlay.updateOne(
      {
        collectionId: String(collection._id),
        username: parsed.username,
      },
      {
        $set: {
          flippedCard,
          playedAt: new Date(),
        },
      },
      { upsert: true },
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Logged play error:", error);
    return NextResponse.json(
      { error: "An error occurred while recording the play" },
      { status: 500 },
    );
  }
}
