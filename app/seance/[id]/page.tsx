"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

type Exercice = {
  id: string;
  nom: string;
  series: number;
  reps: string;
  chargeTarget: string;
  unite: string | null;
  isGenou: boolean;
  ordre: number;
};

type PreviousSerie = {
  exerciceId: string;
  chargeReelle: string;
  repsReelles: string;
  ressenti: string;
};

type Seance = {
  id: string;
  nom: string;
  type: string;
  freq: string;
  note: string | null;
  bloc: { nom: string; couleur: string; numero: number };
  exercices: Exercice[];
  logs: { series: PreviousSerie[] }[];
};

type SerieLog = {
  exerciceId: string;
  numeroSerie: number;
  chargeReelle: string;
  repsReelles: string;
  ressenti: "facile" | "bon" | "dur" | "trop";
};

const RESSENTI_COLORS = {
  facile: "bg-green-500/20 text-green-400 border-green-500/40",
  bon: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  dur: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  trop: "bg-red-500/20 text-red-400 border-red-500/40",
};

export default function SeancePage() {
  const { id } = useParams<{ id: string }>();
  const [seance, setSeance] = useState<Seance | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"log" | "bilan" | "analyse">("log");
  const [series, setSeries] = useState<SerieLog[]>([]);
  const [currentExoIdx, setCurrentExoIdx] = useState(0);
  const [genouDouleur, setGenouDouleur] = useState(0);
  const [fatigue, setFatigue] = useState(3);
  const [noteLibre, setNoteLibre] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [analyseResult, setAnalyseResult] = useState<{ analyse: string; alertes: string[]; actions: unknown[] } | null>(null);

  useEffect(() => {
    fetch(`/api/seances/${id}`)
      .then((r) => r.json())
      .then((data) => { setSeance(data?.exercices ? data : null); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
    </div>
  );
  if (!seance) return <div className="p-4 text-app-fg2">Séance introuvable</div>;

  const exos = seance.exercices;
  const currentExo = exos[currentExoIdx];

  const getSeriesForExo = (exoId: string) =>
    series.filter((s) => s.exerciceId === exoId);

  const addSerie = (exoId: string, data: Omit<SerieLog, "exerciceId" | "numeroSerie">) => {
    const existing = getSeriesForExo(exoId);
    setSeries((prev) => [
      ...prev,
      { exerciceId: exoId, numeroSerie: existing.length + 1, ...data },
    ]);
  };

  const handleSkip = async () => {
    setSkipping(true);
    try {
      await fetch("/api/skip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seanceId: id }),
      });
      window.location.href = "/s-entrainer";
    } finally {
      setSkipping(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const logRes = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seanceId: id, genouDouleur, fatigue, noteLibre, series }),
      });
      const log = await logRes.json();

      setStep("analyse");
      const analyseRes = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logSeanceId: log.id }),
      });
      const analyseData = await analyseRes.json();
      if (analyseData.error) {
        setAnalyseResult({ analyse: `Erreur API : ${analyseData.error}`, alertes: [], actions: [] });
      } else {
        try {
          const text: string = analyseData.reponse ?? "";
          const clean = text.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
          const parsed = JSON.parse(clean);
          setAnalyseResult(parsed);
        } catch {
          setAnalyseResult({ analyse: analyseData.reponse || "Réponse vide ou invalide", alertes: [], actions: [] });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "analyse") {
    return (
      <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-orange-500 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-app-fg1">Analyse Claude</h1>
            <p className="text-xs text-app-fg3">Séance terminée — {seance.nom}</p>
          </div>
        </div>

        {submitting ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
            <p className="text-app-fg2 text-sm">Analyse en cours…</p>
          </div>
        ) : analyseResult ? (
          <div className="space-y-4">
            {analyseResult.alertes?.length > 0 && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4">
                {analyseResult.alertes.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-red-400 text-sm">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-xl bg-app-card border border-app-edge p-4">
              <p className="text-xs text-app-fg3 mb-2 font-semibold uppercase tracking-wider">Analyse</p>
              <p className="text-app-fg1 text-sm leading-relaxed">{analyseResult.analyse}</p>
            </div>

            {analyseResult.actions?.length > 0 && (
              <div className="rounded-xl bg-app-card border border-app-edge p-4">
                <p className="text-xs text-app-fg3 mb-3 font-semibold uppercase tracking-wider">Ajustements appliqués</p>
                <div className="space-y-2">
                  {(analyseResult.actions as Array<{ type: string; raison: string; nouvelleCharge?: string; nouvellesReps?: string }>).map((action, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-orange-400 font-mono text-xs bg-orange-500/10 rounded px-1.5 py-0.5 flex-shrink-0">
                        {action.type}
                      </span>
                      <span className="text-app-fg2">{action.raison}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => { window.location.href = "/s-entrainer"; }}
              className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              Retour aux séances
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  if (step === "bilan") {
    return (
      <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
        <button onClick={() => setStep("log")} className="flex items-center gap-1 text-app-fg2 text-sm mb-6 hover:text-app-fg1">
          <ChevronLeft className="h-4 w-4" /> Retour
        </button>
        <h1 className="text-xl font-bold text-app-fg1 mb-1">Bilan de séance</h1>
        <p className="text-sm text-app-fg3 mb-6">{seance.nom}</p>

        <div className="space-y-6">
          <div>
            <label className="text-xs font-semibold text-app-fg3 uppercase tracking-wider mb-3 block">
              Douleur genou droit 🦵
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { val: 0, label: "Aucune", color: "bg-green-500/20 text-green-400 border-green-500/40" },
                { val: 1, label: "Légère", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40" },
                { val: 2, label: "Modérée", color: "bg-orange-500/20 text-orange-400 border-orange-500/40" },
                { val: 3, label: "Forte", color: "bg-red-500/20 text-red-400 border-red-500/40" },
              ].map(({ val, label, color }) => (
                <button
                  key={val}
                  onClick={() => setGenouDouleur(val)}
                  className={`rounded-xl border py-2.5 text-xs font-medium transition-all ${
                    genouDouleur === val ? color : "border-app-edge text-app-fg3 bg-app-card"
                  }`}
                >
                  {val}<br /><span className="text-[9px]">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-app-fg3 uppercase tracking-wider mb-3 block">
              Fatigue globale 💪
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => setFatigue(val)}
                  className={`rounded-xl border py-3 text-sm font-bold transition-all ${
                    fatigue === val
                      ? "border-orange-500/60 bg-orange-500/20 text-orange-400"
                      : "border-app-edge text-app-fg3 bg-app-card"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-app-fg3 uppercase tracking-wider mb-2 block">
              Note libre (optionnel)
            </label>
            <textarea
              value={noteLibre}
              onChange={(e) => setNoteLibre(e.target.value)}
              placeholder="Comment tu te sens ? Douleurs particulières ?"
              className="w-full rounded-xl bg-app-card border border-app-edge p-3 text-sm text-app-fg1 placeholder-app-fg3 resize-none h-20 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Envoi…</> : "Terminer et analyser avec Claude →"}
          </button>
        </div>
      </div>
    );
  }

  // Log step
  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/s-entrainer" className="flex items-center justify-center h-8 w-8 rounded-lg bg-app-card border border-app-edge hover:border-app-fg3 shrink-0">
          <ChevronLeft className="h-4 w-4 text-app-fg2" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-app-fg1 truncate">{seance.nom}</h1>
          <p className="text-xs text-app-fg3">Bloc {seance.bloc.numero} — {seance.bloc.nom} · {seance.freq}</p>
        </div>
        <button
          onClick={handleSkip}
          disabled={skipping}
          className="shrink-0 text-xs text-app-fg3 border border-app-edge rounded-lg px-2.5 py-1.5 hover:border-app-fg2 hover:text-app-fg1 transition-colors disabled:opacity-40"
        >
          {skipping ? "…" : "Passer"}
        </button>
      </div>

      {seance.note && (
        <div className="rounded-xl bg-app-card border border-app-edge p-3 mb-4 text-xs text-app-fg2">
          ℹ️ {seance.note}
        </div>
      )}

      {/* Progress tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {exos.map((exo, i) => {
          const done = getSeriesForExo(exo.id).length;
          const isCurrent = i === currentExoIdx;
          const isComplete = done >= exo.series;
          return (
            <button
              key={exo.id}
              onClick={() => setCurrentExoIdx(i)}
              className={`flex-shrink-0 rounded-lg px-2 py-1 text-[10px] font-medium transition-all border ${
                isCurrent ? "border-orange-500/60 bg-orange-500/20 text-orange-400" :
                isComplete ? "border-green-500/40 bg-green-500/10 text-green-400" :
                "border-app-edge text-app-fg3 bg-app-card"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Current exercise */}
      {currentExo && (
        <ExerciceLogger
          key={currentExo.id}
          exo={currentExo}
          existingSeries={getSeriesForExo(currentExo.id)}
          previousSeries={seance.logs[0]?.series.filter((s) => s.exerciceId === currentExo.id) ?? []}
          onAddSerie={(data) => addSerie(currentExo.id, data)}
          onNext={() => {
            if (currentExoIdx < exos.length - 1) setCurrentExoIdx(currentExoIdx + 1);
            else setStep("bilan");
          }}
          isLast={currentExoIdx === exos.length - 1}
        />
      )}
    </div>
  );
}

function ExerciceLogger({
  exo,
  existingSeries,
  previousSeries,
  onAddSerie,
  onNext,
  isLast,
}: {
  exo: Exercice;
  existingSeries: SerieLog[];
  previousSeries: PreviousSerie[];
  onAddSerie: (data: Omit<SerieLog, "exerciceId" | "numeroSerie">) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const lastSerie = previousSeries[0];
  const [charge, setCharge] = useState(
    lastSerie?.chargeReelle.replace(/[^0-9.]/g, "") ||
    exo.chargeTarget.replace(/[^0-9.]/g, "") || ""
  );
  const [reps, setReps] = useState(exo.reps.split("-")[0] || "");
  const [ressenti, setRessenti] = useState<"facile" | "bon" | "dur" | "trop">("bon");

  const remainingSeries = exo.series - existingSeries.length;
  const isDone = existingSeries.length >= exo.series;

  return (
    <div>
      <div className={`rounded-xl border p-4 mb-4 ${exo.isGenou ? "border-red-500/40 bg-red-500/5" : "border-app-edge bg-app-card"}`}>
        <div className="flex items-start justify-between mb-1">
          <h2 className="font-bold text-app-fg1 text-lg">{exo.nom}</h2>
          {exo.isGenou && (
            <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-2 py-0.5">
              <AlertTriangle className="h-3 w-3" /> Genou ⚠️
            </span>
          )}
        </div>
        <p className="text-sm text-app-fg2">
          {exo.series} séries × {exo.reps} {exo.unite && `@ ${exo.chargeTarget} ${exo.unite}`}
        </p>
        <p className="text-xs text-app-fg3 mt-1">
          {existingSeries.length}/{exo.series} séries faites
        </p>
      </div>

      {/* Previous series */}
      {existingSeries.length > 0 && (
        <div className="space-y-1.5 mb-4">
          {existingSeries.map((s, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-app-card border border-app-edge px-3 py-2 text-sm">
              <span className="text-app-fg3 text-xs w-4">#{s.numeroSerie}</span>
              <span className="text-app-fg2 flex-1">{s.chargeReelle}{exo.unite} × {s.repsReelles}</span>
              <span className={`text-xs px-2 py-0.5 rounded-md border ${RESSENTI_COLORS[s.ressenti]}`}>{s.ressenti}</span>
            </div>
          ))}
        </div>
      )}

      {!isDone ? (
        <div className="rounded-xl bg-app-card border border-app-edge p-4 space-y-4">
          <p className="text-xs text-app-fg3 font-semibold">Série {existingSeries.length + 1} / {exo.series}</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-app-fg3 mb-1 block">
                Charge {exo.unite && `(${exo.unite})`}
                {lastSerie && (
                  <span className="ml-2 text-app-fg3">
                    · Dernière fois: {lastSerie.chargeReelle}{exo.unite ? ` ${exo.unite}` : ""} × {lastSerie.repsReelles}
                  </span>
                )}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={charge}
                onChange={(e) => setCharge(e.target.value)}
                placeholder={exo.chargeTarget}
                className="w-full rounded-lg bg-app-deep border border-app-edge px-3 py-2.5 text-sm text-app-fg1 placeholder-app-fg3 focus:outline-none focus:border-orange-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-app-fg3 mb-1 block">Reps</label>
              <input
                type="text"
                inputMode="numeric"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder={exo.reps}
                className="w-full rounded-lg bg-app-deep border border-app-edge px-3 py-2.5 text-sm text-app-fg1 placeholder-app-fg3 focus:outline-none focus:border-orange-500/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-app-fg3 mb-2 block">Ressenti</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(["facile", "bon", "dur", "trop"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRessenti(r)}
                  className={`rounded-lg border py-2 text-xs font-medium transition-all ${
                    ressenti === r ? RESSENTI_COLORS[r] : "border-app-edge text-app-fg3 bg-app-card"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              onAddSerie({ chargeReelle: charge || exo.chargeTarget, repsReelles: reps || exo.reps, ressenti });
              setCharge(charge);
              setReps(reps);
            }}
            className="w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
          >
            Valider série {existingSeries.length + 1}
            {remainingSeries > 1 && ` (${remainingSeries - 1} restante${remainingSeries - 1 > 1 ? "s" : ""})`}
          </button>
        </div>
      ) : (
        <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-4 text-center">
          <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-green-400">Exercice terminé !</p>
          <button
            onClick={onNext}
            className="mt-3 w-full rounded-xl bg-app-deep border border-app-edge py-2.5 text-sm font-medium text-app-fg1 hover:bg-app-deep transition-colors"
          >
            {isLast ? "Passer au bilan →" : "Exercice suivant →"}
          </button>
        </div>
      )}
    </div>
  );
}
