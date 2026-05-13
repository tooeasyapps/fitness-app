import { NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Ensure Ver and Val exist
    await db
      .insert(clients)
      .values([{ name: "Ver" }, { name: "Val" }])
      .onConflictDoNothing();
    
    const all = await db.select().from(clients).orderBy(clients.name);
    return NextResponse.json(all);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}
