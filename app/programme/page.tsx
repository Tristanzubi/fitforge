import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Dumbbell, Heart, ChevronRight } from "lucide-react";

const BLOC_STYLES: Record<string, { border: string; bg: string; dot: string; text: string }> = {
  "#4ade80": { border: "border-green-500/30", bg: "bg-green-500/10", dot: "bg-green-400", text: "text-green-400" },
  "#facc15": { border: "border-yellow-500/30", bg: "bg-yellow-500/10", dot: "bg-yellow-400", text: "text-yellow-400" },
  "#f97316": { border: "border-orange-500/30", bg: "bg-orange-500/10", dot: "bg-orange-400", text: "text-orange-400" },
  "#818cf8": { border: "border-indigo-500/30", bg: "bg-indigo-500/10", dot: "bg-indigo-400", text: "text-indigo-400" },
};

export default async function ProgrammePage() {
  const blocs = await prisma.bloc.findMany({
    orderBy: { numero: "asc" },
    include: {
      seances: {
        include: {
          exercices: { orderBy: { ordre: "asc" } },
          logs: { orderBy: { date: "desc" }, take: 1 },
        },
      },
    },
  });

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-100">Programme</h1>
        <p className="text-xs text-zinc-500 mt-0.5">10 semaines — Mi-juin → fin août 2025</p>
      </div>

      <div className="space-y-6">
        {blocs.map((bloc) => {
          const style = BLOC_STYLES[bloc.couleur] ?? BLOC_STYLES["#f97316"];
          return (
            <div key={bloc.id}>
              <div className={`rounded-xl border ${style.border} ${style.bg} px-4 py-3 mb-3 flex items-center gap-2`}>
                <div className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                <div>
                  <p className={`font-bold text-sm ${style.text}`}>Bloc {bloc.numero} — {bloc.nom}</p>
                  <p className="text-xs text-zinc-500">Semaines {bloc.semaines}</p>
                </div>
              </div>

              <div className="space-y-2">
                {bloc.seances.map((seance) => {
                  const lastLog = seance.logs[0];
                  const statut = lastLog?.statut ?? "a_faire";
                  const isDone = statut === "completee";
                  const isSkipped = statut === "skippee";
                  const hasGenou = seance.exercices.some((e) => e.isGenou);
                  const hasOlympique = seance.exercices.some((e) => e.typeExercice === "olympique");
                  return (
                    <Link key={seance.id} href={`/seance/${seance.id}`}>
                      <div className={`rounded-xl bg-zinc-900 border p-3 hover:border-zinc-600 transition-colors ${
                        isDone ? "border-green-500/20" : isSkipped ? "border-zinc-700 opacity-60" : "border-zinc-800"
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isDone ? "bg-green-500/10" : isSkipped ? "bg-zinc-800" : "bg-zinc-800"
                          }`}>
                            <Dumbbell className={`h-4 w-4 ${isDone ? "text-green-400" : isSkipped ? "text-zinc-600" : "text-zinc-500"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-zinc-200 truncate">{seance.nom}</p>
                              {hasGenou && <Heart className="h-3 w-3 text-red-400 shrink-0" />}
                              {hasOlympique && <span className="text-[9px] text-yellow-400 shrink-0">⚡</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-zinc-500">{seance.jour} · {seance.freq}</p>
                              {seance.lieu === "dehors" && <span className="text-[9px] text-blue-400">🌤 dehors</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {isDone && <span className="text-[9px] text-green-400 font-medium">✓</span>}
                            {isSkipped && <span className="text-[9px] text-zinc-500">passée</span>}
                            <span className="text-xs text-zinc-600">{seance.exercices.length} exos</span>
                            <ChevronRight className="h-4 w-4 text-zinc-600" />
                          </div>
                        </div>

                        {seance.exercices.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {seance.exercices.slice(0, 4).map((e) => (
                              <span key={e.id} className={`text-[9px] px-1.5 py-0.5 rounded border ${
                                e.typeExercice === "olympique" ? "border-yellow-500/30 text-yellow-400 bg-yellow-500/5" :
                                e.isGenou ? "border-red-500/30 text-red-400 bg-red-500/5" :
                                "border-zinc-800 text-zinc-600"
                              }`}>
                                {e.nom}
                              </span>
                            ))}
                            {seance.exercices.length > 4 && (
                              <span className="text-[9px] text-zinc-600">+{seance.exercices.length - 4}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
