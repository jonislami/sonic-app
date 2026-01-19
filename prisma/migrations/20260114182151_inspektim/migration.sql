-- CreateTable
CREATE TABLE "public"."Inspektim" (
    "inspektimId" BIGSERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "automjetId" BIGINT NOT NULL,
    "km" BIGINT,
    "komente" TEXT,
    "statusi" TEXT NOT NULL DEFAULT 'Draft',

    CONSTRAINT "Inspektim_pkey" PRIMARY KEY ("inspektimId")
);

-- CreateTable
CREATE TABLE "public"."InspektimItem" (
    "itemId" BIGSERIAL NOT NULL,
    "inspektimId" BIGINT NOT NULL,
    "grup" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "etikete" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "InspektimItem_pkey" PRIMARY KEY ("itemId")
);

-- CreateIndex
CREATE INDEX "Inspektim_automjetId_idx" ON "public"."Inspektim"("automjetId");

-- CreateIndex
CREATE INDEX "Inspektim_data_idx" ON "public"."Inspektim"("data");

-- CreateIndex
CREATE INDEX "InspektimItem_inspektimId_idx" ON "public"."InspektimItem"("inspektimId");

-- CreateIndex
CREATE UNIQUE INDEX "InspektimItem_inspektimId_key_key" ON "public"."InspektimItem"("inspektimId", "key");

-- AddForeignKey
ALTER TABLE "public"."Inspektim" ADD CONSTRAINT "Inspektim_automjetId_fkey" FOREIGN KEY ("automjetId") REFERENCES "public"."Automjet"("automjetId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InspektimItem" ADD CONSTRAINT "InspektimItem_inspektimId_fkey" FOREIGN KEY ("inspektimId") REFERENCES "public"."Inspektim"("inspektimId") ON DELETE CASCADE ON UPDATE CASCADE;
