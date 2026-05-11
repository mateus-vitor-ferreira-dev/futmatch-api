/*
  Warnings:

  - You are about to drop the column `address` on the `Court` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Court` table. All the data in the column will be lost.
  - Added the required column `placeId` to the `Court` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Court` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlaceStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "CourtType" AS ENUM ('SOCIETY', 'CAMPO', 'FUTSAL', 'AREIA');

-- DropForeignKey
ALTER TABLE "Court" DROP CONSTRAINT "Court_ownerId_fkey";

-- AlterTable
ALTER TABLE "Court" DROP COLUMN "address",
DROP COLUMN "ownerId",
ADD COLUMN     "placeId" TEXT NOT NULL,
ADD COLUMN     "type" "CourtType" NOT NULL;

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'BR',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "PlaceStatus" NOT NULL DEFAULT 'OPEN',
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Court" ADD CONSTRAINT "Court_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
