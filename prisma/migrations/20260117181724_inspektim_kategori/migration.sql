-- AlterTable
ALTER TABLE "public"."InspektimItem" ADD COLUMN     "kategoriId" BIGINT;

-- CreateTable
CREATE TABLE "public"."InspektimKategori" (
    "kategoriId" BIGSERIAL NOT NULL,
    "emri" TEXT NOT NULL,
    "pershkrimi" TEXT,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "renditja" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InspektimKategori_pkey" PRIMARY KEY ("kategoriId")
);

-- CreateTable
CREATE TABLE "public"."InspektimKategoriItem" (
    "kategoriItemId" BIGSERIAL NOT NULL,
    "kategoriId" BIGINT NOT NULL,
    "key" TEXT NOT NULL,
    "etikete" TEXT NOT NULL,
    "renditja" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InspektimKategoriItem_pkey" PRIMARY KEY ("kategoriItemId")
);

-- CreateIndex
CREATE UNIQUE INDEX "InspektimKategori_emri_key" ON "public"."InspektimKategori"("emri");

-- CreateIndex
CREATE INDEX "InspektimKategori_aktiv_idx" ON "public"."InspektimKategori"("aktiv");

-- CreateIndex
CREATE INDEX "InspektimKategori_renditja_idx" ON "public"."InspektimKategori"("renditja");

-- CreateIndex
CREATE INDEX "InspektimKategoriItem_kategoriId_idx" ON "public"."InspektimKategoriItem"("kategoriId");

-- CreateIndex
CREATE INDEX "InspektimKategoriItem_renditja_idx" ON "public"."InspektimKategoriItem"("renditja");

-- CreateIndex
CREATE UNIQUE INDEX "InspektimKategoriItem_kategoriId_key_key" ON "public"."InspektimKategoriItem"("kategoriId", "key");

-- CreateIndex
CREATE INDEX "InspektimItem_kategoriId_idx" ON "public"."InspektimItem"("kategoriId");

-- AddForeignKey
ALTER TABLE "public"."InspektimItem" ADD CONSTRAINT "InspektimItem_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "public"."InspektimKategori"("kategoriId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InspektimKategoriItem" ADD CONSTRAINT "InspektimKategoriItem_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "public"."InspektimKategori"("kategoriId") ON DELETE CASCADE ON UPDATE CASCADE;
