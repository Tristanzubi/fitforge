import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const blocs = await prisma.bloc.findMany({
    orderBy: { numero: "asc" },
    include: {
      seances: {
        include: {
          exercices: { orderBy: { ordre: "asc" } },
          logs: { orderBy: { date: "desc" }, take: 1 },
        },
      },
    },
  });
  return NextResponse.json(blocs);
}
