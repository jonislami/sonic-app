-- DropIndex
DROP INDEX "public"."InspektimKategori_emri_key";

-- AlterTable
ALTER TABLE "public"."InspektimKategoriItem" ADD COLUMN     "aktiv" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "InspektimKategori_emri_idx" ON "public"."InspektimKategori"("emri");

-- CreateIndex
CREATE INDEX "InspektimKategoriItem_aktiv_idx" ON "public"."InspektimKategoriItem"("aktiv");
