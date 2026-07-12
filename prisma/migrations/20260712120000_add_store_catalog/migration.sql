-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_name_key" ON "Store"("name");

-- Backfill catalog with store names already used by existing products
INSERT INTO "Store" ("id", "name", "createdAt")
SELECT substr(md5(random()::text || clock_timestamp()::text), 1, 25), distinct_stores.store, CURRENT_TIMESTAMP
FROM (SELECT DISTINCT store FROM "Product") AS distinct_stores
ON CONFLICT ("name") DO NOTHING;

-- Seed catalog with the well-known online stores already recognized by the scraper
INSERT INTO "Store" ("id", "name", "createdAt")
SELECT substr(md5(random()::text || clock_timestamp()::text || seed.name), 1, 25), seed.name, CURRENT_TIMESTAMP
FROM (VALUES
  ('Amazon'), ('Amazon MX'), ('BestBuy'), ('Footlocker'),
  ('Adidas'), ('Nike'), ('Walmart'), ('Target'), ('eBay')
) AS seed(name)
ON CONFLICT ("name") DO NOTHING;

