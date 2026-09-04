-- AlterTable
ALTER TABLE "trips" ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_template" BOOLEAN NOT NULL DEFAULT false;
