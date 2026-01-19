/*
  Warnings:

  - You are about to alter the column `shuma` on the `Bakshish` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "public"."Bakshish" ALTER COLUMN "shuma" SET DEFAULT 0,
ALTER COLUMN "shuma" SET DATA TYPE DECIMAL(12,2);

-- AddForeignKey
ALTER TABLE "public"."InventarLevizje" ADD CONSTRAINT "InventarLevizje_servisId_fkey" FOREIGN KEY ("servisId") REFERENCES "public"."Servis"("servisId") ON DELETE SET NULL ON UPDATE CASCADE;
