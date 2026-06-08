import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { seanceId } = await req.json();
    if (!seanceId) return NextResponse.json({ error: "seanceId requis" }, { status: 400 });

    const log = await prisma.logSeance.create({
      data: { seanceId, statut: "skippee", genouDouleur: 0, fatigue: 0 },
    });

    revalidatePath("/s-entrainer");
    return NextResponse.json({ id: log.id });
  } catch (err) {
    console.error("[skip]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
