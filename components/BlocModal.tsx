"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ChevronRight, Zap, MapPin } from "lucide-react";

const TYPE_COLOR: Record<string, string> = {
  force:    "bg-blue-500/10 text-blue-400",
  cardio:   "bg-green-500/10 text-green-400",
  circuit:  "bg-purple-500/10 text-purple-400",
  test:     "bg-yellow-500/10 text-yellow-400",
  mobilite: "bg-zinc-700 text-zinc-400",
};

const BLOC_TEXT: Record<string, string> = {
  "#4ade80": "text-green-400",
  "#facc15": "text-yellow-400",
  "#f97316": "text-orange-400",
  "#818cf8": "text-indigo-400",
};
const BLOC_BAR: Record<string, string> = {
  "#4ade80": "bg-green-400",
  "#facc15": "bg-yellow-400",
  "#f97316": "bg-orange-400",
  "#818cf8": "bg-indigo-400",
};
const BLOC_RING: Record<string, string> = {
  "#4ade80": "ring-green-500/30",
  "#facc15": "ring-yellow-500/30",
  "#f97316": "ring-orange-500/30",
  "#818cf8": "ring-indigo-500/30",
};

type Seance = {
  id: string;
  nom: string;
  type: string;
  jour: string;
  lieu: string;
  exercices: { id: string; nom: string; typeExercice: string }[];
  logs: { statut: string }[];
};

type Bloc = {
  id: string;
  numero: number;
  nom: string;
  semaines: string;
  couleur: string;
  seances: Seance[];
};

function BlocDetail({ bloc, onClose }: { bloc: Bloc; onClose: () => void }) {
  const done = bloc.seances.filter((s) => s.logs.length > 0 && s.logs[0].statut === "completee").length;
  const total = bloc.seances.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const textColor = BLOC_TEXT[bloc.couleur] ?? "text-zinc-200";
  const barColor = BLOC_BAR[bloc.couleur] ?? "bg-orange-400";
  const ringColor = BLOC_RING[bloc.couleur] ?? "ring-zinc-700";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
        <div className={`bg-zinc-950 rounded-t-3xl ring-1 ${ringColor} max-h-[80vh] flex flex-col`}>
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="h-1 w-10 rounded-full bg-zinc-700" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-2 pb-4 flex-shrink-0">
            <div>
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider mb-0.5">
                Bloc {bloc.numero} · Semaines {bloc.semaines}
              </p>
              <h2 className={`text-xl font-bold ${textColor}`}>{bloc.nom}</h2>
            </div>
            <button onClick={onClose} className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors mt-1">
              <X className="h-4 w-4 text-zinc-400" />
            </button>
          </div>

          {/* Progress */}
          <div className="px-5 pb-4 flex-shrink-0">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-500">{done} séances complétées</span>
              <span className={`font-bold ${textColor}`}>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-800">
              <div className={`h-1.5 rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="w-full h-px bg-zinc-800 flex-shrink-0" />

          {/* Sessions list — scrollable */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-2 pb-6">
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              {total} séances / semaine
            </p>
            {bloc.seances.map((seance, i) => {
              const isDone = seance.logs[0]?.statut === "completee";
              const isSkipped = seance.logs[0]?.statut === "skippee";
              const hasOlympique = seance.exercices.some((e) => e.typeExercice === "olympique");

              return (
                <Link key={seance.id} href={`/seance/${seance.id}`} onClick={onClose}>
                  <div className={`rounded-2xl border p-3.5 transition-colors ${
                    isDone ? "border-green-500/20 bg-zinc-900/60 opacity-70"
                    : isSkipped ? "border-zinc-800/50 bg-zinc-900/40 opacity-50"
                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center h-9 w-9 rounded-xl bg-zinc-800 shrink-0">
                        <span className="text-[8px] text-zinc-500 font-bold">{seance.jour.slice(0, 3).toUpperCase()}</span>
                        <span className="text-xs font-bold text-zinc-300">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-zinc-200 truncate">{seance.nom}</p>
                          {hasOlympique && <Zap className="h-3 w-3 text-yellow-400 shrink-0" />}
                          {seance.lieu === "dehors" && <MapPin className="h-3 w-3 text-blue-400 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium ${TYPE_COLOR[seance.type] ?? TYPE_COLOR.force}`}>
                            {seance.type}
                          </span>
                          <span className="text-[10px] text-zinc-600">{seance.exercices.length} exercices</span>
                          {isDone && <span className="text-[9px] text-green-400 font-semibold">✓</span>}
                          {isSkipped && <span className="text-[9px] text-zinc-600">passée</span>}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-600 shrink-0" />
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* CTA */}
            <Link href={`/s-entrainer?bloc=${bloc.numero}`} onClick={onClose}>
              <div className={`mt-3 rounded-2xl border ${BLOC_RING[bloc.couleur] ?? "border-zinc-700"} p-3.5 flex items-center justify-center gap-2 hover:opacity-80 transition-opacity`}>
                <span className={`text-sm font-semibold ${textColor}`}>Voir la semaine complète →</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export function BlocCard({ bloc }: { bloc: Bloc }) {
  const [open, setOpen] = useState(false);
  const done = bloc.seances.filter((s) => s.logs.length > 0 && s.logs[0].statut === "completee").length;
  const total = bloc.seances.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left rounded-xl bg-zinc-900 border border-zinc-800 p-3 flex items-center gap-3 hover:border-zinc-600 transition-colors active:scale-[0.99]"
      >
        <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${BLOC_BAR[bloc.couleur] ?? "bg-zinc-400"}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-zinc-200">Bloc {bloc.numero} — {bloc.nom}</span>
            <span className="text-xs text-zinc-500">S{bloc.semaines}</span>
          </div>
          <div className="h-1 rounded-full bg-zinc-800">
            <div className={`h-1 rounded-full ${BLOC_BAR[bloc.couleur] ?? "bg-orange-500"} transition-all`} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <span className="text-xs text-zinc-500 flex-shrink-0">{done}/{total}</span>
      </button>

      {open && <BlocDetail bloc={bloc} onClose={() => setOpen(false)} />}
    </>
  );
}
