import { NextResponse } from "next/server";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allFaqs = await db.select().from(faqs).orderBy(desc(faqs.createdAt));
    return NextResponse.json(allFaqs);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    await db.insert(faqs).values({
      question: body.question,
      askedBy: body.askedBy || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
  }
}
