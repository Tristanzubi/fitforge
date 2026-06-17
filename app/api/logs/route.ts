import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// ─── Progression rules ────────────────────────────────────────────────────────
// Applied after every log. Updates chargeTarget for each exercise.
// Exceptions: olympic movements and knee-sensitive exercises → never auto-adjusted.

async function applyProgressionRules(logId: string) {
  const log = await prisma.logSeance.findUnique({
    where: { id: logId },
    include: { series: { include: { exercice: true } } },
  });
  if (!log || log.series.length === 0) return;

  // Group series by exercise
  const byExo = new Map<string, typeof log.series>();
  for (const s of log.series) {
    const arr = byExo.get(s.exerciceId) ?? [];
    arr.push(s);
    byExo.set(s.exerciceId, arr);
  }

  for (const [exerciceId, series] of byExo) {
    const exo = series[0].exercice;

    // Never touch olympic or genou exercises
    if (exo.typeExercice === "olympique" || exo.isGenou) continue;

    // Parse charges — skip if all non-numeric (PDC, bodyweight, etc.)
    const charges = series
      .map((s) => parseFloat(s.chargeReelle.replace(",", ".")))
      .filter((n) => !isNaN(n) && n > 0);
    if (charges.length === 0) continue;

    const bestCharge = Math.max(...charges);

    // Rule 1: ≥ half of series felt "trop" → reduce by 10%
    const tropCount = series.filter((s) => s.ressenti === "trop").length;
    if (tropCount >= Math.ceil(series.length / 2)) {
      const newCharge = roundToHalf(bestCharge * 0.9);
      await prisma.exercice.update({
        where: { id: exerciceId },
        data: { chargeTarget: String(newCharge) },
      });
      continue;
    }

    // Rule 2: ALL series felt "facile" → check previous log for same exercise
    const allFacile = series.every((s) => s.ressenti === "facile");
    if (allFacile) {
      const prevSeries = await prisma.logSerie.findMany({
        where: { exerciceId, logSeanceId: { not: logId } },
        orderBy: { logSeance: { date: "desc" } },
        take: exo.series,
        include: { logSeance: { select: { date: true } } },
      });
      const prevAllFacile = prevSeries.length >= exo.series && prevSeries.every((s) => s.ressenti === "facile");
      const newCharge = prevAllFacile
        ? roundToHalf(bestCharge * 1.05)  // 2nd consecutive "facile" → +5%
        : bestCharge;                      // 1st time "facile" → keep charge, note it
      await prisma.exercice.update({
        where: { id: exerciceId },
        data: { chargeTarget: String(newCharge) },
      });
      continue;
    }

    // Default: update chargeTarget to best charge actually used this session
    await prisma.exercice.update({
      where: { id: exerciceId },
      data: { chargeTarget: String(bestCharge) },
    });
  }
}

function roundToHalf(n: number) {
  return Math.round(n * 2) / 2;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

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

  // Apply progression rules in background — don't block the response
  applyProgressionRules(log.id).catch(console.error);

  revalidatePath("/s-entrainer");
  return NextResponse.json(log);
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const seanceId = searchParams.get("seanceId");
    if (!seanceId) return NextResponse.json({ error: "seanceId requis" }, { status: 400 });

    const log = await prisma.logSeance.findFirst({
      where: { seanceId },
      orderBy: { date: "desc" },
      include: { series: true },
    });
    if (!log) return NextResponse.json({ error: "Aucun log trouvé" }, { status: 404 });

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
