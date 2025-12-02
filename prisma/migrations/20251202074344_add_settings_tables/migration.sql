-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "difficultyLevelId" TEXT;

-- CreateTable
CREATE TABLE "DifficultyLevel" (
    "id" TEXT NOT NULL,
    "nameFa" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DifficultyLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "nameFa" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequiredItem" (
    "id" TEXT NOT NULL,
    "nameFa" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequiredItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameCategory" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameRequiredItem" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "requiredItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameRequiredItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DifficultyLevel_value_key" ON "DifficultyLevel"("value");

-- CreateIndex
CREATE INDEX "GameCategory_gameId_idx" ON "GameCategory"("gameId");

-- CreateIndex
CREATE INDEX "GameCategory_categoryId_idx" ON "GameCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "GameCategory_gameId_categoryId_key" ON "GameCategory"("gameId", "categoryId");

-- CreateIndex
CREATE INDEX "GameRequiredItem_gameId_idx" ON "GameRequiredItem"("gameId");

-- CreateIndex
CREATE INDEX "GameRequiredItem_requiredItemId_idx" ON "GameRequiredItem"("requiredItemId");

-- CreateIndex
CREATE UNIQUE INDEX "GameRequiredItem_gameId_requiredItemId_key" ON "GameRequiredItem"("gameId", "requiredItemId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_difficultyLevelId_fkey" FOREIGN KEY ("difficultyLevelId") REFERENCES "DifficultyLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameCategory" ADD CONSTRAINT "GameCategory_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameCategory" ADD CONSTRAINT "GameCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRequiredItem" ADD CONSTRAINT "GameRequiredItem_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRequiredItem" ADD CONSTRAINT "GameRequiredItem_requiredItemId_fkey" FOREIGN KEY ("requiredItemId") REFERENCES "RequiredItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
