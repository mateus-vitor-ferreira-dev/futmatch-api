import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import prisma from "../../config/prisma.js";
import { signToken } from "../../config/jwt.js";

const TEST_PASSWORD = "senha123";

export async function createUser({ role = "PLAYER", email, name, ...rest } = {}) {
    const user = await prisma.user.create({
        data: {
            name: name ?? `User ${role}`,
            email: email ?? `${role.toLowerCase()}-${randomUUID()}@test.com`,
            password: await bcrypt.hash(TEST_PASSWORD, 10),
            role,
            ...rest,
        },
    });
    return user;
}

export function tokenFor(user) {
    return `Bearer ${signToken({ sub: user.id, name: user.name, email: user.email, role: user.role })}`;
}

export async function createPlace({ ownerId, ...rest } = {}) {
    return prisma.place.create({
        data: {
            name: "Arena Teste",
            street: "Rua das Flores",
            number: "100",
            neighborhood: "Centro",
            city: "São Paulo",
            state: "SP",
            zipCode: "01310-100",
            ownerId: ownerId ?? null,
            ...rest,
        },
    });
}

export async function createCourt({ placeId, ...rest } = {}) {
    return prisma.court.create({
        data: {
            name: "Quadra 1",
            type: "FUTSAL",
            placeId,
            ...rest,
        },
    });
}

export function futureDate(daysAhead = 7) {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(14, 0, 0, 0);
    return d;
}

export async function createEvent({ courtId, organizerId, date, ...rest } = {}) {
    return prisma.pelada.create({
        data: {
            courtId,
            organizerId,
            date: date ?? futureDate(),
            maxPlayers: 10,
            totalValue: 100,
            pixKey: "organizador@pix.com",
            ...rest,
        },
    });
}

export async function createTournament({ placeId, createdById, ...rest } = {}) {
    return prisma.tournament.create({
        data: {
            name: "Copa FutMatch",
            sportType: "AREIA",
            format: "LEAGUE",
            placeId,
            createdById,
            ...rest,
        },
    });
}

export async function createTournamentDivision({ tournamentId, ...rest } = {}) {
    return prisma.tournamentDivision.create({
        data: {
            name: "Masculino Iniciante",
            level: "BEGINNER",
            minPlayersPerTeam: 2,
            maxPlayersPerTeam: 2,
            tournamentId,
            ...rest,
        },
    });
}
