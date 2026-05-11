-- CreateEnum
CREATE TYPE "CourtStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'OWNER';

-- AlterTable
ALTER TABLE "Court" ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "pricePerHour" DECIMAL(10,2),
ADD COLUMN     "status" "CourtStatus" NOT NULL DEFAULT 'OPEN';

-- AddForeignKey
ALTER TABLE "Court" ADD CONSTRAINT "Court_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
