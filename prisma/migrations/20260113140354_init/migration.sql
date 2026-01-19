-- CreateTable
CREATE TABLE "public"."Klient" (
    "klientId" BIGSERIAL NOT NULL,
    "emri" TEXT NOT NULL,
    "mbiemri" TEXT,
    "telefoni" TEXT,
    "email" TEXT,
    "adresa" TEXT,
    "dataRegjistrimit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Klient_pkey" PRIMARY KEY ("klientId")
);

-- CreateTable
CREATE TABLE "public"."Automjet" (
    "automjetId" BIGSERIAL NOT NULL,
    "klientId" BIGINT NOT NULL,
    "marka" TEXT,
    "modeli" TEXT,
    "viti" INTEGER,
    "targa" TEXT,
    "vin" TEXT,
    "motori" TEXT,
    "kmAktuale" BIGINT,

    CONSTRAINT "Automjet_pkey" PRIMARY KEY ("automjetId")
);

-- CreateTable
CREATE TABLE "public"."Servis" (
    "servisId" BIGSERIAL NOT NULL,
    "automjetId" BIGINT NOT NULL,
    "dataServisit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kmNeServis" BIGINT,
    "pershkrimi" TEXT,
    "statusi" TEXT NOT NULL DEFAULT 'Hap',

    CONSTRAINT "Servis_pkey" PRIMARY KEY ("servisId")
);

-- CreateTable
CREATE TABLE "public"."PuneServisi" (
    "puneId" BIGSERIAL NOT NULL,
    "servisId" BIGINT NOT NULL,
    "pershkrimi" TEXT NOT NULL,
    "sasia" INTEGER NOT NULL DEFAULT 1,
    "cmimi" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totali" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "PuneServisi_pkey" PRIMARY KEY ("puneId")
);

-- CreateTable
CREATE TABLE "public"."PjeseServisi" (
    "pjeseId" BIGSERIAL NOT NULL,
    "servisId" BIGINT NOT NULL,
    "pershkrimi" TEXT NOT NULL,
    "sasia" INTEGER NOT NULL DEFAULT 1,
    "cmimi" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totali" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "furnizues" TEXT,
    "inventarId" BIGINT,

    CONSTRAINT "PjeseServisi_pkey" PRIMARY KEY ("pjeseId")
);

-- CreateTable
CREATE TABLE "public"."PagesaServisi" (
    "pagesaId" BIGSERIAL NOT NULL,
    "servisId" BIGINT NOT NULL,
    "dataPageses" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "menyra" TEXT NOT NULL DEFAULT 'Cash',
    "shuma" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "shenim" TEXT,

    CONSTRAINT "PagesaServisi_pkey" PRIMARY KEY ("pagesaId")
);

-- CreateTable
CREATE TABLE "public"."Fakture" (
    "faktureId" BIGSERIAL NOT NULL,
    "nrFakture" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valuta" TEXT NOT NULL DEFAULT 'EUR',
    "statusi" TEXT NOT NULL DEFAULT 'Hap',
    "klientId" BIGINT NOT NULL,
    "automjetId" BIGINT,
    "servisId" BIGINT,
    "shenim" TEXT,

    CONSTRAINT "Fakture_pkey" PRIMARY KEY ("faktureId")
);

-- CreateTable
CREATE TABLE "public"."FaktureRresht" (
    "rreshtId" BIGSERIAL NOT NULL,
    "faktureId" BIGINT NOT NULL,
    "pershkrimi" TEXT NOT NULL,
    "sasia" INTEGER NOT NULL DEFAULT 1,
    "cmimi" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totali" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "FaktureRresht_pkey" PRIMARY KEY ("rreshtId")
);

-- CreateTable
CREATE TABLE "public"."FakturePagesa" (
    "pagesaId" BIGSERIAL NOT NULL,
    "faktureId" BIGINT NOT NULL,
    "dataPageses" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "menyra" TEXT NOT NULL DEFAULT 'Cash',
    "shuma" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "shenim" TEXT,

    CONSTRAINT "FakturePagesa_pkey" PRIMARY KEY ("pagesaId")
);

-- CreateTable
CREATE TABLE "public"."Shpenzim" (
    "shpenzimId" BIGSERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kategoria" TEXT NOT NULL,
    "pershkrimi" TEXT,
    "shuma" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "furnizues" TEXT,

    CONSTRAINT "Shpenzim_pkey" PRIMARY KEY ("shpenzimId")
);

-- CreateTable
CREATE TABLE "public"."Furnizues" (
    "furnizuesId" BIGSERIAL NOT NULL,
    "emri" TEXT NOT NULL,
    "telefoni" TEXT,
    "email" TEXT,
    "adresa" TEXT,

    CONSTRAINT "Furnizues_pkey" PRIMARY KEY ("furnizuesId")
);

-- CreateTable
CREATE TABLE "public"."InventarPjese" (
    "inventarId" BIGSERIAL NOT NULL,
    "kodi" TEXT,
    "emri" TEXT NOT NULL,
    "marka" TEXT,
    "modeli" TEXT,
    "sasiaStok" INTEGER NOT NULL DEFAULT 0,
    "cmimiBlerje" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "cmimiShitje" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "furnizuesId" BIGINT,

    CONSTRAINT "InventarPjese_pkey" PRIMARY KEY ("inventarId")
);

-- CreateTable
CREATE TABLE "public"."InventarLevizje" (
    "levizjeId" BIGSERIAL NOT NULL,
    "inventarId" BIGINT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipi" TEXT NOT NULL,
    "sasia" INTEGER NOT NULL,
    "cmimi" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "shenim" TEXT,

    CONSTRAINT "InventarLevizje_pkey" PRIMARY KEY ("levizjeId")
);

-- CreateIndex
CREATE INDEX "Automjet_klientId_idx" ON "public"."Automjet"("klientId");

-- CreateIndex
CREATE INDEX "Servis_automjetId_idx" ON "public"."Servis"("automjetId");

-- CreateIndex
CREATE INDEX "Servis_dataServisit_idx" ON "public"."Servis"("dataServisit");

-- CreateIndex
CREATE INDEX "PuneServisi_servisId_idx" ON "public"."PuneServisi"("servisId");

-- CreateIndex
CREATE INDEX "PjeseServisi_servisId_idx" ON "public"."PjeseServisi"("servisId");

-- CreateIndex
CREATE INDEX "PjeseServisi_inventarId_idx" ON "public"."PjeseServisi"("inventarId");

-- CreateIndex
CREATE INDEX "PagesaServisi_servisId_idx" ON "public"."PagesaServisi"("servisId");

-- CreateIndex
CREATE INDEX "PagesaServisi_dataPageses_idx" ON "public"."PagesaServisi"("dataPageses");

-- CreateIndex
CREATE UNIQUE INDEX "Fakture_nrFakture_key" ON "public"."Fakture"("nrFakture");

-- CreateIndex
CREATE INDEX "Fakture_klientId_idx" ON "public"."Fakture"("klientId");

-- CreateIndex
CREATE INDEX "Fakture_data_idx" ON "public"."Fakture"("data");

-- CreateIndex
CREATE INDEX "Fakture_statusi_idx" ON "public"."Fakture"("statusi");

-- CreateIndex
CREATE INDEX "FaktureRresht_faktureId_idx" ON "public"."FaktureRresht"("faktureId");

-- CreateIndex
CREATE INDEX "FakturePagesa_faktureId_idx" ON "public"."FakturePagesa"("faktureId");

-- CreateIndex
CREATE INDEX "FakturePagesa_dataPageses_idx" ON "public"."FakturePagesa"("dataPageses");

-- CreateIndex
CREATE INDEX "Shpenzim_data_idx" ON "public"."Shpenzim"("data");

-- CreateIndex
CREATE INDEX "Shpenzim_kategoria_idx" ON "public"."Shpenzim"("kategoria");

-- CreateIndex
CREATE INDEX "Furnizues_emri_idx" ON "public"."Furnizues"("emri");

-- CreateIndex
CREATE INDEX "InventarPjese_emri_idx" ON "public"."InventarPjese"("emri");

-- CreateIndex
CREATE INDEX "InventarPjese_furnizuesId_idx" ON "public"."InventarPjese"("furnizuesId");

-- CreateIndex
CREATE INDEX "InventarLevizje_inventarId_idx" ON "public"."InventarLevizje"("inventarId");

-- CreateIndex
CREATE INDEX "InventarLevizje_data_idx" ON "public"."InventarLevizje"("data");

-- AddForeignKey
ALTER TABLE "public"."Automjet" ADD CONSTRAINT "Automjet_klientId_fkey" FOREIGN KEY ("klientId") REFERENCES "public"."Klient"("klientId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Servis" ADD CONSTRAINT "Servis_automjetId_fkey" FOREIGN KEY ("automjetId") REFERENCES "public"."Automjet"("automjetId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PuneServisi" ADD CONSTRAINT "PuneServisi_servisId_fkey" FOREIGN KEY ("servisId") REFERENCES "public"."Servis"("servisId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PjeseServisi" ADD CONSTRAINT "PjeseServisi_servisId_fkey" FOREIGN KEY ("servisId") REFERENCES "public"."Servis"("servisId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PjeseServisi" ADD CONSTRAINT "PjeseServisi_inventarId_fkey" FOREIGN KEY ("inventarId") REFERENCES "public"."InventarPjese"("inventarId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PagesaServisi" ADD CONSTRAINT "PagesaServisi_servisId_fkey" FOREIGN KEY ("servisId") REFERENCES "public"."Servis"("servisId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Fakture" ADD CONSTRAINT "Fakture_klientId_fkey" FOREIGN KEY ("klientId") REFERENCES "public"."Klient"("klientId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Fakture" ADD CONSTRAINT "Fakture_automjetId_fkey" FOREIGN KEY ("automjetId") REFERENCES "public"."Automjet"("automjetId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FaktureRresht" ADD CONSTRAINT "FaktureRresht_faktureId_fkey" FOREIGN KEY ("faktureId") REFERENCES "public"."Fakture"("faktureId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FakturePagesa" ADD CONSTRAINT "FakturePagesa_faktureId_fkey" FOREIGN KEY ("faktureId") REFERENCES "public"."Fakture"("faktureId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventarPjese" ADD CONSTRAINT "InventarPjese_furnizuesId_fkey" FOREIGN KEY ("furnizuesId") REFERENCES "public"."Furnizues"("furnizuesId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventarLevizje" ADD CONSTRAINT "InventarLevizje_inventarId_fkey" FOREIGN KEY ("inventarId") REFERENCES "public"."InventarPjese"("inventarId") ON DELETE CASCADE ON UPDATE CASCADE;
