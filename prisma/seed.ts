import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

type ExoInput = {
  nom: string; series: number; reps: string; chargeTarget: string;
  unite?: string; isGenou?: boolean; typeExercice?: string; ordre: number;
};

function exo(o: ExoInput) { return { ...o, isGenou: o.isGenou ?? false, typeExercice: o.typeExercice ?? "force", unite: o.unite ?? "kg" }; }

async function main() {
  await prisma.chatMessage.deleteMany();
  await prisma.ajustementClaude.deleteMany();
  await prisma.logSerie.deleteMany();
  await prisma.logSeance.deleteMany();
  await prisma.exercice.deleteMany();
  await prisma.seance.deleteMany();
  await prisma.bloc.deleteMany();

  // ─── BLOC 1 — Fondations (Semaines 1-3) ───────────────────────────────────
  await prisma.bloc.create({
    data: {
      numero: 1, nom: "Fondations", semaines: "1-3", couleur: "#4ade80",
      seances: {
        create: [
          {
            nom: "Séance de test", type: "test", freq: "1x (semaine 1)", jour: "Lundi", lieu: "salle",
            note: "Calibration charges — Squat/DC/Rowing/SDL : 20kg→40kg→60kg→8RM. Power clean : technique propre.",
            exercices: { create: [
              exo({ nom: "Squat barre", series: 5, reps: "Trouver 8RM", chargeTarget: "?", ordre: 1 }),
              exo({ nom: "Développé couché", series: 5, reps: "Trouver 8RM", chargeTarget: "?", ordre: 2 }),
              exo({ nom: "Rowing barre", series: 5, reps: "Trouver 8RM", chargeTarget: "?", ordre: 3 }),
              exo({ nom: "Soulevé de terre", series: 5, reps: "Trouver 8RM", chargeTarget: "?", ordre: 4 }),
              exo({ nom: "Power clean", series: 4, reps: "Technique", chargeTarget: "30-50", ordre: 5, typeExercice: "olympique" }),
              exo({ nom: "Tractions", series: 1, reps: "Max", chargeTarget: "PDC", unite: "reps", ordre: 6 }),
            ]},
          },
          {
            nom: "Force Haut A", type: "force", freq: "1x/semaine", jour: "Lundi", lieu: "salle",
            note: "Récupération 90 secondes entre les séries",
            exercices: { create: [
              exo({ nom: "Développé couché", series: 4, reps: "8-10", chargeTarget: "60-65", ordre: 1 }),
              exo({ nom: "Rowing barre", series: 4, reps: "10", chargeTarget: "50-55", ordre: 2 }),
              exo({ nom: "Tractions", series: 4, reps: "Max", chargeTarget: "PDC", unite: "reps", ordre: 3 }),
              exo({ nom: "Développé militaire", series: 3, reps: "10", chargeTarget: "40", ordre: 4 }),
              exo({ nom: "Face pulls", series: 3, reps: "15", chargeTarget: "Léger", ordre: 5 }),
              exo({ nom: "Planche", series: 3, reps: "45sec", chargeTarget: "PDC", unite: "sec", ordre: 6, typeExercice: "gainage" }),
              exo({ nom: "Gainage cervical", series: 2, reps: "30sec", chargeTarget: "PDC", unite: "sec", ordre: 7, typeExercice: "gainage" }),
            ]},
          },
          {
            nom: "Force Bas A + Power clean", type: "force", freq: "1x/semaine", jour: "Mardi", lieu: "salle",
            note: "Power clean en début — système nerveux frais. Récupération 2-3min.",
            exercices: { create: [
              exo({ nom: "Power clean technique ⚡", series: 4, reps: "4", chargeTarget: "40-50", ordre: 1, typeExercice: "olympique" }),
              exo({ nom: "Squat barre", series: 4, reps: "8-10", chargeTarget: "60-70", ordre: 2 }),
              exo({ nom: "Soulevé de terre roumain", series: 3, reps: "10", chargeTarget: "60-70", ordre: 3 }),
              exo({ nom: "Fentes marchées haltères", series: 3, reps: "10/jambe", chargeTarget: "2x12", ordre: 4 }),
              exo({ nom: "Ischio machine", series: 3, reps: "12", chargeTarget: "40-50", ordre: 5 }),
              exo({ nom: "Mollets debout", series: 3, reps: "15", chargeTarget: "50", ordre: 6 }),
              exo({ nom: "Farmer's carry", series: 3, reps: "20m", chargeTarget: "2x20", ordre: 7 }),
            ]},
          },
          {
            nom: "Intervalles VMA", type: "cardio", freq: "1x/semaine", jour: "Mercredi", lieu: "dehors",
            note: "10min échauffement → 8x30sec sprint / 90sec marche → 10min retour calme. Total ~35min.",
            exercices: { create: [
              exo({ nom: "Échauffement", series: 1, reps: "10min", chargeTarget: "Zone 2", unite: "min", ordre: 1, typeExercice: "cardio" }),
              exo({ nom: "Intervalles 30sec sprint", series: 8, reps: "30sec / 90sec récup", chargeTarget: "Max", unite: "", ordre: 2, typeExercice: "cardio" }),
              exo({ nom: "Retour calme", series: 1, reps: "10min", chargeTarget: "Zone 1", unite: "min", ordre: 3, typeExercice: "cardio" }),
            ]},
          },
          {
            nom: "Force Haut B", type: "force", freq: "1x/semaine", jour: "Jeudi", lieu: "salle",
            note: "Récupération 90 secondes entre les séries",
            exercices: { create: [
              exo({ nom: "Développé incliné", series: 4, reps: "10", chargeTarget: "50-55", ordre: 1 }),
              exo({ nom: "Rowing unilatéral haltère", series: 4, reps: "10/côté", chargeTarget: "20-24", ordre: 2 }),
              exo({ nom: "Tractions prise serrée", series: 3, reps: "Max", chargeTarget: "PDC", unite: "reps", ordre: 3 }),
              exo({ nom: "Push press", series: 3, reps: "8", chargeTarget: "40-45", ordre: 4, typeExercice: "olympique" }),
              exo({ nom: "Face pulls", series: 3, reps: "15", chargeTarget: "Léger", ordre: 5 }),
              exo({ nom: "Gainage latéral", series: 3, reps: "30sec/côté", chargeTarget: "PDC", unite: "sec", ordre: 6, typeExercice: "gainage" }),
              exo({ nom: "Extensions nuque élastique", series: 3, reps: "15", chargeTarget: "Léger", unite: "", ordre: 7 }),
            ]},
          },
          {
            nom: "Force Bas B + Sprints", type: "force", freq: "1x/semaine", jour: "Vendredi", lieu: "salle",
            note: "Muscu puis sprints dehors. Hang clean en début de séance.",
            exercices: { create: [
              exo({ nom: "Hang clean ⚡", series: 4, reps: "4", chargeTarget: "40-50", ordre: 1, typeExercice: "olympique" }),
              exo({ nom: "Squat barre", series: 3, reps: "8", chargeTarget: "60-70", ordre: 2 }),
              exo({ nom: "Soulevé de terre", series: 3, reps: "6", chargeTarget: "70-80", ordre: 3 }),
              exo({ nom: "Fentes haltères", series: 2, reps: "10/jambe", chargeTarget: "2x12", ordre: 4 }),
              exo({ nom: "Sprints 8sec max", series: 8, reps: "8sec / 2min récup", chargeTarget: "Max", unite: "", ordre: 5, typeExercice: "cardio" }),
            ]},
          },
          {
            nom: "Footing Zone 2", type: "cardio", freq: "1x/semaine", jour: "Samedi", lieu: "dehors",
            note: "40-45min allure conversationnelle — terrain plat ou légèrement vallonné",
            exercices: { create: [
              exo({ nom: "Footing zone 2", series: 1, reps: "40-45min", chargeTarget: "Zone 2", unite: "min", ordre: 1, typeExercice: "cardio" }),
            ]},
          },
        ],
      },
    },
  });

  // ─── BLOC 2 — Hypertrophie (Semaines 4-6) ─────────────────────────────────
  await prisma.bloc.create({
    data: {
      numero: 2, nom: "Hypertrophie", semaines: "4-6", couleur: "#facc15",
      seances: {
        create: [
          {
            nom: "Force Haut A", type: "force", freq: "1x/semaine", jour: "Lundi", lieu: "salle",
            note: "Récupération 90 secondes entre les séries",
            exercices: { create: [
              exo({ nom: "Développé couché", series: 5, reps: "8", chargeTarget: "70-75", ordre: 1 }),
              exo({ nom: "Rowing barre", series: 5, reps: "8", chargeTarget: "60-65", ordre: 2 }),
              exo({ nom: "Tractions lestées", series: 4, reps: "6-8", chargeTarget: "+5", ordre: 3 }),
              exo({ nom: "Développé militaire", series: 4, reps: "8", chargeTarget: "45-50", ordre: 4 }),
              exo({ nom: "Face pulls", series: 3, reps: "15", chargeTarget: "Léger", ordre: 5 }),
              exo({ nom: "Dips lestés", series: 3, reps: "8", chargeTarget: "+5", ordre: 6 }),
              exo({ nom: "Gainage cervical", series: 3, reps: "30sec", chargeTarget: "PDC", unite: "sec", ordre: 7, typeExercice: "gainage" }),
            ]},
          },
          {
            nom: "Force Bas A + Power clean", type: "force", freq: "1x/semaine", jour: "Mardi", lieu: "salle",
            note: "Power clean en début — charges plus lourdes qu'au Bloc 1. Récupération 2-3min.",
            exercices: { create: [
              exo({ nom: "Power clean ⚡", series: 4, reps: "4-5", chargeTarget: "55-65", ordre: 1, typeExercice: "olympique" }),
              exo({ nom: "Squat barre", series: 5, reps: "8", chargeTarget: "75-85", ordre: 2 }),
              exo({ nom: "Soulevé de terre", series: 4, reps: "6", chargeTarget: "80-90", ordre: 3 }),
              exo({ nom: "Fentes haltères", series: 4, reps: "10/jambe", chargeTarget: "2x16", ordre: 4 }),
              exo({ nom: "Leg press", series: 3, reps: "12", chargeTarget: "100-120", ordre: 5 }),
              exo({ nom: "Ischio machine", series: 3, reps: "10", chargeTarget: "50-60", ordre: 6 }),
              exo({ nom: "Farmer's carry", series: 3, reps: "25m", chargeTarget: "2x24", ordre: 7 }),
            ]},
          },
          {
            nom: "Intervalles VMA", type: "cardio", freq: "1x/semaine", jour: "Mercredi", lieu: "dehors",
            note: "10min échauffement → 10x30sec sprint / 90sec marche → 10min retour calme. Total ~40min.",
            exercices: { create: [
              exo({ nom: "Échauffement", series: 1, reps: "10min", chargeTarget: "Zone 2", unite: "min", ordre: 1, typeExercice: "cardio" }),
              exo({ nom: "Intervalles 30sec sprint", series: 10, reps: "30sec / 90sec récup", chargeTarget: "Max", unite: "", ordre: 2, typeExercice: "cardio" }),
              exo({ nom: "Retour calme", series: 1, reps: "10min", chargeTarget: "Zone 1", unite: "min", ordre: 3, typeExercice: "cardio" }),
            ]},
          },
          {
            nom: "Force Haut B", type: "force", freq: "1x/semaine", jour: "Jeudi", lieu: "salle",
            note: "Récupération 90 secondes entre les séries",
            exercices: { create: [
              exo({ nom: "Développé incliné", series: 4, reps: "8", chargeTarget: "60-65", ordre: 1 }),
              exo({ nom: "Rowing unilatéral", series: 4, reps: "10/côté", chargeTarget: "26-30", ordre: 2 }),
              exo({ nom: "Tractions lestées prise serrée", series: 3, reps: "6-8", chargeTarget: "+5", ordre: 3 }),
              exo({ nom: "Push press", series: 4, reps: "6", chargeTarget: "50-55", ordre: 4, typeExercice: "olympique" }),
              exo({ nom: "Tirage poulie haute", series: 3, reps: "10", chargeTarget: "60-70", ordre: 5 }),
              exo({ nom: "Gainage dynamique", series: 3, reps: "30sec", chargeTarget: "PDC", unite: "sec", ordre: 6, typeExercice: "gainage" }),
              exo({ nom: "Extensions nuque élastique", series: 3, reps: "15", chargeTarget: "Léger", unite: "", ordre: 7 }),
            ]},
          },
          {
            nom: "Force Bas B + Sprints", type: "force", freq: "1x/semaine", jour: "Vendredi", lieu: "salle",
            note: "Muscu puis sprints dehors. Hang clean en début de séance.",
            exercices: { create: [
              exo({ nom: "Hang clean ⚡", series: 4, reps: "4-5", chargeTarget: "55-65", ordre: 1, typeExercice: "olympique" }),
              exo({ nom: "Squat barre", series: 4, reps: "6", chargeTarget: "80-90", ordre: 2 }),
              exo({ nom: "Soulevé de terre", series: 3, reps: "5", chargeTarget: "90-100", ordre: 3 }),
              exo({ nom: "Fentes lestées", series: 3, reps: "8/jambe", chargeTarget: "2x18", ordre: 4 }),
              exo({ nom: "Sprints 8sec max", series: 10, reps: "8sec / 2min récup", chargeTarget: "Max", unite: "", ordre: 5, typeExercice: "cardio" }),
              exo({ nom: "Fractionné 20sec 85%", series: 4, reps: "20sec / 2min récup", chargeTarget: "85%", unite: "", ordre: 6, typeExercice: "cardio" }),
            ]},
          },
          {
            nom: "Footing Zone 2", type: "cardio", freq: "1x/semaine", jour: "Samedi", lieu: "dehors",
            note: "45-50min — peut intégrer 2-3 côtes légères",
            exercices: { create: [
              exo({ nom: "Footing zone 2", series: 1, reps: "45-50min", chargeTarget: "Zone 2", unite: "min", ordre: 1, typeExercice: "cardio" }),
            ]},
          },
        ],
      },
    },
  });

  // ─── BLOC 3 — Puissance + Vitesse (Semaines 7-9) ──────────────────────────
  await prisma.bloc.create({
    data: {
      numero: 3, nom: "Puissance + Vitesse", semaines: "7-9", couleur: "#f97316",
      seances: {
        create: [
          {
            nom: "Force Maximale Haut", type: "force", freq: "1x/semaine", jour: "Lundi", lieu: "salle",
            note: "Récupération 3 minutes — charges maximales, technique irréprochable",
            exercices: { create: [
              exo({ nom: "Développé couché", series: 5, reps: "4-5", chargeTarget: "80-87", ordre: 1 }),
              exo({ nom: "Rowing barre", series: 5, reps: "5", chargeTarget: "70-75", ordre: 2 }),
              exo({ nom: "Tractions lestées", series: 4, reps: "4-5", chargeTarget: "+10-12", ordre: 3 }),
              exo({ nom: "Push press lourd", series: 4, reps: "4", chargeTarget: "60-65", ordre: 4, typeExercice: "olympique" }),
              exo({ nom: "Dips lestés", series: 3, reps: "6", chargeTarget: "+10", ordre: 5 }),
              exo({ nom: "Gainage cervical", series: 3, reps: "30sec", chargeTarget: "PDC", unite: "sec", ordre: 6, typeExercice: "gainage" }),
            ]},
          },
          {
            nom: "Force Maximale Bas + Power clean lourd", type: "force", freq: "1x/semaine", jour: "Mardi", lieu: "salle",
            note: "Récupération 3 minutes — Power clean lourd en tête de séance",
            exercices: { create: [
              exo({ nom: "Power clean lourd ⚡", series: 5, reps: "3", chargeTarget: "70-80", ordre: 1, typeExercice: "olympique" }),
              exo({ nom: "Squat barre", series: 5, reps: "4-5", chargeTarget: "90-100", ordre: 2 }),
              exo({ nom: "Soulevé de terre", series: 4, reps: "4", chargeTarget: "100-110", ordre: 3 }),
              exo({ nom: "Fentes lestées", series: 3, reps: "8/jambe", chargeTarget: "2x20", ordre: 4 }),
              exo({ nom: "Ischio machine", series: 3, reps: "8", chargeTarget: "60-70", ordre: 5 }),
              exo({ nom: "Farmer's carry lourd", series: 3, reps: "20m", chargeTarget: "2x30", ordre: 6 }),
            ]},
          },
          {
            nom: "Circuit Puissance Placage", type: "circuit", freq: "1x/semaine", jour: "Mercredi", lieu: "salle",
            note: "4 tours — récupération 2min entre les tours. Explosivité maximale.",
            exercices: { create: [
              exo({ nom: "Power cleans explosifs ⚡", series: 4, reps: "4", chargeTarget: "50", ordre: 1, typeExercice: "olympique" }),
              exo({ nom: "Pompes explosives", series: 4, reps: "5", chargeTarget: "PDC", unite: "reps", ordre: 2 }),
              exo({ nom: "Squats sautés", series: 4, reps: "5", chargeTarget: "PDC", unite: "reps", ordre: 3 }),
              exo({ nom: "Navettes 20sec", series: 4, reps: "20sec", chargeTarget: "Max", unite: "", ordre: 4, typeExercice: "cardio" }),
              exo({ nom: "Tractions explosives", series: 4, reps: "8", chargeTarget: "PDC", unite: "reps", ordre: 5 }),
            ]},
          },
          {
            nom: "Puissance Haut + Gainage Rugby", type: "force", freq: "1x/semaine", jour: "Jeudi", lieu: "salle",
            note: "Récupération 2 minutes — vitesse d'exécution maximale sur les mouvements explosifs",
            exercices: { create: [
              exo({ nom: "Développé couché explosif", series: 4, reps: "5", chargeTarget: "65-70", ordre: 1 }),
              exo({ nom: "Push press explosif ⚡", series: 4, reps: "4", chargeTarget: "55", ordre: 2, typeExercice: "olympique" }),
              exo({ nom: "Rowing barre explosif", series: 4, reps: "5", chargeTarget: "60", ordre: 3 }),
              exo({ nom: "Tractions lestées", series: 4, reps: "5", chargeTarget: "+10", ordre: 4 }),
              exo({ nom: "Gainage anti-rotation", series: 3, reps: "30sec/côté", chargeTarget: "PDC", unite: "sec", ordre: 5, typeExercice: "gainage" }),
              exo({ nom: "Crunch torsion lesté", series: 3, reps: "15", chargeTarget: "10", ordre: 6, typeExercice: "gainage" }),
              exo({ nom: "Extensions nuque élastique", series: 3, reps: "15", chargeTarget: "Léger", unite: "", ordre: 7 }),
            ]},
          },
          {
            nom: "Vitesse Maximale", type: "cardio", freq: "1x/semaine", jour: "Vendredi", lieu: "dehors",
            note: "15min échauffement progressif — récupération complète entre les sprints",
            exercices: { create: [
              exo({ nom: "Échauffement progressif", series: 1, reps: "15min", chargeTarget: "Progressif", unite: "min", ordre: 1, typeExercice: "cardio" }),
              exo({ nom: "Sprints 6sec max", series: 6, reps: "6sec / 2min récup", chargeTarget: "Max", unite: "", ordre: 2, typeExercice: "cardio" }),
              exo({ nom: "Récup active", series: 1, reps: "5min", chargeTarget: "Marche", unite: "min", ordre: 3, typeExercice: "cardio" }),
              exo({ nom: "Accélérations 10sec", series: 5, reps: "10sec / 90sec récup", chargeTarget: "Progressif", unite: "", ordre: 4, typeExercice: "cardio" }),
              exo({ nom: "Fractionné 20sec 90%", series: 4, reps: "20sec / 2min récup", chargeTarget: "90%", unite: "", ordre: 5, typeExercice: "cardio" }),
            ]},
          },
          {
            nom: "Footing Zone 2", type: "cardio", freq: "1x/semaine", jour: "Samedi", lieu: "dehors",
            note: "50-55min — peut inclure quelques accélérations courtes en fin de footing",
            exercices: { create: [
              exo({ nom: "Footing zone 2", series: 1, reps: "50-55min", chargeTarget: "Zone 2", unite: "min", ordre: 1, typeExercice: "cardio" }),
            ]},
          },
        ],
      },
    },
  });

  // ─── BLOC 4 — Affûtage (Semaine 10) ───────────────────────────────────────
  await prisma.bloc.create({
    data: {
      numero: 4, nom: "Affûtage", semaines: "10", couleur: "#818cf8",
      seances: {
        create: [
          {
            nom: "Force maintien haut", type: "force", freq: "1x", jour: "Lundi", lieu: "salle",
            note: "Récupération 2 minutes — charges réduites, fraîcheur avant la reprise",
            exercices: { create: [
              exo({ nom: "Développé couché", series: 3, reps: "4", chargeTarget: "75", ordre: 1 }),
              exo({ nom: "Rowing barre", series: 3, reps: "5", chargeTarget: "65", ordre: 2 }),
              exo({ nom: "Tractions lestées", series: 3, reps: "4", chargeTarget: "+8", ordre: 3 }),
            ]},
          },
          {
            nom: "Force maintien bas", type: "force", freq: "1x", jour: "Mardi", lieu: "salle",
            note: "Récupération 2 minutes — pas de performance, juste maintenir",
            exercices: { create: [
              exo({ nom: "Power clean", series: 3, reps: "3", chargeTarget: "60", ordre: 1, typeExercice: "olympique" }),
              exo({ nom: "Squat barre", series: 3, reps: "4", chargeTarget: "80", ordre: 2 }),
              exo({ nom: "Soulevé de terre", series: 2, reps: "4", chargeTarget: "90", ordre: 3 }),
            ]},
          },
          {
            nom: "Cardio léger", type: "cardio", freq: "1x", jour: "Mercredi", lieu: "dehors",
            exercices: { create: [
              exo({ nom: "Footing zone 2", series: 1, reps: "25min", chargeTarget: "Zone 2", unite: "min", ordre: 1, typeExercice: "cardio" }),
            ]},
          },
          {
            nom: "Mobilité + Récup active", type: "mobilite", freq: "1x", jour: "Jeudi", lieu: "salle",
            note: "Étirements hanches, épaules, thoracique — 20min max",
            exercices: { create: [
              exo({ nom: "Étirements hanches", series: 1, reps: "5min", chargeTarget: "PDC", unite: "min", ordre: 1, typeExercice: "gainage" }),
              exo({ nom: "Étirements épaules", series: 1, reps: "5min", chargeTarget: "PDC", unite: "min", ordre: 2, typeExercice: "gainage" }),
              exo({ nom: "Mobilité thoracique", series: 1, reps: "5min", chargeTarget: "PDC", unite: "min", ordre: 3, typeExercice: "gainage" }),
            ]},
          },
          {
            nom: "Sprints réduits", type: "cardio", freq: "1x", jour: "Vendredi", lieu: "dehors",
            note: "10min échauffement → 5x6sec sprint max / 2min récup → 10min retour calme",
            exercices: { create: [
              exo({ nom: "Échauffement", series: 1, reps: "10min", chargeTarget: "Marche active", unite: "min", ordre: 1, typeExercice: "cardio" }),
              exo({ nom: "Sprints 6sec", series: 5, reps: "6sec / 2min récup", chargeTarget: "Max", unite: "", ordre: 2, typeExercice: "cardio" }),
              exo({ nom: "Retour calme", series: 1, reps: "10min", chargeTarget: "Marche", unite: "min", ordre: 3, typeExercice: "cardio" }),
            ]},
          },
        ],
      },
    },
  });

  const count = await prisma.seance.count();
  console.log(`✅ Seed terminé — 4 blocs, ${count} séances (6/sem B1-B3, 5/sem B4)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
