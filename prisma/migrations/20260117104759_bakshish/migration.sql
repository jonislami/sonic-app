-- CreateTable
CREATE TABLE "public"."Bakshish" (
    "bakshishId" BIGSERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shuma" DECIMAL(65,30) NOT NULL,
    "menyra" TEXT NOT NULL DEFAULT 'Cash',
    "shenim" TEXT,
    "faktureId" BIGINT,

    CONSTRAINT "Bakshish_pkey" PRIMARY KEY ("bakshishId")
);

-- CreateIndex
CREATE INDEX "Bakshish_data_idx" ON "public"."Bakshish"("data");

-- CreateIndex
CREATE INDEX "Bakshish_faktureId_idx" ON "public"."Bakshish"("faktureId");

-- AddForeignKey
ALTER TABLE "public"."Bakshish" ADD CONSTRAINT "Bakshish_faktureId_fkey" FOREIGN KEY ("faktureId") REFERENCES "public"."Fakture"("faktureId") ON DELETE SET NULL ON UPDATE CASCADE;
