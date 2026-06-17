export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DeleteLogButton } from "@/components/DeleteLogButton";

const DOT_COLORS: Record<string, string> = {
  "#4ade80": "bg-green-400",
  "#facc15": "bg-yellow-400",
  "#f97316": "bg-orange-400",
  "#818cf8": "bg-indigo-400",
};

export default async function HistoriquePage() {
  const logs = await prisma.logSeance.findMany({
    orderBy: { date: "desc" },
    include: {
      seance: { include: { bloc: true } },
      series: true,
    },
  });

  return (
    <div className="min-h-screen px-4 pt-6 pb-24 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-100">Historique</h1>
        <p className="text-xs text-zinc-500 mt-0.5">{logs.length} séance{logs.length !== 1 ? "s" : ""} enregistrée{logs.length !== 1 ? "s" : ""}</p>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-20 rounded-xl bg-zinc-900 border border-zinc-800">
          <p className="text-zinc-400 text-sm font-medium">Aucune séance enregistrée</p>
          <p className="text-zinc-600 text-xs mt-1 mb-4">Complète ta première séance pour voir l'historique</p>
          <Link href="/programme" className="inline-block text-orange-400 text-sm font-medium border border-orange-500/30 bg-orange-500/10 rounded-lg px-4 py-2">
            Voir le programme →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Link key={log.id} href={`/historique/${log.id}`} className="block">
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 hover:border-zinc-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${DOT_COLORS[log.seance.bloc.couleur] ?? "bg-zinc-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-100 truncate">{log.seance.nom}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 capitalize">
                      {new Date(log.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <DeleteLogButton logId={log.id} seanceId={log.seanceId} />
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500 pl-5">
                  {log.genouDouleur > 0 && <span className="text-red-400">🦵 {log.genouDouleur}/3</span>}
                  <span>💪 {log.fatigue}/5</span>
                  <span>{log.series.length} séries</span>
                  {log.series.length > 0 && (
                    <span className="text-zinc-600">· {Math.round(log.series.reduce((acc) => acc + 1, 0))} sets</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
