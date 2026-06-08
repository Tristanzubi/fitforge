-- AlterTable
ALTER TABLE "Exercice" ADD COLUMN     "typeExercice" TEXT NOT NULL DEFAULT 'force';

-- AlterTable
ALTER TABLE "LogSeance" ADD COLUMN     "statut" TEXT NOT NULL DEFAULT 'completee',
ALTER COLUMN "genouDouleur" SET DEFAULT 0,
ALTER COLUMN "fatigue" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Seance" ADD COLUMN     "lieu" TEXT NOT NULL DEFAULT 'salle';
