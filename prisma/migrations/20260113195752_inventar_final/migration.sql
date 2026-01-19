/*
  Warnings:

  - You are about to alter the column `shuma` on the `FakturePagesa` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `cmimi` on the `FaktureRresht` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `totali` on the `FaktureRresht` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `cmimi` on the `InventarLevizje` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `cmimiBlerje` on the `InventarPjese` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `cmimiShitje` on the `InventarPjese` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `shuma` on the `PagesaServisi` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `cmimi` on the `PjeseServisi` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `totali` on the `PjeseServisi` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `cmimi` on the `PuneServisi` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `totali` on the `PuneServisi` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to drop the `Shpenzim` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Automjet" DROP CONSTRAINT "Automjet_klientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Servis" DROP CONSTRAINT "Servis_automjetId_fkey";

-- AlterTable
ALTER TABLE "public"."FakturePagesa" ALTER COLUMN "shuma" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."FaktureRresht" ALTER COLUMN "cmimi" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "totali" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."InventarLevizje" ADD COLUMN     "servisId" BIGINT,
ALTER COLUMN "cmimi" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."InventarPjese" ALTER COLUMN "cmimiBlerje" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "cmimiShitje" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."PagesaServisi" ALTER COLUMN "shuma" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."PjeseServisi" ALTER COLUMN "cmimi" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "totali" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."PuneServisi" ALTER COLUMN "cmimi" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "totali" SET DATA TYPE DECIMAL(12,2);

-- DropTable
DROP TABLE "public"."Shpenzim";

-- CreateIndex
CREATE INDEX "Automjet_targa_idx" ON "public"."Automjet"("targa");

-- CreateIndex
CREATE INDEX "Automjet_vin_idx" ON "public"."Automjet"("vin");

-- CreateIndex
CREATE INDEX "Fakture_automjetId_idx" ON "public"."Fakture"("automjetId");

-- CreateIndex
CREATE INDEX "Fakture_servisId_idx" ON "public"."Fakture"("servisId");

-- CreateIndex
CREATE INDEX "InventarLevizje_servisId_idx" ON "public"."InventarLevizje"("servisId");

-- CreateIndex
CREATE INDEX "InventarPjese_kodi_idx" ON "public"."InventarPjese"("kodi");

-- CreateIndex
CREATE INDEX "Klient_emri_idx" ON "public"."Klient"("emri");

-- CreateIndex
CREATE INDEX "Klient_telefoni_idx" ON "public"."Klient"("telefoni");

-- CreateIndex
CREATE INDEX "Servis_statusi_idx" ON "public"."Servis"("statusi");

-- AddForeignKey
ALTER TABLE "public"."Automjet" ADD CONSTRAINT "Automjet_klientId_fkey" FOREIGN KEY ("klientId") REFERENCES "public"."Klient"("klientId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Servis" ADD CONSTRAINT "Servis_automjetId_fkey" FOREIGN KEY ("automjetId") REFERENCES "public"."Automjet"("automjetId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Fakture" ADD CONSTRAINT "Fakture_servisId_fkey" FOREIGN KEY ("servisId") REFERENCES "public"."Servis"("servisId") ON DELETE SET NULL ON UPDATE CASCADE;
