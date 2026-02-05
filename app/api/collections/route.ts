import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Collection from "@/lib/models/Collection";
import { getSession, parseSession } from "@/lib/session";

export async function GET(request: NextRequest) {
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

    const collections = await Collection.find({ username: parsed.username });

    return NextResponse.json({ collections }, { status: 200 });
  } catch (error) {
    console.error("Get collections error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching collections" },
      { status: 500 },
    );
  }
}

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

    const { name, cards } = await request.json();

    // Validate inputs
    if (!name || !cards) {
      return NextResponse.json(
        { error: "Name and cards are required" },
        { status: 400 },
      );
    }

    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Collection name must be a non-empty string" },
        { status: 400 },
      );
    }

    if (!Array.isArray(cards) || cards.length !== 5) {
      return NextResponse.json(
        { error: "Collection must have exactly 5 cards" },
        { status: 400 },
      );
    }

    // Create collection
    const collection = new Collection({
      username: parsed.username,
      name: name.trim(),
      cards,
    });

    await collection.save();

    return NextResponse.json(
      {
        success: true,
        collection,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create collection error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the collection" },
      { status: 500 },
    );
  }
}
