import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
  const { logSeanceId } = await req.json();

  // Fetch the completed session with full context
  const logSeance = await prisma.logSeance.findUnique({
    where: { id: logSeanceId },
    include: {
      seance: { include: { bloc: true, exercices: true } },
      series: { include: { exercice: true } },
    },
  });
  if (!logSeance) return NextResponse.json({ error: "Log introuvable" }, { status: 404 });

  // Fetch full program
  const blocs = await prisma.bloc.findMany({
    orderBy: { numero: "asc" },
    include: { seances: { include: { exercices: true } } },
  });

  // Fetch recent history (last 10 sessions)
  const historique = await prisma.logSeance.findMany({
    orderBy: { date: "desc" },
    take: 10,
    include: {
      seance: { include: { bloc: true } },
      series: { include: { exercice: true } },
    },
  });

  const prompt = `Tu es un coach sportif expert en préparation physique rugby. Réponds UNIQUEMENT en JSON valide, sans markdown.

PROFIL:
- Tristan, 77kg, 3ème ligne aile — RUSH Saint-Herblain
- Qualités prioritaires : explosivité, endurance répétée, puissance placage, vitesse
- Genou droit fémoro-patellaire : surveiller douleur, signaler si ça chauffe
- Niveau : régulier depuis +1 an
- Objectif : reprise de saison septembre, masse + vitesse + puissance placage
- Programme : 6 séances/semaine (Lun-Sam), mouvements olympiques intégrés

PROGRAMME COMPLET:
${JSON.stringify(blocs, null, 2)}

HISTORIQUE DES 10 DERNIÈRES SÉANCES:
${JSON.stringify(historique, null, 2)}

SÉANCE COMPLÉTÉE:
${JSON.stringify(logSeance, null, 2)}

RÈGLES MÉTIER (non négociables):
1. genouDouleur >= 2 sur 2 séances consécutives → action "reculer_bloc"
2. Ressenti "trop" sur 3 séries consécutives d'un exercice → réduire charge de 10%
3. Ressenti "facile" sur TOUTES les séries pendant 2 séances consécutives → augmenter charge de 5%
4. Exercices typeExercice="olympique" : JAMAIS augmentés automatiquement sans validation explicite
5. Exercices isGenou=true : JAMAIS augmentés automatiquement
6. Bloc 4 (Affûtage) : JAMAIS modifié par Claude
7. Alerte si 2+ séances skippées sur même groupe musculaire en 7 jours

Retourne UNIQUEMENT ce JSON (sans \`\`\`):
{
  "analyse": "3-4 phrases en français, orientées rugby/poste 3ème ligne",
  "alertes": ["alerte si règle déclenchée"],
  "actions": [
    {
      "type": "update_charge",
      "exerciceId": "xxx",
      "nouvelleCharge": "75",
      "raison": "..."
    }
  ]
}

Types d'actions: update_charge, update_reps, reculer_bloc, ajouter_exercice`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const reponseText = response.content[0].type === "text" ? response.content[0].text : "";

  let actions: unknown[] = [];
  try {
    const parsed = JSON.parse(reponseText);
    actions = parsed.actions ?? [];

    // Apply actions to the database
    for (const action of actions as Array<{ type: string; exerciceId?: string; nouvelleCharge?: string; nouvellesReps?: string }>) {
      if (action.type === "update_charge" && action.exerciceId) {
        const exercice = await prisma.exercice.findUnique({ where: { id: action.exerciceId } });
        if (exercice && !exercice.isGenou) {
          await prisma.exercice.update({
            where: { id: action.exerciceId },
            data: { chargeTarget: action.nouvelleCharge ?? exercice.chargeTarget },
          });
        }
      }
      if (action.type === "update_reps" && action.exerciceId) {
        await prisma.exercice.update({
          where: { id: action.exerciceId },
          data: { reps: action.nouvellesReps ?? "" },
        });
      }
    }

    // Save the analysis
    await prisma.logSeance.update({
      where: { id: logSeanceId },
      data: { analyse: reponseText },
    });

    await prisma.ajustementClaude.create({
      data: { prompt, reponse: reponseText, actions: actions as object[] },
    });
  } catch {
    // Store raw response even if parsing fails
    await prisma.logSeance.update({
      where: { id: logSeanceId },
      data: { analyse: reponseText },
    });
  }

  return NextResponse.json({ reponse: reponseText, actions });
  } catch (err) {
    console.error("[analyse]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
