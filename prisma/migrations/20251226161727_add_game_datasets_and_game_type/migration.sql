-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "gameTypeId" TEXT;

-- CreateTable
CREATE TABLE "GameDataset" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameDataset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameDataset_gameId_idx" ON "GameDataset"("gameId");

-- CreateIndex
CREATE INDEX "GameDataset_datasetId_idx" ON "GameDataset"("datasetId");

-- CreateIndex
CREATE UNIQUE INDEX "GameDataset_gameId_datasetId_key" ON "GameDataset"("gameId", "datasetId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_gameTypeId_fkey" FOREIGN KEY ("gameTypeId") REFERENCES "GameType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameDataset" ADD CONSTRAINT "GameDataset_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameDataset" ADD CONSTRAINT "GameDataset_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
