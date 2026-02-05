import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Collection from "@/lib/models/Collection";
import AnonymousPlay from "@/lib/models/AnonymousPlay";
import mongoose from "mongoose";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0]
    : request.headers.get("x-real-ip") || "unknown";
  return ip.trim();
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { collectionId, recordPlay } = await request.json();

    if (!collectionId) {
      return NextResponse.json(
        { error: "Collection ID is required" },
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

    // Check if collection exists
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 },
      );
    }

    const clientIp = getClientIp(request);

    // Check if this IP already played this collection
    const existingPlay = await AnonymousPlay.findOne({
      collectionId,
      ipAddress: clientIp,
    });

    // If this is just a "check" request (initial page load)
    if (!recordPlay) {
      if (existingPlay) {
        return NextResponse.json(
          {
            canPlay: false,
            error: "You have already played this collection once",
          },
          { status: 403 },
        );
      }

      // User has not played yet - allow play and return collection
      return NextResponse.json(
        {
          canPlay: true,
          collection: {
            _id: collection._id,
            name: collection.name,
            cards: collection.cards,
          },
        },
        { status: 200 },
      );
    }

    // If this is a "record play" request (after user actually flips a card)
    if (existingPlay) {
      // Already recorded; just acknowledge
      return NextResponse.json(
        {
          success: true,
          alreadyRecorded: true,
        },
        { status: 200 },
      );
    }

    const play = new AnonymousPlay({
      collectionId,
      ipAddress: clientIp,
    });

    await play.save();

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Play check error:", error);
    return NextResponse.json(
      { error: "An error occurred while checking play status" },
      { status: 500 },
    );
  }
}
