import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Collection from "@/lib/models/Collection";
import AnonymousPlay from "@/lib/models/AnonymousPlay";
import UserPlay from "@/lib/models/UserPlay";
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

    const collections = await Collection.find({
      username: parsed.username,
    }).lean();

    // Attach anonymous play statistics (unique players per collection + recent history)
    const collectionIds = collections.map((c: any) => String(c._id));

    if (collectionIds.length === 0) {
      return NextResponse.json({ collections: [] }, { status: 200 });
    }

    // Anonymous guest plays (one per IP per collection)
    const anonStats = await AnonymousPlay.aggregate([
      {
        $match: {
          collectionId: { $in: collectionIds },
        },
      },
      {
        // Sort first so that when we group we can easily slice the most recent plays
        $sort: { playedAt: -1 },
      },
      {
        $group: {
          _id: "$collectionId",
          count: { $sum: 1 },
          recentPlays: {
            $push: {
              playedAt: "$playedAt",
              flippedCard: "$flippedCard",
              username: "Guest",
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          count: 1,
          // Limit history per collection to the 10 most recent plays
          recentPlays: { $slice: ["$recentPlays", 10] },
        },
      },
    ]);

    // Logged-in user plays (one per username per collection)
    const userStats = await UserPlay.aggregate([
      {
        $match: {
          collectionId: { $in: collectionIds },
        },
      },
      {
        $sort: { playedAt: -1 },
      },
      {
        $group: {
          _id: "$collectionId",
          count: { $sum: 1 },
          recentPlays: {
            $push: {
              playedAt: "$playedAt",
              flippedCard: "$flippedCard",
              username: "$username",
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          count: 1,
          recentPlays: { $slice: ["$recentPlays", 10] },
        },
      },
    ]);

    type PlaySummary = {
      playedAt: Date;
      flippedCard: number;
      username: string;
    };

    const anonByCollectionId = new Map<
      string,
      { count: number; recentPlays: PlaySummary[] }
    >();
    for (const stat of anonStats) {
      anonByCollectionId.set(stat._id as string, {
        count: stat.count as number,
        recentPlays: stat.recentPlays as PlaySummary[],
      });
    }

    const userByCollectionId = new Map<
      string,
      { count: number; recentPlays: PlaySummary[] }
    >();
    for (const stat of userStats) {
      userByCollectionId.set(stat._id as string, {
        count: stat.count as number,
        recentPlays: stat.recentPlays as PlaySummary[],
      });
    }

    const collectionsWithStats = collections.map((c: any) => {
      const id = String(c._id);
      const anon = anonByCollectionId.get(id);
      const user = userByCollectionId.get(id);

      const totalCount = (anon?.count ?? 0) + (user?.count ?? 0);

      // Merge recent plays from both sources, newest first, limit to 10
      const combinedRecentPlays: PlaySummary[] = [
        ...(anon?.recentPlays ?? []),
        ...(user?.recentPlays ?? []),
      ]
        .sort(
          (a, b) =>
            new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime(),
        )
        .slice(0, 10);

      return {
        ...c,
        playCount: totalCount,
        recentPlays: combinedRecentPlays.map((p) => ({
          playedAt: p.playedAt,
          flippedCard: p.flippedCard,
          username: p.username,
        })),
      };
    });

    return NextResponse.json(
      { collections: collectionsWithStats },
      { status: 200 },
    );
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
