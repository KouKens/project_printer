-- CreateEnum
CREATE TYPE "OfferKind" AS ENUM ('GENUINE', 'RECYCLED', 'COMPATIBLE');

-- CreateEnum
CREATE TYPE "PurchaseType" AS ENUM ('SPOT', 'ONLINE', 'CONTRACT', 'SUBSCRIPTION', 'OTHER');

-- CreateTable
CREATE TABLE "toner_offers" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "brand" TEXT,
    "kind" "OfferKind" NOT NULL DEFAULT 'GENUINE',
    "color" TEXT,
    "yield_pages" INTEGER,
    "pack_quantity" INTEGER NOT NULL DEFAULT 1,
    "seller" TEXT NOT NULL,
    "purchase_type" "PurchaseType" NOT NULL DEFAULT 'SPOT',
    "price" INTEGER,
    "page_price" DOUBLE PRECISION,
    "monthly_fee" INTEGER,
    "shipping_fee" INTEGER,
    "min_order" INTEGER,
    "lead_time" TEXT,
    "warranty" TEXT,
    "takes_back" BOOLEAN,
    "payment" TEXT,
    "quoted_on" DATE,
    "valid_until" DATE,
    "reference" TEXT,
    "url" TEXT,
    "contact" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "toner_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "toner_offer_models" (
    "id" SERIAL NOT NULL,
    "offer_id" INTEGER NOT NULL,
    "maker" TEXT,
    "model" TEXT NOT NULL,

    CONSTRAINT "toner_offer_models_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "toner_offers_code_idx" ON "toner_offers"("code");

-- CreateIndex
CREATE INDEX "toner_offer_models_offer_id_idx" ON "toner_offer_models"("offer_id");

-- AddForeignKey
ALTER TABLE "toner_offer_models" ADD CONSTRAINT "toner_offer_models_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "toner_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
