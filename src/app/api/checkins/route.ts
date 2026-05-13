import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { checkins } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });
    
    const rows = await db
      .select()
      .from(checkins)
      .where(eq(checkins.clientId, parseInt(clientId)))
      .orderBy(desc(checkins.weekDate));
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch check-ins" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [row] = await db.insert(checkins).values(body).returning();
    return NextResponse.json(row);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create check-in" }, { status: 500 });
  }
}
