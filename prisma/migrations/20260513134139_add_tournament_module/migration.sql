-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TournamentFormat" AS ENUM ('LEAGUE', 'KNOCKOUT', 'GROUPS_AND_KNOCKOUT', 'DOUBLE_ELIMINATION', 'SWISS');

-- CreateEnum
CREATE TYPE "TournamentParticipantType" AS ENUM ('TEAM', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "TournamentRegistrationMode" AS ENUM ('OPEN', 'APPROVAL_REQUIRED');

-- CreateEnum
CREATE TYPE "OrganizerType" AS ENUM ('PLACE', 'USER', 'COMPANY', 'OTHER');

-- CreateEnum
CREATE TYPE "CompetitionLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'AMATEUR', 'ADVANCED', 'PROFESSIONAL');

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "placeId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "organizerType" "OrganizerType" NOT NULL DEFAULT 'PLACE',
    "organizerName" TEXT,
    "organizerUserId" TEXT,
    "sportType" "CourtType" NOT NULL,
    "format" "TournamentFormat" NOT NULL,
    "participantType" "TournamentParticipantType" NOT NULL DEFAULT 'TEAM',
    "status" "TournamentStatus" NOT NULL DEFAULT 'DRAFT',
    "registrationMode" "TournamentRegistrationMode" NOT NULL DEFAULT 'OPEN',
    "registrationStartDate" TIMESTAMP(3),
    "registrationEndDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "maxParticipants" INTEGER,
    "registrationFee" DECIMAL(10,2),
    "paymentInstructions" TEXT,
    "pixKey" TEXT,
    "rules" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentDivision" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "genderRestriction" TEXT,
    "ageRestriction" TEXT,
    "level" "CompetitionLevel" NOT NULL DEFAULT 'AMATEUR',
    "minPlayersPerTeam" INTEGER NOT NULL DEFAULT 2,
    "maxPlayersPerTeam" INTEGER NOT NULL DEFAULT 2,
    "maxParticipants" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentDivision_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_organizerUserId_fkey" FOREIGN KEY ("organizerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentDivision" ADD CONSTRAINT "TournamentDivision_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
