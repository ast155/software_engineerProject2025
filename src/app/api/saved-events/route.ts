import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET saved events
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "";

  if (!userId)
    return NextResponse.json({ events: [] }, { status: 200 });

  const events = await prisma.savedEvent.findMany({
    where: { userId },
  });

  return NextResponse.json({ events }, { status: 200 });
}

// SAVE event
export async function POST(req: Request) {
  try {
    const { userId, eventId, name, date, venue, imageUrl } =
      await req.json();

    if (!userId || !eventId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if already saved
    const existing = await prisma.savedEvent.findFirst({
      where: { userId, eventId },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Already saved", event: existing },
        { status: 200 }
      );
    }

    // Create new saved event
    const saved = await prisma.savedEvent.create({
      data: {
        userId,
        eventId,
        name,
        date,
        venue,
        imageUrl,
      },
    });

    return NextResponse.json({ event: saved }, { status: 201 });
  } catch (err) {
    console.error("Save error:", err);
    return NextResponse.json(
      { error: "Failed to save event" },
      { status: 500 }
    );
  }
}

// DELETE saved event
export async function DELETE(req: Request) {
  const { userId, eventId } = await req.json();

  if (!userId || !eventId) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  await prisma.savedEvent.deleteMany({
    where: { userId, eventId },
  });

  return NextResponse.json({ success: true });
}



