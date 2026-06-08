import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY manquant dans .env" }, { status: 500 });
    }
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const { message, sessionId } = await req.json();
    if (!message || !sessionId) {
      return NextResponse.json({ error: "message et sessionId requis" }, { status: 400 });
    }

    // Contexte : programme + logs 7 derniers jours
    const [blocs, recentLogs] = await Promise.all([
      prisma.bloc.findMany({
        orderBy: { numero: "asc" },
        include: { seances: { include: { exercices: true } } },
      }),
      prisma.logSeance.findMany({
        orderBy: { date: "desc" },
        take: 10,
        include: {
          seance: { include: { bloc: true } },
          series: { include: { exercice: true } },
        },
      }),
    ]);

    // Historique de la session en cours
    const history = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { date: "asc" },
    });

    // Sauvegarder le message utilisateur
    await prisma.chatMessage.create({
      data: { role: "user", content: message, sessionId },
    });

    const systemPrompt = `Tu es le coach sportif personnel de Tristan. Tu es direct, concis, bienveillant. Tu réponds TOUJOURS en français, en 2-4 phrases maximum sauf si on te demande un plan détaillé.

PROFIL :
- Homme, 77kg, 3ème ligne aile — RUSH Saint-Herblain
- Genou droit fémoro-patellaire : surveiller la douleur, jamais forcer
- Niveau : régulier depuis +1 an
- Objectif : prise de masse + vitesse + puissance placage
- Reprise de saison en septembre

PROGRAMME EN COURS :
${JSON.stringify(blocs.map((b: { numero: number; nom: string; semaines: string; seances: { nom: string; jour: string; exercices: { nom: string; series: number; reps: string; chargeTarget: string; unite: string | null }[] }[] }) => ({
  bloc: `Bloc ${b.numero} — ${b.nom} (semaines ${b.semaines})`,
  seances: b.seances.map((s) => ({
    nom: s.nom,
    jour: s.jour,
    exercices: s.exercices.map((e) => `${e.nom} ${e.series}x${e.reps} @ ${e.chargeTarget}${e.unite || ""}`),
  })),
})), null, 2)}

DERNIERS LOGS :
${JSON.stringify(recentLogs.map((l: { date: Date; fatigue: number; genouDouleur: number; analyse: string | null; seance: { nom: string }; series: { exercice: { nom: string }; chargeReelle: string; repsReelles: string; ressenti: string }[] }) => ({
  date: l.date,
  seance: l.seance.nom,
  fatigue: l.fatigue,
  genou: l.genouDouleur,
  series: l.series.map((s) => `${s.exercice.nom}: ${s.chargeReelle}×${s.repsReelles} (${s.ressenti})`),
  analyse: l.analyse ? l.analyse.slice(0, 200) : null,
})), null, 2)}`;

    const messages: Array<{ role: "user" | "assistant"; content: string }> = [
      ...history.map((m: { role: string; content: string }) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: message },
    ];

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system: systemPrompt,
      messages,
    });

    const reponse = response.content[0].type === "text" ? response.content[0].text : "";

    await prisma.chatMessage.create({
      data: { role: "assistant", content: reponse, sessionId },
    });

    return NextResponse.json({ reponse });
  } catch (err) {
    console.error("[chat]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
