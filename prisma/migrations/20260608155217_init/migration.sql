-- CreateTable
CREATE TABLE "Bloc" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "semaines" TEXT NOT NULL,
    "couleur" TEXT NOT NULL,

    CONSTRAINT "Bloc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seance" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "freq" TEXT NOT NULL,
    "note" TEXT,
    "blocId" TEXT NOT NULL,

    CONSTRAINT "Seance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercice" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "series" INTEGER NOT NULL,
    "reps" TEXT NOT NULL,
    "chargeTarget" TEXT NOT NULL,
    "unite" TEXT,
    "isGenou" BOOLEAN NOT NULL DEFAULT false,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "seanceId" TEXT NOT NULL,

    CONSTRAINT "Exercice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogSeance" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seanceId" TEXT NOT NULL,
    "genouDouleur" INTEGER NOT NULL,
    "fatigue" INTEGER NOT NULL,
    "noteLibre" TEXT,
    "analyse" TEXT,

    CONSTRAINT "LogSeance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogSerie" (
    "id" TEXT NOT NULL,
    "logSeanceId" TEXT NOT NULL,
    "exerciceId" TEXT NOT NULL,
    "numeroSerie" INTEGER NOT NULL,
    "chargeReelle" TEXT NOT NULL,
    "repsReelles" TEXT NOT NULL,
    "ressenti" TEXT NOT NULL,

    CONSTRAINT "LogSerie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AjustementClaude" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prompt" TEXT NOT NULL,
    "reponse" TEXT NOT NULL,
    "actions" JSONB NOT NULL,

    CONSTRAINT "AjustementClaude_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_blocId_fkey" FOREIGN KEY ("blocId") REFERENCES "Bloc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercice" ADD CONSTRAINT "Exercice_seanceId_fkey" FOREIGN KEY ("seanceId") REFERENCES "Seance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogSeance" ADD CONSTRAINT "LogSeance_seanceId_fkey" FOREIGN KEY ("seanceId") REFERENCES "Seance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogSerie" ADD CONSTRAINT "LogSerie_logSeanceId_fkey" FOREIGN KEY ("logSeanceId") REFERENCES "LogSeance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogSerie" ADD CONSTRAINT "LogSerie_exerciceId_fkey" FOREIGN KEY ("exerciceId") REFERENCES "Exercice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
