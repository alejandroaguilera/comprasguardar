-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('ONLINE', 'IN_STORE');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'ONLINE',
ALTER COLUMN "url" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Product_type_idx" ON "Product"("type");

