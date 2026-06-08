
"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";

type ExerciceData = {
  nom: string;
  data: { date: string; charge: number; reps: string }[];
};

type StatsData = {
  exercices: ExerciceData[];
  genouData: { date: string; douleur: number }[];
  fatigueData: { date: string; fatigue: number }[];
};

export default function ProgressionPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        if (data.exercices?.[0]) setSelected(data.exercices[0].nom);
      });
  }, []);

  if (!stats) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-5 w-5 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
    </div>
  );

  const selectedData = stats.exercices.find((e) => e.nom === selected);

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      <div className="mb-6 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-orange-400" />
        <h1 className="text-xl font-bold text-zinc-100">Progression</h1>
      </div>

      {stats.exercices.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 text-sm">
          Aucune donnée — commence tes séances !
        </div>
      ) : (
        <>
          {/* Exercise selector */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {stats.exercices.map((e) => (
              <button
                key={e.nom}
                onClick={() => setSelected(e.nom)}
                className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                  selected === e.nom
                    ? "border-orange-500/60 bg-orange-500/20 text-orange-400"
                    : "border-zinc-800 text-zinc-500 bg-zinc-900"
                }`}
              >
                {e.nom}
              </button>
            ))}
          </div>

          {/* Charge chart */}
          {selectedData && selectedData.data.length === 1 && (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">{selected}</p>
                <p className="text-2xl font-bold text-orange-400">{selectedData.data[0].charge} <span className="text-sm text-zinc-500">kg</span></p>
                <p className="text-xs text-zinc-600 mt-0.5">{selectedData.data[0].date} · {selectedData.data[0].reps} reps</p>
              </div>
              <p className="text-xs text-zinc-600 text-right">Refais la séance<br/>pour voir la courbe</p>
            </div>
          )}
          {selectedData && selectedData.data.length > 1 && (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 mb-4">
              <p className="text-xs text-zinc-500 mb-3 font-semibold uppercase tracking-wider">{selected} — Charge (kg)</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={selectedData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#71717a" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#71717a" }} width={30} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: "#a1a1aa" }}
                  />
                  <Line type="monotone" dataKey="charge" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Genou chart */}
          {stats.genouData.length > 1 && (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 mb-4">
              <p className="text-xs text-zinc-500 mb-3 font-semibold uppercase tracking-wider">🦵 Douleur genou</p>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={stats.genouData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#71717a" }} />
                  <YAxis domain={[0, 3]} tick={{ fontSize: 9, fill: "#71717a" }} width={20} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 11 }}
                  />
                  <Line type="monotone" dataKey="douleur" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Fatigue chart */}
          {stats.fatigueData.length > 1 && (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-xs text-zinc-500 mb-3 font-semibold uppercase tracking-wider">💪 Fatigue globale</p>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={stats.fatigueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#71717a" }} />
                  <YAxis domain={[1, 5]} tick={{ fontSize: 9, fill: "#71717a" }} width={20} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 11 }}
                  />
                  <Line type="monotone" dataKey="fatigue" stroke="#4ade80" strokeWidth={2} dot={{ fill: "#4ade80", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
