import { afterAll } from "vitest";
import prisma from "../config/prisma.js";

export async function truncateAll() {
    await prisma.$executeRaw`
        TRUNCATE TABLE
            "Review",
            "Participation",
            "Pelada",
            "TournamentDivision",
            "Tournament",
            "Court",
            "PlaceRequest",
            "Place",
            "Account",
            "User"
        CASCADE
    `;
}

afterAll(async () => {
    await prisma.$disconnect();
});
