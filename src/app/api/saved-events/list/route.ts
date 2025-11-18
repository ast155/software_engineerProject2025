import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.savedEvent.findMany({
      where: { userId: "guest" }, // only show guest saved events
    });

    return NextResponse.json(events);
  } catch (err) {
    console.log("List error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
