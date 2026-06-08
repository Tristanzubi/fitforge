import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { notFound } from "next/navigation";

const RESSENTI_STYLES: Record<string, string> = {
  facile: "text-green-400 bg-green-500/10 border-green-500/30",
  bon: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  dur: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  trop: "text-red-400 bg-red-500/10 border-red-500/30",
};

export default async function LogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const log = await prisma.logSeance.findUnique({
    where: { id },
    include: {
      seance: { include: { bloc: true } },
      series: { include: { exercice: true }, orderBy: [{ exercice: { ordre: "asc" } }, { numeroSerie: "asc" }] },
    },
  });

  if (!log) notFound();

  // Group series by exercise
  const byExo = log.series.reduce<Record<string, typeof log.series>>((acc, s) => {
    const key = s.exerciceId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  let analyseData: { analyse: string; alertes?: string[]; actions?: unknown[] } | null = null;
  if (log.analyse) {
    try { analyseData = JSON.parse(log.analyse); } catch { analyseData = { analyse: log.analyse }; }
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/historique" className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800">
          <ChevronLeft className="h-4 w-4 text-zinc-400" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-zinc-100">{log.seance.nom}</h1>
          <p className="text-xs text-zinc-500">
            {new Date(log.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Bilan */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3">
          <p className="text-xs text-zinc-500 mb-1">Douleur genou</p>
          <p className={`text-xl font-bold ${log.genouDouleur === 0 ? "text-green-400" : log.genouDouleur === 1 ? "text-yellow-400" : "text-red-400"}`}>
            {log.genouDouleur}/3
          </p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3">
          <p className="text-xs text-zinc-500 mb-1">Fatigue</p>
          <p className="text-xl font-bold text-zinc-100">{log.fatigue}/5</p>
        </div>
      </div>

      {log.noteLibre && (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 mb-6 text-sm text-zinc-300">
          {log.noteLibre}
        </div>
      )}

      {/* Séries par exercice */}
      <div className="mb-6 space-y-4">
        {Object.entries(byExo).map(([, seriesList]) => {
          const exo = seriesList[0].exercice;
          return (
            <div key={exo.id} className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-3">
                <p className="font-semibold text-zinc-200 text-sm">{exo.nom}</p>
                {exo.isGenou && <AlertTriangle className="h-3.5 w-3.5 text-red-400" />}
              </div>
              <div className="space-y-1.5">
                {seriesList.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-600 text-xs w-5">#{s.numeroSerie}</span>
                    <span className="text-zinc-300 flex-1">{s.chargeReelle}{exo.unite} × {s.repsReelles}</span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${RESSENTI_STYLES[s.ressenti] ?? ""}`}>{s.ressenti}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Analyse Claude */}
      {analyseData && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Analyse Claude</h2>
          {analyseData.alertes && analyseData.alertes.length > 0 && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3">
              {analyseData.alertes.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-red-400 text-sm">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          )}
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
            <p className="text-sm text-zinc-200 leading-relaxed">{analyseData.analyse}</p>
          </div>
          {analyseData.actions && (analyseData.actions as unknown[]).length > 0 && (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-xs text-zinc-500 mb-2 font-semibold uppercase tracking-wider">Actions appliquées</p>
              <div className="space-y-1.5">
                {(analyseData.actions as Array<{ type: string; raison: string }>).map((action, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-orange-400 font-mono bg-orange-500/10 rounded px-1.5 py-0.5 flex-shrink-0">{action.type}</span>
                    <span className="text-zinc-400">{action.raison}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
