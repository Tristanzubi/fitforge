"use client";

import { useState } from "react";
import { ChevronLeft, Utensils, Dumbbell, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

// ─── Accordion ───────────────────────────────────────────────────────────────

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="text-sm font-semibold text-zinc-200">{title}</span>
        {open
          ? <ChevronUp className="h-4 w-4 text-zinc-500 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />
        }
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800 pt-3 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

function Tag({ children, color = "zinc" }: { children: React.ReactNode; color?: "orange" | "green" | "blue" | "zinc" }) {
  const colors = {
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    green: "bg-green-500/10 text-green-400 border-green-500/30",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    zinc: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };
  return (
    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md border ${colors[color]}`}>
      {children}
    </span>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function NutritionSection() {
  return (
    <div className="space-y-3">

      {/* Card résumé */}
      <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-4 mb-4">
        <p className="text-xs text-orange-400 font-semibold uppercase tracking-wider mb-2">Tes objectifs (77 kg)</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xl font-bold text-zinc-100">154g</p>
            <p className="text-[10px] text-zinc-500">Protéines/j</p>
          </div>
          <div>
            <p className="text-xl font-bold text-zinc-100">2.7L</p>
            <p className="text-[10px] text-zinc-500">Eau/j</p>
          </div>
          <div>
            <p className="text-xl font-bold text-zinc-100">~3000</p>
            <p className="text-[10px] text-zinc-500">kcal/j (aprx)</p>
          </div>
        </div>
      </div>

      <Accordion title="🥩 Protéines — pourquoi et combien ?">
        <p>Les protéines reconstruisent le muscle après l&apos;effort. Pour un rugbyman en préparation physique, <strong className="text-zinc-200">2 g/kg/j</strong> est le minimum — soit <strong className="text-zinc-200">154 g/jour</strong> pour toi.</p>
        <p className="mt-2"><strong className="text-zinc-200">Sources efficaces :</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1 text-zinc-400">
          <li>Poulet / dinde — ~30 g / 100 g cuit</li>
          <li>Œufs — 6 g / œuf (blanc + jaune)</li>
          <li>Fromage blanc 0% — 10 g / 100 g</li>
          <li>Thon en boîte — 26 g / 100 g</li>
          <li>Lentilles / pois chiches — 8 g / 100 g (+ glucides utiles)</li>
          <li>Protéine whey — pratique post-séance si difficile d&apos;atteindre l&apos;objectif</li>
        </ul>
        <p className="mt-2 text-zinc-500 text-xs">💡 Répartis en 3-4 prises dans la journée — le corps ne stocke pas bien plus de ~40 g à la fois.</p>
      </Accordion>

      <Accordion title="🍚 Glucides — le carburant de la séance">
        <p>Les glucides alimentent l&apos;intensité. Pas ennemi — <strong className="text-zinc-200">allié essentiel</strong> pour les séances force et vitesse.</p>
        <p className="mt-2"><strong className="text-zinc-200">Avant la séance (1h30 - 2h avant) :</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Riz, patate douce, flocons d&apos;avoine, pain complet</li>
          <li>Évite les graisses et fibres en excès (digestion lente)</li>
          <li>Quantité : 1-1.5 g/kg (~80-115 g de glucides)</li>
        </ul>
        <p className="mt-3"><strong className="text-zinc-200">Après la séance (dans les 45 min) :</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Fenêtre anabolique : glucides rapides + protéines</li>
          <li>Ex : riz + poulet, pain + fromage blanc + banane, shake whey + banane</li>
        </ul>
        <p className="mt-3"><strong className="text-zinc-200">Jours cardio / footing :</strong></p>
        <p className="text-zinc-500">Légèrement moins de glucides si séance facile — maintiens les protéines.</p>
      </Accordion>

      <Accordion title="💧 Hydratation — souvent négligée">
        <p>Objectif de base : <strong className="text-zinc-200">35 ml/kg/j = 2.7 L</strong>. Ajoute <strong className="text-zinc-200">750 ml à 1 L</strong> par heure d&apos;entraînement.</p>
        <p className="mt-2">Indicateur simple : urine claire à jaune paille = hydratation correcte.</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Bois avant d&apos;avoir soif — la soif arrive trop tard</li>
          <li>Ajoute une pincée de sel après les séances cardio longues (electrolytes)</li>
          <li>Café/thé comptent, l&apos;alcool déshydrate (double effet les jours suivants)</li>
        </ul>
      </Accordion>

      <Accordion title="⏰ Timing autour de la séance">
        <div className="space-y-3">
          <div>
            <Tag color="orange">2h avant</Tag>
            <p className="mt-1">Repas complet : riz/pâtes + protéine maigre + légumes (pas trop fibreux)</p>
          </div>
          <div>
            <Tag color="blue">30min avant</Tag>
            <p className="mt-1">Si faim : 1 banane ou 1 poignée de dattes — glucides rapides sans surcharger</p>
          </div>
          <div>
            <Tag color="green">Après la séance</Tag>
            <p className="mt-1">Dans les 45 min : protéine (30-40 g) + glucides rapides. C&apos;est le moment où la synthèse protéique est maximale.</p>
          </div>
        </div>
      </Accordion>

    </div>
  );
}

function ChargesSection() {
  return (
    <div className="space-y-3">

      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 mb-4">
        <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">Principe de base</p>
        <p className="text-sm text-zinc-300">Le <strong>chargeTarget</strong> est un point de départ, pas une obligation. Écoute ton corps — certains jours tu dépasses, d&apos;autres tu recules. Les deux sont normaux.</p>
      </div>

      <Accordion title="📊 Comprendre les ressentis (RPE)">
        <p>L&apos;application utilise 4 ressentis. Voici comment les interpréter honnêtement :</p>
        <div className="space-y-2 mt-2">
          <div className="flex items-start gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 border border-green-500/30 font-semibold shrink-0 mt-0.5">facile</span>
            <p>RPE 6 — tu aurais pu faire 4-5 reps de plus. Charge trop légère pour cette semaine.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/30 font-semibold shrink-0 mt-0.5">bon</span>
            <p>RPE 7-8 — effort réel, 1-2 reps de réserve. Zone idéale pour la force et l&apos;hypertrophie.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-semibold shrink-0 mt-0.5">dur</span>
            <p>RPE 9 — limite, 0-1 rep de réserve. Acceptable sur les dernières séries des blocs de puissance.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/30 font-semibold shrink-0 mt-0.5">trop</span>
            <p>RPE 10 — échec ou quasi-échec. Si récurrent, la charge est trop haute. L&apos;app baissera automatiquement (-10%).</p>
          </div>
        </div>
      </Accordion>

      <Accordion title="🤖 Règles de progression automatique">
        <p>L&apos;app ajuste tes charges après chaque séance enregistrée :</p>
        <div className="space-y-3 mt-2">
          <div className="rounded-lg bg-zinc-800 p-3">
            <p className="text-green-400 font-semibold text-xs mb-1">Progression +5%</p>
            <p>Si toutes les séries d&apos;un exercice sont en <Tag color="green">facile</Tag> lors de <strong className="text-zinc-200">2 séances consécutives</strong> → charge augmentée de 5%, arrondie à 0.5 kg près.</p>
          </div>
          <div className="rounded-lg bg-zinc-800 p-3">
            <p className="text-red-400 font-semibold text-xs mb-1">Réduction -10%</p>
            <p>Si ≥ la moitié des séries sont en <Tag>trop</Tag> → charge réduite de 10%. Ça arrive, pas de problème.</p>
          </div>
          <div className="rounded-lg bg-zinc-800 p-3">
            <p className="text-zinc-400 font-semibold text-xs mb-1">Mise à jour neutre</p>
            <p>Sinon, le chargeTarget se met à jour avec la meilleure charge que tu as réellement utilisée ce jour-là.</p>
          </div>
        </div>
        <p className="mt-2 text-zinc-500 text-xs">⚡ Les exercices olympiques (KB clean, KB swing) et les exercices genou-sensibles ne sont jamais auto-ajustés.</p>
      </Accordion>

      <Accordion title="📈 Progression semaine par semaine">
        <p>Chaque séance a une note qui indique les charges prévues semaine par semaine. Exemple :</p>
        <div className="rounded-lg bg-zinc-800 p-3 mt-2 font-mono text-xs text-zinc-300">
          S1: Dév 2×12 · S2: 2×14 · S3: 2×16
        </div>
        <p className="mt-2">Ça signifie :</p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Semaine 1 du bloc → 2 haltères de 12 kg</li>
          <li>Semaine 2 → 2 × 14 kg</li>
          <li>Semaine 3 → 2 × 16 kg</li>
        </ul>
        <p className="mt-2 text-zinc-500">Navigue entre les semaines dans la page S&apos;entraîner avec les flèches ← →.</p>
      </Accordion>

      <Accordion title="⚠️ Quand reculer ou s'arrêter ?">
        <p><strong className="text-zinc-200">Fatigue musculaire normale</strong> = courbatures, muscles fatigués 24-48h après. Tu continues.</p>
        <p className="mt-2"><strong className="text-red-400">Signaux d&apos;arrêt</strong> :</p>
        <ul className="list-disc list-inside space-y-1 mt-1 text-red-400/80">
          <li>Douleur articulaire (genou, épaule, poignet) pendant l&apos;effort</li>
          <li>Douleur qui persiste plus de 48h après la séance</li>
          <li>Perte de technique sur un mouvement malgré la charge habituelle</li>
          <li>4+ jours de fatigue profonde sans récupération</li>
        </ul>
        <p className="mt-2 text-zinc-500">En cas de doute, utilise le Coach Claude — décris la douleur et il t&apos;orientera.</p>
      </Accordion>

    </div>
  );
}

function VariantesSection() {
  return (
    <div className="space-y-3">

      <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 mb-4">
        <p className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-1">Principe</p>
        <p className="text-sm text-zinc-300">Si un exercice est trop dur ou trop facile, utilise une variante plutôt que de sauter la séance. La progression est linéaire — tu y arriveras.</p>
      </div>

      <Accordion title="🏋️ Tractions — progressions">
        <div className="space-y-3">
          <div>
            <Tag color="green">Plus facile</Tag>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Tractions assistées avec élastique (passer sous les genoux)</li>
              <li>Rowing inversé sous une table ou barre basse</li>
              <li>Négatives : monter en sautant, descendre lentement en 5 sec</li>
            </ul>
          </div>
          <div>
            <Tag color="orange">Plus difficile</Tag>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Lestées avec sac à dos (+5 kg, +8 kg…)</li>
              <li>Prise large → serrée → neutre (difficulté croissante pour le dos)</li>
              <li>Tempo lent : 3 sec montée / 2 sec descente</li>
            </ul>
          </div>
        </div>
      </Accordion>

      <Accordion title="🦵 Pistol squat — progressions">
        <div className="space-y-3">
          <div>
            <Tag color="green">Étape 1 — Squat assisté</Tag>
            <p className="mt-1">Tenir un poteau ou cadre de porte pour garder l&apos;équilibre. Faire le mouvement complet.</p>
          </div>
          <div>
            <Tag color="green">Étape 2 — Box pistol</Tag>
            <p className="mt-1">Descendre sur une boîte/chaise basse (30 cm), se relever sur une jambe. Réduit l&apos;amplitude.</p>
          </div>
          <div>
            <Tag color="blue">Étape 3 — PDC complet</Tag>
            <p className="mt-1">Pistol squat complet au sol, sans aide. Pied libre tendu devant.</p>
          </div>
          <div>
            <Tag color="orange">Étape 4 — Lesté</Tag>
            <p className="mt-1">Tenir un KB contre la poitrine (12 → 16 → 20 kg).</p>
          </div>
        </div>
      </Accordion>

      <Accordion title="⚡ KB clean — technique clé">
        <p>Le clean n&apos;est pas un mouvement des bras — c&apos;est une extension de hanches explosive.</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li><strong className="text-zinc-200">Départ :</strong> KB entre les jambes, dos plat, prise neutre</li>
          <li><strong className="text-zinc-200">Phase pull :</strong> pousser le sol, extension rapide hanches + genoux</li>
          <li><strong className="text-zinc-200">Phase catch :</strong> coude qui descend vite sous le KB, poignet en supination, KB contre l&apos;avant-bras (pas dans la paume)</li>
          <li><strong className="text-zinc-200">Erreur fréquente :</strong> tirer avec les bras → le KB part trop loin, tu t&apos;écorches le poignet</li>
        </ul>
        <p className="mt-2 text-zinc-500">Si tu t&apos;écorches le poignet → la trajectoire est trop loin du corps. Garde le KB proche.</p>
      </Accordion>

      <Accordion title="🏃 KB swing — 2 styles">
        <div className="space-y-3">
          <div>
            <Tag color="blue">Swing russe (programme)</Tag>
            <p className="mt-1">KB monte jusqu&apos;aux épaules (hauteur yeux). Moins de contrainte épaule, meilleur focus fessiers/ischios. C&apos;est le style utilisé dans le programme.</p>
          </div>
          <div>
            <Tag color="zinc">Swing américain (variante)</Tag>
            <p className="mt-1">KB au-dessus de la tête. Plus de travail des épaules, moins recommandé si mobilité thoracique limitée.</p>
          </div>
          <p><strong className="text-zinc-200">Clé du swing :</strong> le mouvement vient des hanches (hip hinge), pas du dos ni des bras. Si tu ressens le dos → réduire la charge et retravailler la technique.</p>
        </div>
      </Accordion>

      <Accordion title="🤸 Bulgarian split squat — astuces">
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-zinc-200">Pied arrière :</strong> pointe du pied sur la surface — si douleur genou avant, essaie le dessus du pied à plat</li>
          <li><strong className="text-zinc-200">Distance :</strong> jambe avant assez loin pour que le genou ne dépasse pas trop le pied à la descente</li>
          <li><strong className="text-zinc-200">Difficulté :</strong> plus la surface est haute, plus c&apos;est difficile. Commence avec une chaise basse (40 cm), monte à canapé (50 cm)</li>
          <li><strong className="text-zinc-200">Charge :</strong> haltères tenus en bas (neutre) {`>`} KB en goblet {`>`} barre (indisponible ici)</li>
        </ul>
      </Accordion>

      <Accordion title="🤲 Turkish get-up — apprendre par étapes">
        <p>Ne jamais essayer le mouvement complet sans maîtriser chaque phase :</p>
        <ol className="list-decimal list-inside space-y-1 mt-1">
          <li>Allongé → assis (1/2 TGU)</li>
          <li>Assis → genou à terre</li>
          <li>Genou à terre → debout</li>
          <li>Faire les 3 en continu, puis l&apos;inverse</li>
        </ol>
        <p className="mt-2 text-zinc-500">Commence avec un verre d&apos;eau (sans le renverser !) ou KB 8-12 kg avant d&apos;utiliser KB 16-24 kg. Regard sur le KB pendant tout le mouvement.</p>
      </Accordion>

      <Accordion title="🔄 Si tu n'as pas le bon matériel">
        <div className="space-y-2">
          <div className="flex gap-2">
            <span className="text-zinc-500 text-xs shrink-0 w-32">KB clean KB24</span>
            <span className="text-xs">→ KB20 avec 1-2 reps de moins, ou 2 KB20 en double clean</span>
          </div>
          <div className="flex gap-2">
            <span className="text-zinc-500 text-xs shrink-0 w-32">Farmer&apos;s carry</span>
            <span className="text-xs">→ Les 2 KB en même temps (KB24 + KB20 = 44 kg total) ou sac à dos lesté</span>
          </div>
          <div className="flex gap-2">
            <span className="text-zinc-500 text-xs shrink-0 w-32">Dips chaises</span>
            <span className="text-xs">→ 2 chaises solides ou bord du canapé — vérifier la stabilité avant de charger</span>
          </div>
          <div className="flex gap-2">
            <span className="text-zinc-500 text-xs shrink-0 w-32">Step-up</span>
            <span className="text-xs">→ Chaise solide (50 cm) ou première marche d&apos;escalier</span>
          </div>
          <div className="flex gap-2">
            <span className="text-zinc-500 text-xs shrink-0 w-32">Tractions lestées</span>
            <span className="text-xs">→ Sac à dos avec bouteilles d&apos;eau ou livres (+5 kg ≈ 5L d&apos;eau)</span>
          </div>
        </div>
      </Accordion>

    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "nutrition", label: "Nutrition", icon: Utensils },
  { id: "charges", label: "Charges", icon: TrendingUp },
  { id: "variantes", label: "Variantes", icon: Dumbbell },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function InfosPage() {
  const [activeTab, setActiveTab] = useState<TabId>("nutrition");

  return (
    <div className="min-h-screen pb-28 px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 shrink-0"
        >
          <ChevronLeft className="h-4 w-4 text-zinc-400" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-zinc-100">Infos & Conseils</h1>
          <p className="text-xs text-zinc-500">Nutrition · Charges · Variantes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold border transition-all ${
              activeTab === id
                ? "border-orange-500/60 bg-orange-500/15 text-orange-400"
                : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "nutrition" && <NutritionSection />}
      {activeTab === "charges" && <ChargesSection />}
      {activeTab === "variantes" && <VariantesSection />}
    </div>
  );
}
