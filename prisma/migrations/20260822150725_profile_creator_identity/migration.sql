-- AlterTable
ALTER TABLE "profiles" ADD COLUMN "username" TEXT,
ADD COLUMN "bio" TEXT,
ADD COLUMN "is_public" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");
