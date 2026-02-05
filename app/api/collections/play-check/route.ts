import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Collection from "@/lib/models/Collection";
import AnonymousPlay from "@/lib/models/AnonymousPlay";
import UserPlay from "@/lib/models/UserPlay";
import { getSession, parseSession } from "@/lib/session";
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

    const { collectionId, recordPlay, flippedCard, clientId } =
      await request.json();

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

    // Check if a logged-in user is present
    const session = await getSession();
    const parsedSession = session ? parseSession(session) : null;
    const username = parsedSession?.username ?? null;

    // Check if this anonymous client or (if logged in) this username already played this collection
    const existingAnonPlay =
      clientId != null
        ? await AnonymousPlay.findOne({
            collectionId,
            clientId,
          })
        : await AnonymousPlay.findOne({
            collectionId,
            ipAddress: clientIp,
          });

    const existingUserPlay =
      username != null
        ? await UserPlay.findOne({
            collectionId,
            username,
          })
        : null;

    // If this is just a "check" request (initial page load)
    if (!recordPlay) {
      if (existingAnonPlay || existingUserPlay) {
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
    if (existingAnonPlay || existingUserPlay) {
      // Already recorded; just acknowledge
      return NextResponse.json(
        {
          success: true,
          alreadyRecorded: true,
        },
        { status: 200 },
      );
    }

    // Basic validation for flippedCard when recording a play
    if (
      recordPlay &&
      (typeof flippedCard !== "number" || !Number.isFinite(flippedCard))
    ) {
      return NextResponse.json(
        { error: "Flipped card value is required when recording a play" },
        { status: 400 },
      );
    }

    // Decide where to record the play:
    // - Logged-in user: record in UserPlay by username
    // - Guest: record in AnonymousPlay by clientId (or IP as fallback)
    if (username) {
      await UserPlay.updateOne(
        {
          collectionId,
          username,
        },
        {
          $set: {
            flippedCard,
            playedAt: new Date(),
          },
        },
        { upsert: true },
      );
    } else {
      const play = new AnonymousPlay({
        collectionId,
        ipAddress: clientIp,
        clientId: clientId ?? clientIp,
        flippedCard,
      });

      await play.save();
    }

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
