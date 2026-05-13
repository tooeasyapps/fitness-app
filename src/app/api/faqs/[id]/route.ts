import { NextResponse } from "next/server";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const body = await request.json();
    const faqId = parseInt(params.id, 10);

    if (isNaN(faqId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    if (body.answer === undefined) {
      return NextResponse.json({ error: "Answer is required" }, { status: 400 });
    }

    await db.update(faqs).set({ answer: body.answer }).where(eq(faqs.id, faqId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return NextResponse.json({ error: "Failed to update FAQ" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const faqId = parseInt(params.id, 10);

    if (isNaN(faqId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await db.delete(faqs).where(eq(faqs.id, faqId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 });
  }
}
