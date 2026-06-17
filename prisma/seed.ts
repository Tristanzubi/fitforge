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
  await prisma.chatMessage.deleteMany();
  await prisma.ajustementClaude.deleteMany();
  await prisma.logSerie.deleteMany();
  await prisma.logSeance.deleteMany();
  await prisma.exercice.deleteMany();
  await prisma.seance.deleteMany();
  await prisma.bloc.deleteMany();

  // ─── BLOC 1 — Fondations (S1-3) ───────────────────────────────────────────
  // Matériel : KB 24kg, KB 20kg, hal. 2×max 20kg, barre de traction
  await prisma.bloc.create({
    data: {
      numero: 1, nom: "Fondations", semaines: "1-3", couleur: "#4ade80",
      seances: {
        create: [

          // ── LUNDI — Force Haut A ──────────────────────────────────────────
          {
            nom: "Force Haut A", type: "force", freq: "1x/semaine", jour: "Lundi", lieu: "salle",
            note: "S1: Dév 2×12 · S2: 2×14 · S3: 2×16 — Récup 90sec entre séries",
            exercices: { create: [
              exo({ nom: "Tractions prise large",             series: 5, reps: "5",         chargeTarget: "PDC",    unite: "reps",      ordre: 1 }),
              exo({ nom: "Développé haltères sol",            series: 4, reps: "10",         chargeTarget: "12",     unite: "kg/hal.",   ordre: 2 }),
              exo({ nom: "Rowing haltère unilatéral",         series: 4, reps: "10/côté",    chargeTarget: "16",                         ordre: 3 }),
              exo({ nom: "Push press KB",                     series: 3, reps: "8/côté",     chargeTarget: "20",     unite: "kg (KB)",   ordre: 4 }),
              exo({ nom: "Face pulls élastique",              series: 3, reps: "15",          chargeTarget: "léger",  unite: "",          ordre: 5 }),
              exo({ nom: "Planche",                           series: 3, reps: "45sec",       chargeTarget: "PDC",    unite: "sec",  typeExercice: "gainage", ordre: 6 }),
              exo({ nom: "Gainage cervical",                  series: 2, reps: "30sec",       chargeTarget: "PDC",    unite: "sec",  typeExercice: "gainage", ordre: 7 }),
            ]},
          },

          // ── MARDI — Force Bas A + KB clean ───────────────────────────────
          {
            nom: "Force Bas A + KB clean", type: "force", freq: "1x/semaine", jour: "Mardi", lieu: "salle",
            note: "S1: Bulg 2×10 · S2: 2×12 · S3: 2×14 — KB clean en tête, système nerveux frais. Récup 2min",
            exercices: { create: [
              exo({ nom: "KB clean ⚡",                       series: 4, reps: "5/côté",     chargeTarget: "20",  unite: "kg (KB)", typeExercice: "olympique", ordre: 1 }),
              exo({ nom: "Bulgarian split squat",             series: 4, reps: "8/jambe",    chargeTarget: "10",  unite: "kg/hal.", isGenou: true,             ordre: 2 }),
              exo({ nom: "KB swing ⚡",                       series: 4, reps: "12",          chargeTarget: "24",  unite: "kg (KB)", typeExercice: "olympique", ordre: 3 }),
              exo({ nom: "Single leg deadlift",               series: 3, reps: "8/jambe",    chargeTarget: "20",  unite: "kg (KB)", isGenou: true,             ordre: 4 }),
              exo({ nom: "Fentes marchées haltères",          series: 3, reps: "10/jambe",   chargeTarget: "10",  unite: "kg/hal.",                            ordre: 5 }),
              exo({ nom: "Mollets unipodaux",                 series: 3, reps: "15/jambe",   chargeTarget: "PDC", unite: "reps",                               ordre: 6 }),
              exo({ nom: "Farmer's carry",                    series: 3, reps: "20m",         chargeTarget: "44",  unite: "kg total",                          ordre: 7 }),
            ]},
          },

          // ── MERCREDI — Intervalles VMA ────────────────────────────────────
          {
            nom: "Intervalles VMA", type: "cardio", freq: "1x/semaine", jour: "Mercredi", lieu: "dehors",
            note: "S1: 6×30sec · S2: 7×30sec · S3: 8×30sec — 90sec marche récup entre chaque",
            exercices: { create: [
              exo({ nom: "Échauffement",                      series: 1, reps: "10min",  chargeTarget: "Zone 2", unite: "min", typeExercice: "cardio", ordre: 1 }),
              exo({ nom: "Intervalles 30sec sprint / 90sec marche", series: 6, reps: "30sec", chargeTarget: "Max", unite: "", typeExercice: "cardio", ordre: 2 }),
              exo({ nom: "Retour calme",                      series: 1, reps: "10min",  chargeTarget: "Zone 1", unite: "min", typeExercice: "cardio", ordre: 3 }),
            ]},
          },

          // ── JEUDI — Force Haut B ──────────────────────────────────────────
          {
            nom: "Force Haut B", type: "force", freq: "1x/semaine", jour: "Jeudi", lieu: "salle",
            note: "S1: Dév incliné 2×12, TGU KB16 · S2: 2×14, KB16 · S3: 2×16, KB20 — Récup 90sec",
            exercices: { create: [
              exo({ nom: "Tractions prise serrée",            series: 5, reps: "5",         chargeTarget: "PDC",  unite: "reps",                               ordre: 1 }),
              exo({ nom: "Développé haltères incliné*",       series: 4, reps: "10",         chargeTarget: "12",   unite: "kg/hal.",                            ordre: 2 }),
              exo({ nom: "Rowing KB unilatéral",              series: 4, reps: "10/côté",   chargeTarget: "24",   unite: "kg (KB)",                            ordre: 3 }),
              exo({ nom: "KB press",                          series: 3, reps: "8/côté",    chargeTarget: "20",   unite: "kg (KB)",                            ordre: 4 }),
              exo({ nom: "Extensions nuque élastique",        series: 3, reps: "15",         chargeTarget: "léger",unite: "",                                   ordre: 5 }),
              exo({ nom: "Gainage latéral",                   series: 3, reps: "30sec/côté",chargeTarget: "PDC",  unite: "sec",   typeExercice: "gainage",      ordre: 6 }),
              exo({ nom: "Turkish get-up",                    series: 2, reps: "3/côté",    chargeTarget: "16",   unite: "kg (KB)",                            ordre: 7 }),
            ]},
          },

          // ── VENDREDI — Force Bas B + Sprints ─────────────────────────────
          {
            nom: "Force Bas B + Sprints", type: "force", freq: "1x/semaine", jour: "Vendredi", lieu: "dehors",
            note: "S1: RDL 2×14, 6 sprints · S2: RDL 2×16, 7 sprints · S3: RDL 2×18, 8 sprints — 8sec max / 2min récup",
            exercices: { create: [
              exo({ nom: "KB swing ⚡",                       series: 5, reps: "12",         chargeTarget: "24", unite: "kg (KB)", typeExercice: "olympique",   ordre: 1 }),
              exo({ nom: "Pistol squat",                      series: 3, reps: "5/jambe",   chargeTarget: "PDC",unite: "reps",    isGenou: true,               ordre: 2 }),
              exo({ nom: "Romanian deadlift haltères",        series: 4, reps: "10",         chargeTarget: "14", unite: "kg/hal.", isGenou: true,               ordre: 3 }),
              exo({ nom: "Step-up lesté",                     series: 3, reps: "10/jambe",  chargeTarget: "10", unite: "kg/hal.", isGenou: true,               ordre: 4 }),
              exo({ nom: "Sprints 8sec max",                  series: 6, reps: "8sec",       chargeTarget: "Max",unite: "",        typeExercice: "cardio",      ordre: 5 }),
            ]},
          },

          // ── SAMEDI — Footing Zone 2 ───────────────────────────────────────
          {
            nom: "Footing Zone 2", type: "cardio", freq: "1x/semaine", jour: "Samedi", lieu: "dehors",
            note: "S1: 40min · S2: 40min · S3: 45min — allure conversationnelle, terrain plat",
            exercices: { create: [
              exo({ nom: "Footing zone 2", series: 1, reps: "40min", chargeTarget: "Zone 2", unite: "min", typeExercice: "cardio", ordre: 1 }),
            ]},
          },

        ],
      },
    },
  });

  // ─── BLOC 2 — Hypertrophie (S4-6) ─────────────────────────────────────────
  await prisma.bloc.create({
    data: {
      numero: 2, nom: "Hypertrophie", semaines: "4-6", couleur: "#facc15",
      seances: {
        create: [

          // ── LUNDI — Force Haut A ──────────────────────────────────────────
          {
            nom: "Force Haut A", type: "force", freq: "1x/semaine", jour: "Lundi", lieu: "salle",
            note: "S4: Dév 2×16 · S5: 2×18 · S6: 2×20 — Dips chaises ajoutés. Récup 90sec",
            exercices: { create: [
              exo({ nom: "Tractions prise large",             series: 5, reps: "6",         chargeTarget: "PDC",  unite: "reps",                               ordre: 1 }),
              exo({ nom: "Développé haltères sol",            series: 5, reps: "8",          chargeTarget: "16",   unite: "kg/hal.",                            ordre: 2 }),
              exo({ nom: "Rowing haltère unilatéral",         series: 5, reps: "8/côté",    chargeTarget: "18",                                                ordre: 3 }),
              exo({ nom: "Push press KB",                     series: 4, reps: "6/côté",    chargeTarget: "24",   unite: "kg (KB)",                            ordre: 4 }),
              exo({ nom: "Face pulls élastique",              series: 3, reps: "15",         chargeTarget: "léger",unite: "",                                   ordre: 5 }),
              exo({ nom: "Dips entre chaises",                series: 3, reps: "10",         chargeTarget: "PDC",  unite: "reps",                               ordre: 6 }),
              exo({ nom: "Gainage cervical",                  series: 3, reps: "30sec",      chargeTarget: "PDC",  unite: "sec",   typeExercice: "gainage",      ordre: 7 }),
            ]},
          },

          // ── MARDI — Force Bas A + KB clean ───────────────────────────────
          {
            nom: "Force Bas A + KB clean", type: "force", freq: "1x/semaine", jour: "Mardi", lieu: "salle",
            note: "S4: Bulg 2×14 · S5: 2×16 · S6: 2×18 — KB clean KB24. Récup 2-3min",
            exercices: { create: [
              exo({ nom: "KB clean ⚡",                       series: 5, reps: "5/côté",    chargeTarget: "24", unite: "kg (KB)", typeExercice: "olympique",    ordre: 1 }),
              exo({ nom: "Bulgarian split squat",             series: 5, reps: "8/jambe",   chargeTarget: "14", unite: "kg/hal.", isGenou: true,                ordre: 2 }),
              exo({ nom: "KB swing ⚡",                       series: 4, reps: "12",         chargeTarget: "24", unite: "kg (KB)", typeExercice: "olympique",    ordre: 3 }),
              exo({ nom: "Single leg deadlift",               series: 4, reps: "8/jambe",   chargeTarget: "24", unite: "kg (KB)", isGenou: true,                ordre: 4 }),
              exo({ nom: "Fentes marchées haltères",          series: 3, reps: "10/jambe",  chargeTarget: "14", unite: "kg/hal.",                              ordre: 5 }),
              exo({ nom: "Farmer's carry",                    series: 3, reps: "25m",        chargeTarget: "44", unite: "kg total",                            ordre: 6 }),
            ]},
          },

          // ── MERCREDI — Intervalles VMA ────────────────────────────────────
          {
            nom: "Intervalles VMA", type: "cardio", freq: "1x/semaine", jour: "Mercredi", lieu: "dehors",
            note: "S4: 8×30sec · S5: 9×30sec · S6: 10×30sec — 90sec marche récup entre chaque",
            exercices: { create: [
              exo({ nom: "Échauffement",                      series: 1, reps: "10min",  chargeTarget: "Zone 2", unite: "min", typeExercice: "cardio", ordre: 1 }),
              exo({ nom: "Intervalles 30sec sprint / 90sec marche", series: 8, reps: "30sec", chargeTarget: "Max", unite: "", typeExercice: "cardio", ordre: 2 }),
              exo({ nom: "Retour calme",                      series: 1, reps: "10min",  chargeTarget: "Zone 1", unite: "min", typeExercice: "cardio", ordre: 3 }),
            ]},
          },

          // ── JEUDI — Force Haut B ──────────────────────────────────────────
          {
            nom: "Force Haut B", type: "force", freq: "1x/semaine", jour: "Jeudi", lieu: "salle",
            note: "S4: Dév incliné 2×16, TGU KB20 · S5: 2×18, KB20 · S6: 2×20, KB20 — Récup 90sec",
            exercices: { create: [
              exo({ nom: "Tractions prise serrée",            series: 5, reps: "6",         chargeTarget: "PDC",  unite: "reps",                               ordre: 1 }),
              exo({ nom: "Développé haltères incliné*",       series: 4, reps: "8",          chargeTarget: "16",   unite: "kg/hal.",                            ordre: 2 }),
              exo({ nom: "Rowing KB unilatéral",              series: 4, reps: "8/côté",    chargeTarget: "24",   unite: "kg (KB)",                            ordre: 3 }),
              exo({ nom: "KB press",                          series: 4, reps: "6/côté",    chargeTarget: "24",   unite: "kg (KB)",                            ordre: 4 }),
              exo({ nom: "Extensions nuque élastique",        series: 3, reps: "15",         chargeTarget: "léger",unite: "",                                   ordre: 5 }),
              exo({ nom: "Gainage dynamique",                 series: 3, reps: "30sec",      chargeTarget: "PDC",  unite: "sec",   typeExercice: "gainage",      ordre: 6 }),
              exo({ nom: "Turkish get-up",                    series: 3, reps: "3/côté",    chargeTarget: "20",   unite: "kg (KB)",                            ordre: 7 }),
            ]},
          },

          // ── VENDREDI — Force Bas B + Sprints ─────────────────────────────
          {
            nom: "Force Bas B + Sprints", type: "force", freq: "1x/semaine", jour: "Vendredi", lieu: "dehors",
            note: "S4: Pistol KB12, RDL 2×18, 8 sprints · S5: KB14, 2×20, 9 sprints · S6: KB16, 2×20, 10 sprints — + 2×20sec à 85%",
            exercices: { create: [
              exo({ nom: "KB swing ⚡",                       series: 5, reps: "12",         chargeTarget: "24", unite: "kg (KB)", typeExercice: "olympique",   ordre: 1 }),
              exo({ nom: "Pistol squat lesté",                series: 4, reps: "5/jambe",   chargeTarget: "12", unite: "kg (KB)", isGenou: true,               ordre: 2 }),
              exo({ nom: "Romanian deadlift haltères",        series: 4, reps: "8",          chargeTarget: "18", unite: "kg/hal.", isGenou: true,               ordre: 3 }),
              exo({ nom: "Step-up lesté",                     series: 3, reps: "10/jambe",  chargeTarget: "14", unite: "kg/hal.", isGenou: true,               ordre: 4 }),
              exo({ nom: "Sprints 8sec max",                  series: 8, reps: "8sec",       chargeTarget: "Max",unite: "",        typeExercice: "cardio",      ordre: 5 }),
              exo({ nom: "Accélérations 20sec à 85%",        series: 2, reps: "20sec",       chargeTarget: "85%",unite: "",        typeExercice: "cardio",      ordre: 6 }),
            ]},
          },

          // ── SAMEDI — Footing Zone 2 ───────────────────────────────────────
          {
            nom: "Footing Zone 2", type: "cardio", freq: "1x/semaine", jour: "Samedi", lieu: "dehors",
            note: "S4: 45min · S5: 48min · S6: 50min — quelques côtes légères en S4",
            exercices: { create: [
              exo({ nom: "Footing zone 2", series: 1, reps: "45min", chargeTarget: "Zone 2", unite: "min", typeExercice: "cardio", ordre: 1 }),
            ]},
          },

        ],
      },
    },
  });

  // ─── BLOC 3 — Puissance + Vitesse (S7-9) ──────────────────────────────────
  await prisma.bloc.create({
    data: {
      numero: 3, nom: "Puissance + Vitesse", semaines: "7-9", couleur: "#f97316",
      seances: {
        create: [

          // ── LUNDI — Force Maximale Haut ───────────────────────────────────
          {
            nom: "Force Maximale Haut", type: "force", freq: "1x/semaine", jour: "Lundi", lieu: "salle",
            note: "S7: Trac +5kg 4×6 · S8: 4×7 · S9: 4×7 +8kg — Explosivité max. Récup 3min",
            exercices: { create: [
              exo({ nom: "Tractions lestées prise large",     series: 4, reps: "6",         chargeTarget: "5",  unite: "kg (lest)",                            ordre: 1 }),
              exo({ nom: "Développé haltères explosif",       series: 5, reps: "5",          chargeTarget: "20", unite: "kg/hal.",                             ordre: 2 }),
              exo({ nom: "Rowing haltère unilatéral",         series: 5, reps: "6/côté",    chargeTarget: "20",                                               ordre: 3 }),
              exo({ nom: "Push press KB explosif",            series: 4, reps: "5/côté",    chargeTarget: "24", unite: "kg (KB)",                             ordre: 4 }),
              exo({ nom: "Dips lestés",                       series: 3, reps: "8",          chargeTarget: "5",  unite: "kg (lest)",                           ordre: 5 }),
              exo({ nom: "Gainage cervical",                  series: 3, reps: "35sec",      chargeTarget: "PDC",unite: "sec",    typeExercice: "gainage",      ordre: 6 }),
            ]},
          },

          // ── MARDI — Force Maximale Bas ────────────────────────────────────
          {
            nom: "Force Maximale Bas", type: "force", freq: "1x/semaine", jour: "Mardi", lieu: "salle",
            note: "S7: Bulg 2×18 · S8: 2×20 · S9: 2×20 5×5reps — Récup 3min. Charges maximales.",
            exercices: { create: [
              exo({ nom: "KB clean lourd ⚡",                 series: 5, reps: "4/côté",    chargeTarget: "24", unite: "kg (KB)", typeExercice: "olympique",    ordre: 1 }),
              exo({ nom: "Bulgarian split squat lourd",       series: 5, reps: "6/jambe",   chargeTarget: "18", unite: "kg/hal.", isGenou: true,                ordre: 2 }),
              exo({ nom: "KB swing max ⚡",                   series: 5, reps: "8",          chargeTarget: "24", unite: "kg (KB)", typeExercice: "olympique",    ordre: 3 }),
              exo({ nom: "Single leg deadlift",               series: 4, reps: "6/jambe",   chargeTarget: "24", unite: "kg (KB)", isGenou: true,                ordre: 4 }),
              exo({ nom: "Fentes lestées",                    series: 3, reps: "8/jambe",   chargeTarget: "18", unite: "kg/hal.",                              ordre: 5 }),
              exo({ nom: "Farmer's carry max",                series: 3, reps: "20m",        chargeTarget: "44", unite: "kg total",                            ordre: 6 }),
            ]},
          },

          // ── MERCREDI — Circuit Puissance Placage ──────────────────────────
          {
            nom: "Circuit Puissance Placage", type: "circuit", freq: "1x/semaine", jour: "Mercredi", lieu: "salle",
            note: "4 tours — Récup 2min entre tours. Explosivité maximale à chaque répétition.",
            exercices: { create: [
              exo({ nom: "KB cleans explosifs ⚡",            series: 4, reps: "4",          chargeTarget: "20", unite: "kg (KB)", typeExercice: "olympique",   ordre: 1 }),
              exo({ nom: "Pompes explosives",                 series: 4, reps: "5",          chargeTarget: "PDC",unite: "reps",                               ordre: 2 }),
              exo({ nom: "Squats sautés",                     series: 4, reps: "5",          chargeTarget: "PDC",unite: "reps",   typeExercice: "cardio",      ordre: 3 }),
              exo({ nom: "Navettes 20sec",                    series: 4, reps: "20sec",       chargeTarget: "Max",unite: "",       typeExercice: "cardio",      ordre: 4 }),
              exo({ nom: "Tractions explosives",              series: 4, reps: "8",          chargeTarget: "PDC",unite: "reps",                               ordre: 5 }),
            ]},
          },

          // ── JEUDI — Puissance Haut + Gainage Rugby ───────────────────────
          {
            nom: "Puissance Haut + Gainage Rugby", type: "force", freq: "1x/semaine", jour: "Jeudi", lieu: "salle",
            note: "S7: Trac +5kg 4×6, Crunch 10kg · S8: 4×7, Crunch 12kg · S9: 4×7 +8kg — Récup 2min",
            exercices: { create: [
              exo({ nom: "Tractions lestées prise serrée",   series: 4, reps: "6",         chargeTarget: "5",  unite: "kg (lest)",                            ordre: 1 }),
              exo({ nom: "Développé haltères explosif",       series: 4, reps: "5",          chargeTarget: "20", unite: "kg/hal.",                             ordre: 2 }),
              exo({ nom: "Rowing KB explosif",                series: 4, reps: "5/côté",    chargeTarget: "24", unite: "kg (KB)",                             ordre: 3 }),
              exo({ nom: "KB press explosif",                 series: 4, reps: "4/côté",    chargeTarget: "24", unite: "kg (KB)",                             ordre: 4 }),
              exo({ nom: "Gainage anti-rotation",             series: 3, reps: "30sec/côté",chargeTarget: "PDC",unite: "sec",    typeExercice: "gainage",      ordre: 5 }),
              exo({ nom: "Crunch torsion lesté",              series: 3, reps: "15",         chargeTarget: "10",                                              ordre: 6 }),
              exo({ nom: "Turkish get-up",                    series: 2, reps: "3/côté",    chargeTarget: "24", unite: "kg (KB)",                             ordre: 7 }),
            ]},
          },

          // ── VENDREDI — Vitesse Maximale ───────────────────────────────────
          {
            nom: "Vitesse Maximale", type: "cardio", freq: "1x/semaine", jour: "Vendredi", lieu: "dehors",
            note: "S7: 5×6sec + 4×10sec + 3×20sec · S8: 6×6sec + 5×10sec + 4×20sec · S9: 6×6sec + 5×10sec + 5×20sec",
            exercices: { create: [
              exo({ nom: "Échauffement progressif",           series: 1, reps: "15min", chargeTarget: "Zone 2", unite: "min", typeExercice: "cardio",          ordre: 1 }),
              exo({ nom: "Sprints 6sec max",                  series: 5, reps: "6sec",   chargeTarget: "Max",   unite: "",    typeExercice: "cardio",          ordre: 2 }),
              exo({ nom: "Accélérations progressives 10sec",  series: 4, reps: "10sec",  chargeTarget: "85%",   unite: "",    typeExercice: "cardio",          ordre: 3 }),
              exo({ nom: "Accélérations 20sec à 90%",        series: 3, reps: "20sec",  chargeTarget: "90%",   unite: "",    typeExercice: "cardio",          ordre: 4 }),
              exo({ nom: "Retour calme",                      series: 1, reps: "10min",  chargeTarget: "Zone 1",unite: "min", typeExercice: "cardio",          ordre: 5 }),
            ]},
          },

          // ── SAMEDI — Footing Zone 2 ───────────────────────────────────────
          {
            nom: "Footing Zone 2", type: "cardio", freq: "1x/semaine", jour: "Samedi", lieu: "dehors",
            note: "S7: 50min · S8: 52min · S9: 55min — quelques accélérations courtes en fin de S7",
            exercices: { create: [
              exo({ nom: "Footing zone 2", series: 1, reps: "50min", chargeTarget: "Zone 2", unite: "min", typeExercice: "cardio", ordre: 1 }),
            ]},
          },

        ],
      },
    },
  });

  // ─── BLOC 4 — Affûtage (S10) ───────────────────────────────────────────────
  // Volume ÷ 2, intensité maintenue — arriver frais en S11
  await prisma.bloc.create({
    data: {
      numero: 4, nom: "Affûtage", semaines: "10", couleur: "#818cf8",
      seances: {
        create: [

          // ── LUNDI — Force maintien haut ───────────────────────────────────
          {
            nom: "Force maintien haut", type: "force", freq: "1x", jour: "Lundi", lieu: "salle",
            note: "Volume ÷ 2 — Intensité maintenue. Récup 2min entre séries.",
            exercices: { create: [
              exo({ nom: "Tractions lestées prise large",     series: 3, reps: "5",         chargeTarget: "5",  unite: "kg (lest)",  ordre: 1 }),
              exo({ nom: "Développé haltères sol",            series: 3, reps: "5",          chargeTarget: "16", unite: "kg/hal.",    ordre: 2 }),
              exo({ nom: "Rowing haltère unilatéral",         series: 3, reps: "6/côté",    chargeTarget: "18",                      ordre: 3 }),
              exo({ nom: "Push press KB",                     series: 2, reps: "5/côté",    chargeTarget: "20", unite: "kg (KB)",    ordre: 4 }),
            ]},
          },

          // ── MARDI — Force maintien bas ────────────────────────────────────
          {
            nom: "Force maintien bas", type: "force", freq: "1x", jour: "Mardi", lieu: "salle",
            note: "Volume réduit — pas de performance, juste maintenir. Récup 2min.",
            exercices: { create: [
              exo({ nom: "KB clean ⚡",                       series: 3, reps: "3/côté",    chargeTarget: "20", unite: "kg (KB)", typeExercice: "olympique",    ordre: 1 }),
              exo({ nom: "Bulgarian split squat",             series: 3, reps: "5/jambe",   chargeTarget: "14", unite: "kg/hal.", isGenou: true,                ordre: 2 }),
              exo({ nom: "KB swing ⚡",                       series: 3, reps: "8",          chargeTarget: "24", unite: "kg (KB)", typeExercice: "olympique",    ordre: 3 }),
              exo({ nom: "Romanian deadlift haltères",        series: 2, reps: "8",          chargeTarget: "16", unite: "kg/hal.", isGenou: true,                ordre: 4 }),
            ]},
          },

          // ── MERCREDI — Cardio léger ───────────────────────────────────────
          {
            nom: "Cardio léger", type: "cardio", freq: "1x", jour: "Mercredi", lieu: "dehors",
            note: "Récupération active — 25min zone 2 allure conversationnelle",
            exercices: { create: [
              exo({ nom: "Footing zone 2", series: 1, reps: "25min", chargeTarget: "Zone 2", unite: "min", typeExercice: "cardio", ordre: 1 }),
            ]},
          },

          // ── JEUDI — Mobilité + Récup active ──────────────────────────────
          {
            nom: "Mobilité + Récup active", type: "mobilite", freq: "1x", jour: "Jeudi", lieu: "salle",
            note: "20min max — hanches, épaules, thoracique",
            exercices: { create: [
              exo({ nom: "Étirements hanches",    series: 3, reps: "45sec/côté", chargeTarget: "PDC", unite: "sec", typeExercice: "gainage", ordre: 1 }),
              exo({ nom: "Étirements épaules",    series: 3, reps: "45sec/côté", chargeTarget: "PDC", unite: "sec", typeExercice: "gainage", ordre: 2 }),
              exo({ nom: "Mobilité thoracique",   series: 3, reps: "10",          chargeTarget: "PDC", unite: "reps",typeExercice: "gainage", ordre: 3 }),
            ]},
          },

          // ── VENDREDI — Sprints réduits ────────────────────────────────────
          {
            nom: "Sprints réduits", type: "cardio", freq: "1x", jour: "Vendredi", lieu: "dehors",
            note: "Arriver frais — volume minimal. 10min échauffement → 5×6sec max → 10min retour calme.",
            exercices: { create: [
              exo({ nom: "Échauffement",    series: 1, reps: "10min", chargeTarget: "Zone 2",unite: "min",typeExercice: "cardio", ordre: 1 }),
              exo({ nom: "Sprints 6sec max",series: 5, reps: "6sec",  chargeTarget: "Max",   unite: "",   typeExercice: "cardio", ordre: 2 }),
              exo({ nom: "Retour calme",    series: 1, reps: "10min", chargeTarget: "Zone 1",unite: "min",typeExercice: "cardio", ordre: 3 }),
            ]},
          },

          // Samedi : Repos complet — pas de séance créée

        ],
      },
    },
  });

  const count = await prisma.seance.count();
  console.log(`✅ Seed terminé — Programme domicile 10 semaines · 4 blocs · ${count} séances`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
