export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Dumbbell, Heart, Zap, TrendingUp, MessageCircle } from "lucide-react";
import { BlocCard } from "@/components/BlocModal";

const BLOC_COLORS: Record<string, string> = {
  "#4ade80": "border-green-400 text-green-400 bg-green-400/10",
  "#facc15": "border-yellow-400 text-yellow-400 bg-yellow-400/10",
  "#f97316": "border-orange-400 text-orange-400 bg-orange-400/10",
  "#818cf8": "border-indigo-400 text-indigo-400 bg-indigo-400/10",
};

function getBlocDot(couleur: string) {
  const map: Record<string, string> = {
    "#4ade80": "bg-green-400",
    "#facc15": "bg-yellow-400",
    "#f97316": "bg-orange-400",
    "#818cf8": "bg-indigo-400",
  };
  return map[couleur] ?? "bg-zinc-400";
}

export default async function DashboardPage() {
  const [blocs, recentLogs] = await Promise.all([
    prisma.bloc.findMany({
      orderBy: { numero: "asc" },
      include: {
        seances: {
          include: {
            logs: { orderBy: { date: "desc" }, take: 1 },
            exercices: { orderBy: { ordre: "asc" } },
          },
        },
      },
    }),
    prisma.logSeance.findMany({
      orderBy: { date: "desc" },
      take: 5,
      include: { seance: { include: { bloc: true } } },
    }),
  ]);

  const totalSeances = blocs.reduce((acc, b) => acc + b.seances.length, 0);
  const totalLogs = await prisma.logSeance.count();
  const lastLog = recentLogs[0];

  // Find next recommended session (first seance with no recent log)
  let prochaine = null;
  outer: for (const bloc of blocs) {
    for (const seance of bloc.seances) {
      if (seance.type !== "test" && seance.logs.length === 0) {
        prochaine = { seance, bloc };
        break outer;
      }
    }
  }
  if (!prochaine && blocs[0]?.seances[1]) {
    prochaine = { seance: blocs[0].seances[1], bloc: blocs[0] };
  }

  const [genouLogs, lastAnalyse] = await Promise.all([
    prisma.logSeance.findMany({
      orderBy: { date: "desc" },
      take: 14,
      select: { date: true, genouDouleur: true },
    }),
    prisma.logSeance.findFirst({
      orderBy: { date: "desc" },
      where: { analyse: { not: null } },
      select: { analyse: true, date: true, seance: { select: { nom: true } } },
    }),
  ]);

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-9 w-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Dumbbell className="h-5 w-5 text-white stroke-2" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">FitForge</h1>
            <p className="text-xs text-zinc-500">Préparation Rugby — 10 semaines</p>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-center">
          <p className="text-2xl font-bold text-orange-400">{totalLogs}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Séances</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{totalSeances}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Au programme</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-center">
          <p className="text-2xl font-bold text-zinc-100">{lastLog ? lastLog.fatigue : "—"}<span className="text-sm text-zinc-500">/5</span></p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Dernière fatigue</p>
        </div>
      </div>

      {/* Prochaine séance */}
      {prochaine && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Prochaine séance</h2>
          <Link href={`/seance/${prochaine.seance.id}`}>
            <div className={`rounded-xl border p-4 ${BLOC_COLORS[prochaine.bloc.couleur] ?? "border-zinc-700"} hover:opacity-90 transition-opacity`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium opacity-70">Bloc {prochaine.bloc.numero} — {prochaine.bloc.nom}</span>
                <Zap className="h-4 w-4 opacity-70" />
              </div>
              <p className="font-bold text-zinc-100 text-lg">{prochaine.seance.nom}</p>
              <p className="text-xs text-zinc-400 mt-1">{prochaine.seance.freq}</p>
              {prochaine.seance.note && (
                <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{prochaine.seance.note}</p>
              )}
              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold opacity-80">
                <Calendar className="h-3.5 w-3.5" />
                Commencer la séance →
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Accès rapide coach */}
      <div className="mb-6">
        <Link href="/chat">
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 flex items-center gap-3 hover:bg-orange-500/15 transition-colors">
            <div className="h-9 w-9 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-orange-400">Coach Claude</p>
              {lastAnalyse ? (
                <p className="text-xs text-zinc-400 truncate mt-0.5">
                  Dernière analyse — {lastAnalyse.seance.nom} · {new Date(lastAnalyse.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </p>
              ) : (
                <p className="text-xs text-zinc-500 mt-0.5">Pose-moi une question sur ton entraînement</p>
              )}
            </div>
            <span className="text-xs text-orange-400 font-medium flex-shrink-0">Ouvrir →</span>
          </div>
        </Link>
      </div>

      {/* Suivi genou */}
      {genouLogs.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-red-400" />
            Douleur genou (14 dernières séances)
          </h2>
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3">
            <div className="flex items-end gap-1.5 h-10">
              {genouLogs.slice().reverse().map((log, i) => {
                const heights = ["h-1", "h-3", "h-5", "h-8"];
                const colors = ["bg-green-500", "bg-yellow-400", "bg-orange-400", "bg-red-500"];
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end">
                    <div className={`w-full rounded-sm ${heights[log.genouDouleur]} ${colors[log.genouDouleur]}`} />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-[9px] text-zinc-600">
              <span>Il y a {genouLogs.length} séances</span>
              <span>Dernière</span>
            </div>
          </div>
        </div>
      )}

      {/* Programme blocs */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          Programme
        </h2>
        <div className="space-y-2">
          {blocs.map((bloc) => (
            <BlocCard key={bloc.id} bloc={bloc} />
          ))}
        </div>
      </div>

      {/* Dernières séances */}
      {recentLogs.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Historique récent</h2>
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <Link key={log.id} href={`/historique/${log.id}`}>
                <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 flex items-center gap-3 hover:border-zinc-600 transition-colors">
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${getBlocDot(log.seance.bloc.couleur)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{log.seance.nom}</p>
                    <p className="text-xs text-zinc-500">{new Date(log.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    {log.genouDouleur > 0 && <span className="text-red-400">🦵 {log.genouDouleur}</span>}
                    <span>💪 {log.fatigue}/5</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
