-- CreateTable
CREATE TABLE "public"."Shpenzim" (
    "shpenzimId" BIGSERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kategoria" TEXT NOT NULL,
    "pershkrimi" TEXT,
    "shuma" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "menyra" TEXT,
    "furnizues" TEXT,
    "nrFature" TEXT,

    CONSTRAINT "Shpenzim_pkey" PRIMARY KEY ("shpenzimId")
);

-- CreateIndex
CREATE INDEX "Shpenzim_data_idx" ON "public"."Shpenzim"("data");

-- CreateIndex
CREATE INDEX "Shpenzim_kategoria_idx" ON "public"."Shpenzim"("kategoria");
