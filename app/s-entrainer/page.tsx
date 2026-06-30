export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle2, SkipForward, Dumbbell, ChevronRight, Zap, MapPin, Clock, ChevronLeft } from "lucide-react";
import { UndoSeanceButton } from "@/components/UndoSeanceButton";

const JOURS_ORDER = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const BLOC_CFG: Record<string, { ring: string; bar: string; pill: string; text: string; bg: string; dot: string }> = {
  "#4ade80": { ring: "ring-green-500/30",  bar: "bg-green-400",  pill: "bg-green-500/10 text-green-400",  text: "text-green-400",  bg: "bg-green-500/5",  dot: "bg-green-400" },
  "#facc15": { ring: "ring-yellow-500/30", bar: "bg-yellow-400", pill: "bg-yellow-500/10 text-yellow-400", text: "text-yellow-400", bg: "bg-yellow-500/5", dot: "bg-yellow-400" },
  "#f97316": { ring: "ring-orange-500/30", bar: "bg-orange-400", pill: "bg-orange-500/10 text-orange-400", text: "text-orange-400", bg: "bg-orange-500/5", dot: "bg-orange-400" },
  "#818cf8": { ring: "ring-indigo-500/30", bar: "bg-indigo-400", pill: "bg-indigo-500/10 text-indigo-400", text: "text-indigo-400", bg: "bg-indigo-500/5", dot: "bg-indigo-400" },
};
const DEFAULT_CFG = BLOC_CFG["#f97316"];

const TYPE_COLOR: Record<string, string> = {
  force: "text-blue-400", cardio: "text-green-400",
  circuit: "text-purple-400", test: "text-yellow-400", mobilite: "text-app-fg2",
};

function parseDuree(semaines: string): number {
  if (semaines.includes("-")) {
    const [a, b] = semaines.split("-").map(Number);
    return b - a + 1;
  }
  return 1;
}

function dureeMin(type: string, n: number) {
  if (type === "cardio") return "45";
  if (type === "mobilite") return "20";
  if (type === "circuit") return "40";
  return n <= 3 ? "30" : n <= 5 ? "50" : "65";
}

export default async function SEntrainerPage({
  searchParams,
}: {
  searchParams: Promise<{ bloc?: string; sem?: string }>;
}) {
  const { bloc: blocParam, sem: semParam } = await searchParams;

  const blocs = await prisma.bloc.findMany({
    orderBy: { numero: "asc" },
    include: {
      seances: {
        include: {
          exercices: { orderBy: { ordre: "asc" } },
          // Fetch all logs sorted oldest→newest so we can index by week
          logs: { orderBy: { date: "asc" } },
        },
      },
    },
  });

  if (!blocs.length) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-app-fg3 text-sm">Aucun programme trouvé.<br />Lance le seed pour démarrer.</p>
      </div>
    );
  }

  // Determine current bloc
  const activeBlocIdx = blocs.findIndex((b) =>
    b.seances.some((s) => {
      const nbLogs = s.logs.length;
      const duree = parseDuree(b.semaines);
      return nbLogs < duree || s.logs.some((l) => l.statut === "skippee");
    })
  );
  const defaultBlocIdx = activeBlocIdx === -1 ? 0 : activeBlocIdx;
  const blocIdx = blocParam ? Math.max(0, Math.min(parseInt(blocParam, 10) - 1, blocs.length - 1)) : defaultBlocIdx;
  const bloc = blocs[blocIdx];
  const cfg = BLOC_CFG[bloc.couleur] ?? DEFAULT_CFG;
  const dureeBloc = parseDuree(bloc.semaines);

  // Determine current week within bloc
  const seances = [...bloc.seances].sort(
    (a, b) => JOURS_ORDER.indexOf(a.jour) - JOURS_ORDER.indexOf(b.jour)
  );

  // Default sem: first week where not all sessions are done
  const defaultSem = (() => {
    for (let w = 1; w <= dureeBloc; w++) {
      const allDone = seances.every((s) => {
        const log = s.logs[w - 1];
        return log?.statut === "completee";
      });
      if (!allDone) return w;
    }
    return dureeBloc;
  })();

  const sem = semParam ? Math.max(1, Math.min(parseInt(semParam, 10), dureeBloc)) : defaultSem;

  // For each session, get the log for this specific week (index sem-1)
  const seancesWithWeekLog = seances.map((s) => ({
    ...s,
    weekLog: s.logs[sem - 1] ?? null,
  }));

  const done = seancesWithWeekLog.filter((s) => s.weekLog?.statut === "completee").length;
  const skipped = seancesWithWeekLog.filter((s) => s.weekLog?.statut === "skippee").length;
  const total = seances.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const dureeTotal = seances.reduce((acc, s) => acc + parseInt(dureeMin(s.type, s.exercices.length)), 0);

  // Navigation: prev/next can be within the bloc (weeks) or across blocs
  const prevBloc = blocIdx > 0 ? blocs[blocIdx - 1] : null;
  const nextBloc = blocIdx < blocs.length - 1 ? blocs[blocIdx + 1] : null;

  const prevHref = sem > 1
    ? `/s-entrainer?bloc=${bloc.numero}&sem=${sem - 1}`
    : prevBloc
    ? `/s-entrainer?bloc=${prevBloc.numero}&sem=${parseDuree(prevBloc.semaines)}`
    : null;

  const nextHref = sem < dureeBloc
    ? `/s-entrainer?bloc=${bloc.numero}&sem=${sem + 1}`
    : nextBloc
    ? `/s-entrainer?bloc=${nextBloc.numero}&sem=1`
    : null;

  // Semaine absolue number for display
  const semainesBase = parseInt(bloc.semaines.split("-")[0], 10);
  const semaineAbsolue = semainesBase + sem - 1;

  return (
    <div className="min-h-screen pb-24 pt-2 max-w-md mx-auto">
      {/* Navigation header */}
      <div className="flex items-center justify-between px-4 py-4">
        {prevHref ? (
          <Link href={prevHref} className="h-9 w-9 rounded-full bg-app-deep flex items-center justify-center hover:bg-app-deep transition-colors">
            <ChevronLeft className="h-4 w-4 text-app-fg2" />
          </Link>
        ) : (
          <div className="h-9 w-9" />
        )}

        <div className="text-center">
          <p className="text-sm font-semibold text-app-fg1">
            Semaine {semaineAbsolue}
          </p>
          <p className="text-[11px] text-app-fg3">
            Bloc {bloc.numero} · sem. {sem}/{dureeBloc}
            {dureeBloc > 1 && (
              <span className="ml-1">
                {Array.from({ length: dureeBloc }, (_, i) => (
                  <span
                    key={i}
                    className={`inline-block h-1.5 w-1.5 rounded-full mx-0.5 ${i + 1 === sem ? cfg.dot : "bg-app-deep"}`}
                  />
                ))}
              </span>
            )}
          </p>
        </div>

        {nextHref ? (
          <Link href={nextHref} className="h-9 w-9 rounded-full bg-app-deep flex items-center justify-center hover:bg-app-deep transition-colors">
            <ChevronRight className="h-4 w-4 text-app-fg2" />
          </Link>
        ) : (
          <div className="h-9 w-9" />
        )}
      </div>

      <div className="px-4 space-y-4">
        {/* Bloc + week summary card */}
        <div className={`rounded-2xl ring-1 ${cfg.ring} ${cfg.bg} p-4`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${cfg.dot}`} />
              <p className={`text-sm font-bold ${cfg.text}`}>{bloc.nom}</p>
            </div>
            {dureeBloc > 1 && (
              <span className="text-[10px] text-app-fg3 bg-app-deep px-2 py-0.5 rounded-full">
                {dureeBloc} semaines
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <p className="text-[10px] text-app-fg3 mb-0.5">Séances</p>
              <p className="text-xl font-bold text-app-fg1">{done}</p>
              <p className="text-[10px] text-app-fg3">sur {total}</p>
            </div>
            <div>
              <p className="text-[10px] text-app-fg3 mb-0.5">Durée/sem.</p>
              <p className="text-xl font-bold text-app-fg1">
                {Math.floor(dureeTotal / 60) > 0 ? `${Math.floor(dureeTotal / 60)}h` : `${dureeTotal}m`}
              </p>
              <p className="text-[10px] text-app-fg3">{dureeTotal % 60 > 0 ? `${dureeTotal % 60} min` : "estimé"}</p>
            </div>
            <div>
              <p className="text-[10px] text-app-fg3 mb-0.5">Progression</p>
              <p className="text-xl font-bold text-app-fg1">{pct}%</p>
              <p className="text-[10px] text-app-fg3">{skipped > 0 ? `${skipped} passée${skipped > 1 ? "s" : ""}` : "cette sem."}</p>
            </div>
          </div>

          <div className="h-1.5 rounded-full bg-app-deep/50">
            <div
              className={`h-1.5 rounded-full ${cfg.bar} transition-all duration-500`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Week dots for quick navigation */}
          {dureeBloc > 1 && (
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-app-edge/50">
              <span className="text-[9px] text-app-fg3 mr-1">Semaines :</span>
              {Array.from({ length: dureeBloc }, (_, i) => {
                const w = i + 1;
                const wDone = seancesWithWeekLog.every((s) => {
                  const log = s.logs[i];
                  return log?.statut === "completee";
                });
                const isCurrent = w === sem;
                return (
                  <Link
                    key={w}
                    href={`/s-entrainer?bloc=${bloc.numero}&sem=${w}`}
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold transition-all ${
                      isCurrent
                        ? `${cfg.dot.replace("bg-", "bg-")} text-zinc-900`
                        : wDone
                        ? "bg-app-deep text-app-fg2"
                        : "bg-app-deep text-app-fg3 hover:bg-app-deep"
                    }`}
                    style={isCurrent ? { backgroundColor: bloc.couleur } : {}}
                  >
                    {w}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Session list */}
        <div className="space-y-2">
          {seancesWithWeekLog.map((seance, i) => {
            const statut = seance.weekLog?.statut ?? "a_faire";
            const isDone = statut === "completee";
            const isSkipped = statut === "skippee";
            const olympiques = seance.exercices.filter((e) => e.typeExercice === "olympique");
            const autres = seance.exercices.filter((e) => e.typeExercice !== "olympique");
            const firstExos = [...olympiques.slice(0, 1), ...autres.slice(0, 2)];
            const duree = dureeMin(seance.type, seance.exercices.length);
            const typeColor = TYPE_COLOR[seance.type] ?? TYPE_COLOR.force;

            return (
              <Link key={seance.id} href={`/seance/${seance.id}`} className="block group">
                <div className={`rounded-2xl bg-app-card border transition-all duration-150 ${
                  isDone ? "border-app-edge opacity-60"
                  : isSkipped ? "border-app-edge/50 opacity-40"
                  : "border-app-edge hover:border-app-fg3 group-active:scale-[0.99]"
                }`}>
                  <div className="flex items-center p-3.5 gap-3">
                    {/* Left: day + index */}
                    <div className={`h-11 w-11 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                      isDone ? "bg-green-500/10" : isSkipped ? "bg-app-deep" : "bg-app-deep"
                    }`}>
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      ) : isSkipped ? (
                        <SkipForward className="h-4 w-4 text-app-fg3" />
                      ) : (
                        <>
                          <span className="text-[9px] text-app-fg3 font-bold">{seance.jour.slice(0, 3).toUpperCase()}</span>
                          <span className="text-xs font-bold text-app-fg1">{i + 1}</span>
                        </>
                      )}
                    </div>

                    {/* Center */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className={`text-sm font-semibold truncate ${isDone || isSkipped ? "text-app-fg3" : "text-app-fg1"}`}>
                          {seance.nom}
                        </p>
                        {olympiques.length > 0 && <Zap className="h-3 w-3 text-yellow-400 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-medium ${typeColor}`}>{seance.type}</span>
                        <span className="flex items-center gap-0.5 text-[10px] text-app-fg3">
                          <Clock className="h-2.5 w-2.5" />{duree} min
                        </span>
                        {seance.lieu === "dehors" && (
                          <span className="flex items-center gap-0.5 text-[10px] text-app-fg3">
                            <MapPin className="h-2.5 w-2.5" />dehors
                          </span>
                        )}
                      </div>
                      {!isDone && !isSkipped && firstExos.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {firstExos.map((e) => (
                            <span key={e.id} className={`text-[9px] px-1.5 py-0.5 rounded-md ${
                              e.typeExercice === "olympique" ? "bg-yellow-500/10 text-yellow-400" : "bg-app-deep text-app-fg3"
                            }`}>
                              {e.typeExercice === "olympique" ? "⚡ " : ""}{e.nom}
                            </span>
                          ))}
                          {seance.exercices.length > 3 && (
                            <span className="text-[9px] text-app-fg3 px-1">+{seance.exercices.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right */}
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {isDone ? (
                        <>
                          <span className="text-[10px] text-green-400 font-semibold">✓ Fait</span>
                          <UndoSeanceButton seanceId={seance.id} />
                        </>
                      ) : isSkipped ? (
                        <>
                          <span className="text-[10px] text-app-fg3">Passée</span>
                          <UndoSeanceButton seanceId={seance.id} />
                        </>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-app-fg3 group-hover:text-app-fg2 transition-colors" />
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Next bloc preview */}
        {sem === dureeBloc && nextBloc && (
          <div className="mt-2">
            <p className="text-[11px] font-semibold text-app-fg3 uppercase tracking-wider mb-2 px-1">Prochaine phase</p>
            <Link href={`/s-entrainer?bloc=${nextBloc.numero}&sem=1`} className="block">
              <div className="rounded-2xl border border-app-edge bg-app-card/50 p-4 flex items-center gap-3 hover:border-app-edge transition-colors">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${(BLOC_CFG[nextBloc.couleur] ?? DEFAULT_CFG).bg}`}>
                  <Dumbbell className={`h-4 w-4 ${(BLOC_CFG[nextBloc.couleur] ?? DEFAULT_CFG).text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-app-fg1">{nextBloc.nom}</p>
                  <p className="text-[11px] text-app-fg3">
                    Bloc {nextBloc.numero} · {parseDuree(nextBloc.semaines)} sem. · S{nextBloc.semaines}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-app-fg3" />
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
