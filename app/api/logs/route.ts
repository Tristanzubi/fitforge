import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { seanceId, genouDouleur, fatigue, noteLibre, series } = body;

  const log = await prisma.logSeance.create({
    data: {
      seanceId,
      genouDouleur,
      fatigue,
      noteLibre,
      series: {
        create: series.map((s: {
          exerciceId: string;
          numeroSerie: number;
          chargeReelle: string;
          repsReelles: string;
          ressenti: string;
        }) => ({
          exerciceId: s.exerciceId,
          numeroSerie: s.numeroSerie,
          chargeReelle: s.chargeReelle,
          repsReelles: s.repsReelles,
          ressenti: s.ressenti,
        })),
      },
    },
    include: { series: true },
  });

  revalidatePath("/s-entrainer");
  return NextResponse.json(log);
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const seanceId = searchParams.get("seanceId");
    if (!seanceId) return NextResponse.json({ error: "seanceId requis" }, { status: 400 });

    // Trouver le dernier log pour cette séance
    const log = await prisma.logSeance.findFirst({
      where: { seanceId },
      orderBy: { date: "desc" },
      include: { series: true },
    });
    if (!log) return NextResponse.json({ error: "Aucun log trouvé" }, { status: 404 });

    // Supprimer les séries puis le log
    await prisma.logSerie.deleteMany({ where: { logSeanceId: log.id } });
    await prisma.logSeance.delete({ where: { id: log.id } });

    revalidatePath("/s-entrainer");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET() {
  const logs = await prisma.logSeance.findMany({
    orderBy: { date: "desc" },
    include: {
      seance: { include: { bloc: true } },
      series: { include: { exercice: true } },
    },
  });
  return NextResponse.json(logs);
}
