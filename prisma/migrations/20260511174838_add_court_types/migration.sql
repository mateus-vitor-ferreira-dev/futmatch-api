-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CourtType" ADD VALUE 'VOLEI';
ALTER TYPE "CourtType" ADD VALUE 'VOLEI_AREIA';
ALTER TYPE "CourtType" ADD VALUE 'HANDBALL';
ALTER TYPE "CourtType" ADD VALUE 'PETECA';
ALTER TYPE "CourtType" ADD VALUE 'BEACH_TENNIS';
ALTER TYPE "CourtType" ADD VALUE 'BASQUETE';
ALTER TYPE "CourtType" ADD VALUE 'TENIS';
