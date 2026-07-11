-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "hasCustomImage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "imageData" BYTEA,
ADD COLUMN     "imageMimeType" TEXT;

