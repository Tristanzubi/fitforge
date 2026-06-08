import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const seance = await prisma.seance.findUnique({
    where: { id },
    include: {
      bloc: true,
      exercices: { orderBy: { ordre: "asc" } },
      logs: {
        orderBy: { date: "desc" },
        take: 5,
        include: { series: { include: { exercice: true } } },
      },
    },
  });
  if (!seance) return NextResponse.json({ error: "Séance introuvable" }, { status: 404 });
  return NextResponse.json(seance);
}
