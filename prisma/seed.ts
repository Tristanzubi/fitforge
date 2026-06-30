import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

type ExoInput = {
  nom: string; series: number; reps: string; chargeTarget: string;
  unite?: string; isGenou?: boolean; typeExercice?: string; ordre: number;
};

function exo(o: ExoInput) {
  return { ...o, isGenou: o.isGenou ?? false, typeExercice: o.typeExercice ?? "force", unite: o.unite ?? "kg" };
}

async function main() {
  const logCount = await prisma.logSeance.count();
  if (logCount > 0) {
    console.error(`❌ SEED BLOQUÉ — ${logCount} séances loggées en base. Supprimer manuellement si intentionnel.`);
    process.exit(1);
  }

  await prisma.chatMessage.deleteMany();
  await prisma.ajustementClaude.deleteMany();
  await prisma.logSerie.deleteMany();
  await prisma.logSeance.deleteMany();
  await prisma.exercice.deleteMany();
  await prisma.seance.deleteMany();
  await prisma.bloc.deleteMany();

  // ─── BLOC 1 — Fondations (S1-3) · 65% 1RM ────────────────────────────────
  // ⚠️ S3 = Vacances → variantes KB maison (voir note de chaque séance)
  await prisma.bloc.create({
    data: {
      numero: 1, nom: "Fondations", semaines: "1-3", couleur: "#4ade80",
      seances: {
        create: [

          // ── LUNDI — Force Haut A ──────────────────────────────────────────
          {
            nom: "Force Haut A", type: "force", freq: "1x/semaine", jour: "Lundi", lieu: "salle",
            note: "Superset: 1A+1B sans récup → 90sec → répéter. 3A+3B idem. S1:DC45×8 · S2:47×8 · S3:2×14kg KB (vacances) — Récup 2-3min",
            exercices: { create: [
              exo({ nom: "1A. Développé couché",    series: 4, reps: "8",     chargeTarget: "45",    ordre: 1 }),
              exo({ nom: "1B. Rowing barre",         series: 4, reps: "10",    chargeTarget: "40",    ordre: 2 }),
              exo({ nom: "Tractions prise large",    series: 5, reps: "5",     chargeTarget: "PDC",   unite: "reps",    ordre: 3 }),
              exo({ nom: "3A. Développé militaire",  series: 3, reps: "10",    chargeTarget: "35",    ordre: 4 }),
              exo({ nom: "3B. Face pulls poulie",    series: 3, reps: "15",    chargeTarget: "léger", unite: "",        ordre: 5 }),
              exo({ nom: "Dips",                     series: 3, reps: "8-10",  chargeTarget: "PDC",   unite: "reps",    ordre: 6 }),
            ]},
          },

          // ── MARDI — Force Bas A ───────────────────────────────────────────
          {
            nom: "Force Bas A", type: "force", freq: "1x/semaine", jour: "Mardi", lieu: "salle",
            note: "Squat clean en premier — SNC frais. Superset 4A+4B. S1:SC40kg · S2:45kg · S3:KB24 (vacances). Récup 2-3min",
            exercices: { create: [
              exo({ nom: "Squat clean ⚡",           series: 4, reps: "4",     chargeTarget: "40",  typeExercice: "olympique",             ordre: 1 }),
              exo({ nom: "Squat barre",               series: 4, reps: "8",     chargeTarget: "60",                                         ordre: 2 }),
              exo({ nom: "Soulevé de terre",          series: 3, reps: "6",     chargeTarget: "80",                                         ordre: 3 }),
              exo({ nom: "4A. Bulgarian split squat", series: 4, reps: "8/j",   chargeTarget: "10",  unite: "kg/hal.", isGenou: true,        ordre: 4 }),
              exo({ nom: "4B. Leg press",             series: 4, reps: "12",    chargeTarget: "80",                                         ordre: 5 }),
            ]},
          },

          // ── MERCREDI — Récup Active ───────────────────────────────────────
          {
            nom: "Récup Active", type: "cardio", freq: "1x/semaine", jour: "Mercredi", lieu: "dehors",
            note: "S1-3: 35min footing zone 2. Récupération active après Force Bas A — arriver frais jeudi",
            exercices: { create: [
              exo({ nom: "Footing zone 2", series: 1, reps: "35min", chargeTarget: "Zone 2", unite: "min", typeExercice: "cardio", ordre: 1 }),
            ]},
          },

          // ── JEUDI — Force Haut B ──────────────────────────────────────────
          {
            nom: "Force Haut B", type: "force", freq: "1x/semaine", jour: "Jeudi", lieu: "salle",
            note: "Superset 1A+1B et 3A. S1:DCPS40×10 · S2:42×10 · S3:2×12kg KB (vacances). Phase concentrique explosive — Récup 2-3min",
            exercices: { create: [
              exo({ nom: "1A. Dév. couché prise serrée", series: 4, reps: "10",   chargeTarget: "40",  ordre: 1 }),
              exo({ nom: "1B. Tractions prise serrée",   series: 4, reps: "6",    chargeTarget: "PDC", unite: "reps", ordre: 2 }),
              exo({ nom: "Push press",                    series: 5, reps: "5",    chargeTarget: "45",  ordre: 3 }),
              exo({ nom: "3A. Tirage vertical poulie",    series: 3, reps: "12",   chargeTarget: "40",  ordre: 4 }),
              exo({ nom: "Curl haltères",                 series: 3, reps: "10",   chargeTarget: "10",  unite: "kg/hal.", ordre: 5 }),
            ]},
          },

          // ── VENDREDI — Force Bas B + Sprints ─────────────────────────────
          {
            nom: "Force Bas B + Sprints", type: "force", freq: "1x/semaine", jour: "Vendredi", lieu: "salle",
            note: "30min muscu max → sprints dehors. S1:6×8sec · S2:7×8sec · S3:8×8sec (2min récup). S3=KB24/SC si vacances",
            exercices: { create: [
              exo({ nom: "Squat clean ⚡",         series: 3, reps: "4",      chargeTarget: "40",  typeExercice: "olympique",         ordre: 1 }),
              exo({ nom: "Romanian deadlift",       series: 3, reps: "8",      chargeTarget: "75",  isGenou: true,                     ordre: 2 }),
              exo({ nom: "Leg press unilatéral",    series: 3, reps: "8/j",    chargeTarget: "70",                                     ordre: 3 }),
              exo({ nom: "Sprints 8sec max",        series: 6, reps: "8sec",   chargeTarget: "Max", unite: "", typeExercice: "cardio", ordre: 4 }),
            ]},
          },

          // ── SAMEDI — Footing Zone 2 ───────────────────────────────────────
          {
            nom: "Footing Zone 2", type: "cardio", freq: "1x/semaine", jour: "Samedi", lieu: "dehors",
            note: "S1-3: 40min allure conversationnelle — terrain plat",
            exercices: { create: [
              exo({ nom: "Footing zone 2", series: 1, reps: "40min", chargeTarget: "Zone 2", unite: "min", typeExercice: "cardio", ordre: 1 }),
            ]},
          },

        ],
      },
    },
  });

  // ─── BLOC 2 — Hypertrophie (S4-6) · 75% 1RM ──────────────────────────────
  await prisma.bloc.create({
    data: {
      numero: 2, nom: "Hypertrophie", semaines: "4-6", couleur: "#facc15",
      seances: {
        create: [

          // ── LUNDI — Force Haut A ──────────────────────────────────────────
          {
            nom: "Force Haut A", type: "force", freq: "1x/semaine", jour: "Lundi", lieu: "salle",
            note: "Superset 1A+1B et 3A+3B. S4:DC52×6 · S5:55×6 · S6:57×6 — Récup 2-3min",
            exercices: { create: [
              exo({ nom: "1A. Développé couché",    series: 4, reps: "6",    chargeTarget: "52",    ordre: 1 }),
              exo({ nom: "1B. Rowing barre",         series: 4, reps: "8",    chargeTarget: "48",    ordre: 2 }),
              exo({ nom: "Tractions prise large",    series: 5, reps: "6",    chargeTarget: "PDC",   unite: "reps",  ordre: 3 }),
              exo({ nom: "3A. Développé militaire",  series: 3, reps: "8",    chargeTarget: "42",    ordre: 4 }),
              exo({ nom: "3B. Face pulls poulie",    series: 3, reps: "15",   chargeTarget: "léger", unite: "",      ordre: 5 }),
              exo({ nom: "Dips",                     series: 3, reps: "6-8",  chargeTarget: "PDC",   unite: "reps",  ordre: 6 }),
            ]},
          },

          // ── MARDI — Force Bas A ───────────────────────────────────────────
          {
            nom: "Force Bas A", type: "force", freq: "1x/semaine", jour: "Mardi", lieu: "salle",
            note: "Squat clean lourd en premier. Superset 4A+4B. S4:SC55kg · S5:60kg · S6:65kg — Récup 2-3min",
            exercices: { create: [
              exo({ nom: "Squat clean ⚡",           series: 4, reps: "4",    chargeTarget: "55",  typeExercice: "olympique",         ordre: 1 }),
              exo({ nom: "Squat barre",               series: 4, reps: "6",    chargeTarget: "70",                                     ordre: 2 }),
              exo({ nom: "Soulevé de terre",          series: 3, reps: "5",    chargeTarget: "90",                                     ordre: 3 }),
              exo({ nom: "4A. Bulgarian split squat", series: 4, reps: "8/j",  chargeTarget: "14",  unite: "kg/hal.", isGenou: true,   ordre: 4 }),
              exo({ nom: "4B. Leg press",             series: 4, reps: "10",   chargeTarget: "110",                                    ordre: 5 }),
            ]},
          },

          // ── MERCREDI — Récup Active ───────────────────────────────────────
          {
            nom: "Récup Active", type: "cardio", freq: "1x/semaine", jour: "Mercredi", lieu: "dehors",
            note: "S4-6: 40min footing zone 2. Récupération active.",
            exercices: { create: [
              exo({ nom: "Footing zone 2", series: 1, reps: "40min", chargeTarget: "Zone 2", unite: "min", typeExercice: "cardio", ordre: 1 }),
            ]},
          },

          // ── JEUDI — Force Haut B ──────────────────────────────────────────
          {
            nom: "Force Haut B", type: "force", freq: "1x/semaine", jour: "Jeudi", lieu: "salle",
            note: "Superset 1A+1B et 3A. S4:DCPS48×8 · S5:50×8 · S6:52×8 — Tractions lestées +5kg. Récup 2-3min",
            exercices: { create: [
              exo({ nom: "1A. Dév. couché prise serrée", series: 4, reps: "8",   chargeTarget: "48",  ordre: 1 }),
              exo({ nom: "1B. Tractions lestées serrées", series: 4, reps: "8",  chargeTarget: "5",   unite: "kg (lest)", ordre: 2 }),
              exo({ nom: "Push press",                    series: 5, reps: "4",   chargeTarget: "50",  ordre: 3 }),
              exo({ nom: "3A. Tirage vertical poulie",    series: 3, reps: "10",  chargeTarget: "48",  ordre: 4 }),
              exo({ nom: "Curl haltères",                 series: 3, reps: "8",   chargeTarget: "14",  unite: "kg/hal.", ordre: 5 }),
            ]},
          },

          // ── VENDREDI — Force Bas B + Sprints ─────────────────────────────
          {
            nom: "Force Bas B + Sprints", type: "force", freq: "1x/semaine", jour: "Vendredi", lieu: "salle",
            note: "30min muscu → sprints dehors. S4:8×8sec+2×20sec · S5:9×8sec+3×20sec · S6:10×8sec+4×20sec à 85%",
            exercices: { create: [
              exo({ nom: "Squat clean ⚡",          series: 3, reps: "4",     chargeTarget: "55",  typeExercice: "olympique",         ordre: 1 }),
              exo({ nom: "Romanian deadlift",        series: 3, reps: "6",     chargeTarget: "85",  isGenou: true,                     ordre: 2 }),
              exo({ nom: "Leg press unilatéral",     series: 3, reps: "8/j",   chargeTarget: "85",                                     ordre: 3 }),
              exo({ nom: "Sprints 8sec max",         series: 8, reps: "8sec",  chargeTarget: "Max", unite: "", typeExercice: "cardio", ordre: 4 }),
              exo({ nom: "Accélérations 20sec 85%",  series: 2, reps: "20sec", chargeTarget: "85%", unite: "", typeExercice: "cardio", ordre: 5 }),
            ]},
          },

          // ── SAMEDI — Footing Zone 2 ───────────────────────────────────────
          {
            nom: "Footing Zone 2", type: "cardio", freq: "1x/semaine", jour: "Samedi", lieu: "dehors",
            note: "S4-6: 45min allure conversationnelle",
            exercices: { create: [
              exo({ nom: "Footing zone 2", series: 1, reps: "45min", chargeTarget: "Zone 2", unite: "min", typeExercice: "cardio", ordre: 1 }),
            ]},
          },

        ],
      },
    },
  });

  // ─── BLOC 3 — Puissance (S7-9) · 85% 1RM ─────────────────────────────────
  await prisma.bloc.create({
    data: {
      numero: 3, nom: "Puissance", semaines: "7-9", couleur: "#f97316",
      seances: {
        create: [

          // ── LUNDI — Force Haut A ──────────────────────────────────────────
          {
            nom: "Force Haut A", type: "force", freq: "1x/semaine", jour: "Lundi", lieu: "salle",
            note: "Explosif max. S7:DC60×4 · S8:62×4 · S9:65×3 — Descente contrôlée, montée explosive. Récup 3min",
            exercices: { create: [
              exo({ nom: "1A. Développé couché",       series: 4, reps: "4",    chargeTarget: "60",   ordre: 1 }),
              exo({ nom: "1B. Rowing barre",            series: 4, reps: "5",    chargeTarget: "55",   ordre: 2 }),
              exo({ nom: "Tractions lestées larges",    series: 5, reps: "6",    chargeTarget: "5",    unite: "kg (lest)", ordre: 3 }),
              exo({ nom: "3A. Développé militaire",     series: 3, reps: "5",    chargeTarget: "45",   ordre: 4 }),
              exo({ nom: "3B. Face pulls poulie",       series: 3, reps: "15",   chargeTarget: "léger",unite: "",          ordre: 5 }),
              exo({ nom: "Dips lestés",                 series: 3, reps: "5-6",  chargeTarget: "5",    unite: "kg (lest)", ordre: 6 }),
            ]},
          },

          // ── MARDI — Force Bas A ───────────────────────────────────────────
          {
            nom: "Force Bas A", type: "force", freq: "1x/semaine", jour: "Mardi", lieu: "salle",
            note: "Charges maximales — technique irréprochable. S7:SC70×3 · S8:75×3 · S9:80×3 — Récup 3min",
            exercices: { create: [
              exo({ nom: "Squat clean ⚡",           series: 4, reps: "3",    chargeTarget: "70",  typeExercice: "olympique",         ordre: 1 }),
              exo({ nom: "Squat barre",               series: 4, reps: "4",    chargeTarget: "80",                                     ordre: 2 }),
              exo({ nom: "Soulevé de terre",          series: 3, reps: "4",    chargeTarget: "100",                                    ordre: 3 }),
              exo({ nom: "4A. Bulgarian split squat", series: 4, reps: "6/j",  chargeTarget: "18",  unite: "kg/hal.", isGenou: true,   ordre: 4 }),
              exo({ nom: "4B. Leg press",             series: 4, reps: "8",    chargeTarget: "140",                                    ordre: 5 }),
            ]},
          },

          // ── MERCREDI — Récup Active ───────────────────────────────────────
          {
            nom: "Récup Active", type: "cardio", freq: "1x/semaine", jour: "Mercredi", lieu: "dehors",
            note: "S7-9: 45min footing zone 2 + quelques accélérations légères en fin de S7",
            exercices: { create: [
              exo({ nom: "Footing zone 2", series: 1, reps: "45min", chargeTarget: "Zone 2", unite: "min", typeExercice: "cardio", ordre: 1 }),
            ]},
          },

          // ── JEUDI — Force Haut B ──────────────────────────────────────────
          {
            nom: "Force Haut B", type: "force", freq: "1x/semaine", jour: "Jeudi", lieu: "salle",
            note: "Explosif. S7:DCPS55×6 · S8:57×6 · S9:60×5 — Tractions +8kg. Récup 2-3min",
            exercices: { create: [
              exo({ nom: "1A. Dév. couché prise serrée", series: 4, reps: "6",   chargeTarget: "55",  ordre: 1 }),
              exo({ nom: "1B. Tractions lestées serrées", series: 4, reps: "6",  chargeTarget: "8",   unite: "kg (lest)", ordre: 2 }),
              exo({ nom: "Push press",                    series: 5, reps: "3",   chargeTarget: "60",  ordre: 3 }),
              exo({ nom: "3A. Tirage vertical poulie",    series: 3, reps: "8",   chargeTarget: "55",  ordre: 4 }),
              exo({ nom: "Curl haltères",                 series: 3, reps: "6",   chargeTarget: "18",  unite: "kg/hal.", ordre: 5 }),
            ]},
          },

          // ── VENDREDI — Force Bas B + Sprints ─────────────────────────────
          {
            nom: "Force Bas B + Sprints", type: "force", freq: "1x/semaine", jour: "Vendredi", lieu: "salle",
            note: "S7:5×6sec+4×10sec+3×20sec · S8:6×6sec+5×10sec+4×20sec · S9:6×6sec+5×10sec+5×20sec (90% VMA)",
            exercices: { create: [
              exo({ nom: "Squat clean ⚡",             series: 3, reps: "3",    chargeTarget: "70",  typeExercice: "olympique",         ordre: 1 }),
              exo({ nom: "Romanian deadlift",           series: 3, reps: "5",    chargeTarget: "95",  isGenou: true,                     ordre: 2 }),
              exo({ nom: "Leg press unilatéral",        series: 3, reps: "6/j",  chargeTarget: "100",                                    ordre: 3 }),
              exo({ nom: "Sprints 6sec max",            series: 5, reps: "6sec", chargeTarget: "Max", unite: "", typeExercice: "cardio", ordre: 4 }),
              exo({ nom: "Accélérations 10sec prog.",   series: 4, reps: "10sec",chargeTarget: "85%", unite: "", typeExercice: "cardio", ordre: 5 }),
              exo({ nom: "Accélérations 20sec 90%",    series: 3, reps: "20sec",chargeTarget: "90%", unite: "", typeExercice: "cardio", ordre: 6 }),
            ]},
          },

          // ── SAMEDI — Footing Zone 2 ───────────────────────────────────────
          {
            nom: "Footing Zone 2", type: "cardio", freq: "1x/semaine", jour: "Samedi", lieu: "dehors",
            note: "S7-9: 55min allure conversationnelle + quelques accélérations courtes en fin",
            exercices: { create: [
              exo({ nom: "Footing zone 2", series: 1, reps: "55min", chargeTarget: "Zone 2", unite: "min", typeExercice: "cardio", ordre: 1 }),
            ]},
          },

        ],
      },
    },
  });

  // ─── BLOC 4 — Affûtage (S10) · 60% 1RM ───────────────────────────────────
  // Volume ÷ 2 — Intensité maintenue — Arriver frais
  await prisma.bloc.create({
    data: {
      numero: 4, nom: "Affûtage", semaines: "10", couleur: "#818cf8",
      seances: {
        create: [

          // ── LUNDI — Force maintien haut ───────────────────────────────────
          {
            nom: "Force maintien haut", type: "force", freq: "1x", jour: "Lundi", lieu: "salle",
            note: "Volume ÷ 2 — Intensité maintenue. Récup 2min.",
            exercices: { create: [
              exo({ nom: "1A. Développé couché",       series: 3, reps: "4",   chargeTarget: "42",    ordre: 1 }),
              exo({ nom: "1B. Rowing barre",            series: 3, reps: "5",   chargeTarget: "40",    ordre: 2 }),
              exo({ nom: "Tractions lestées",           series: 3, reps: "5",   chargeTarget: "5",     unite: "kg (lest)", ordre: 3 }),
              exo({ nom: "3A. Développé militaire",     series: 2, reps: "5",   chargeTarget: "40",    ordre: 4 }),
              exo({ nom: "3B. Face pulls poulie",       series: 2, reps: "15",  chargeTarget: "léger", unite: "",          ordre: 5 }),
              exo({ nom: "Dips",                        series: 2, reps: "8",   chargeTarget: "PDC",   unite: "reps",      ordre: 6 }),
            ]},
          },

          // ── MARDI — Force maintien bas ────────────────────────────────────
          {
            nom: "Force maintien bas", type: "force", freq: "1x", jour: "Mardi", lieu: "salle",
            note: "Bulgarian SS supprimé en S10. Volume réduit — pas de perf, maintenir fraîcheur. Récup 2min.",
            exercices: { create: [
              exo({ nom: "Squat clean ⚡",   series: 3, reps: "3",   chargeTarget: "55",  typeExercice: "olympique", ordre: 1 }),
              exo({ nom: "Squat barre",       series: 3, reps: "4",   chargeTarget: "57",                             ordre: 2 }),
              exo({ nom: "Soulevé de terre",  series: 2, reps: "4",   chargeTarget: "72",                             ordre: 3 }),
              exo({ nom: "Leg press",         series: 3, reps: "10",  chargeTarget: "100",                            ordre: 4 }),
            ]},
          },

          // ── MERCREDI — Cardio léger ───────────────────────────────────────
          {
            nom: "Cardio léger", type: "cardio", freq: "1x", jour: "Mercredi", lieu: "dehors",
            note: "S10: 25min footing zone 2 léger — récupération active",
            exercices: { create: [
              exo({ nom: "Footing zone 2", series: 1, reps: "25min", chargeTarget: "Zone 2", unite: "min", typeExercice: "cardio", ordre: 1 }),
            ]},
          },

          // ── JEUDI — Force maintien haut B ────────────────────────────────
          {
            nom: "Force maintien haut B", type: "force", freq: "1x", jour: "Jeudi", lieu: "salle",
            note: "Volume ÷ 2. Récup 2min.",
            exercices: { create: [
              exo({ nom: "1A. Dév. couché prise serrée", series: 3, reps: "8",  chargeTarget: "40",  ordre: 1 }),
              exo({ nom: "1B. Tractions lestées",         series: 3, reps: "8",  chargeTarget: "5",   unite: "kg (lest)", ordre: 2 }),
              exo({ nom: "Push press",                     series: 3, reps: "4",  chargeTarget: "50",  ordre: 3 }),
              exo({ nom: "3A. Tirage vertical poulie",     series: 2, reps: "12", chargeTarget: "40",  ordre: 4 }),
              exo({ nom: "Curl haltères",                  series: 2, reps: "8",  chargeTarget: "12",  unite: "kg/hal.", ordre: 5 }),
            ]},
          },

          // ── VENDREDI — Sprints réduits ────────────────────────────────────
          {
            nom: "Sprints réduits", type: "force", freq: "1x", jour: "Vendredi", lieu: "salle",
            note: "Muscu légère + 5×6sec sprint max / 2min récup. Arriver frais.",
            exercices: { create: [
              exo({ nom: "Squat clean ⚡",         series: 2, reps: "3",    chargeTarget: "55",  typeExercice: "olympique",         ordre: 1 }),
              exo({ nom: "Romanian deadlift",       series: 2, reps: "4",    chargeTarget: "70",  isGenou: true,                     ordre: 2 }),
              exo({ nom: "Leg press unilatéral",    series: 2, reps: "8/j",  chargeTarget: "80",                                     ordre: 3 }),
              exo({ nom: "Sprints 6sec max",        series: 5, reps: "6sec", chargeTarget: "Max", unite: "", typeExercice: "cardio", ordre: 4 }),
            ]},
          },

          // Samedi : Repos complet — pas de séance

        ],
      },
    },
  });

  const count = await prisma.seance.count();
  console.log(`✅ Seed terminé — Programme salle 10 semaines · 4 blocs · ${count} séances`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
