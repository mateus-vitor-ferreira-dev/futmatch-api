import { afterAll, beforeAll } from "vitest";
import prisma from "../config/prisma.js";

beforeAll(async () => {
    await prisma.$executeRaw`
        TRUNCATE TABLE
            "Review",
            "Participation",
            "Pelada",
            "Court",
            "PlaceRequest",
            "Place",
            "Account",
            "User"
        CASCADE
    `;
});

afterAll(async () => {
    await prisma.$disconnect();
});
