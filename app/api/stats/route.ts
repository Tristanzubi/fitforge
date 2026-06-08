import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.logSeance.findMany({
    orderBy: { date: "asc" },
    include: {
      series: { include: { exercice: true } },
    },
  });

  // Build per-exercise charge progression
  const exoMap = new Map<string, { date: string; charge: number; reps: string }[]>();

  for (const log of logs) {
    const dateStr = new Date(log.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    for (const serie of log.series) {
      const nom = serie.exercice.nom;
      const charge = parseFloat(serie.chargeReelle.replace(/[^0-9.]/g, ""));
      if (isNaN(charge) || charge === 0) continue;
      if (!exoMap.has(nom)) exoMap.set(nom, []);
      const existing = exoMap.get(nom)!;
      const last = existing[existing.length - 1];
      if (!last || last.date !== dateStr) {
        existing.push({ date: dateStr, charge, reps: serie.repsReelles });
      } else if (charge > last.charge) {
        last.charge = charge;
        last.reps = serie.repsReelles;
      }
    }
  }

  const exercices = Array.from(exoMap.entries())
    .filter(([, data]) => data.length > 0)
    .map(([nom, data]) => ({ nom, data }))
    .sort((a, b) => b.data.length - a.data.length)
    .slice(0, 8);

  const genouData = logs.map((l) => ({
    date: new Date(l.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    douleur: l.genouDouleur,
  }));

  const fatigueData = logs.map((l) => ({
    date: new Date(l.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    fatigue: l.fatigue,
  }));

  return NextResponse.json({ exercices, genouData, fatigueData });
}
