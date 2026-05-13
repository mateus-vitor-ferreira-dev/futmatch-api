import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { truncateAll } from "../../tests/setupTests.js";
import { createUser, createPlace, createCourt, createEvent, tokenFor } from "../../tests/helpers/factories.js";
import prisma from "../../config/prisma.js";

const URL = (courtId, eventId) => `/courts/${courtId}/events/${eventId}/draw`;

describe("Draw Teams", () => {
    let admin, organizer, owner, player, outsider;
    let adminToken, organizerToken, ownerToken, playerToken, outsiderToken;
    let place, court;
    let waitingEvent, finishedEvent, cancelledEvent;

    beforeAll(async () => {
        await truncateAll();

        [admin, organizer, owner, player, outsider] = await Promise.all([
            createUser({ role: "ADMIN", email: "admin-draw@test.com" }),
            createUser({ role: "PLAYER", email: "organizer-draw@test.com" }),
            createUser({ role: "OWNER", email: "owner-draw@test.com" }),
            createUser({ role: "PLAYER", email: "player-draw@test.com" }),
            createUser({ role: "PLAYER", email: "outsider-draw@test.com" }),
        ]);

        adminToken = tokenFor(admin);
        organizerToken = tokenFor(organizer);
        ownerToken = tokenFor(owner);
        playerToken = tokenFor(player);
        outsiderToken = tokenFor(outsider);

        place = await createPlace({ ownerId: owner.id });
        court = await createCourt({ placeId: place.id });

        [waitingEvent, finishedEvent, cancelledEvent] = await Promise.all([
            createEvent({ courtId: court.id, organizerId: organizer.id }),
            createEvent({ courtId: court.id, organizerId: organizer.id, status: "FINISHED" }),
            createEvent({ courtId: court.id, organizerId: organizer.id, status: "CANCELLED" }),
        ]);

        // adiciona 6 participantes na pelada WAITING
        const extra = await Promise.all([
            createUser({ email: "p1-draw@test.com" }),
            createUser({ email: "p2-draw@test.com" }),
            createUser({ email: "p3-draw@test.com" }),
            createUser({ email: "p4-draw@test.com" }),
            createUser({ email: "p5-draw@test.com" }),
            createUser({ email: "p6-draw@test.com" }),
        ]);

        await Promise.all([
            ...extra.map((p) => prisma.participation.create({ data: { peladaId: waitingEvent.id, userId: p.id } })),
        ]);
    });

    // ─── Permissões ──────────────────────────────────────────────────────────

    describe("Permissões", () => {
        it("organizador sorteia times (200)", async () => {
            const res = await request(app)
                .post(URL(court.id, waitingEvent.id))
                .set("Authorization", organizerToken)
                .send({ teamCount: 2 });

            expect(res.status).toBe(200);
        });

        it("OWNER do place sorteia times (200)", async () => {
            const res = await request(app)
                .post(URL(court.id, waitingEvent.id))
                .set("Authorization", ownerToken)
                .send({ teamCount: 2 });

            expect(res.status).toBe(200);
        });

        it("ADMIN sorteia times (200)", async () => {
            const res = await request(app)
                .post(URL(court.id, waitingEvent.id))
                .set("Authorization", adminToken)
                .send({ teamCount: 2 });

            expect(res.status).toBe(200);
        });

        it("participante comum retorna 403", async () => {
            const res = await request(app)
                .post(URL(court.id, waitingEvent.id))
                .set("Authorization", playerToken)
                .send({ teamCount: 2 });

            expect(res.status).toBe(403);
        });

        it("outsider retorna 403", async () => {
            const res = await request(app)
                .post(URL(court.id, waitingEvent.id))
                .set("Authorization", outsiderToken)
                .send({ teamCount: 2 });

            expect(res.status).toBe(403);
        });

        it("sem autenticação retorna 401", async () => {
            const res = await request(app).post(URL(court.id, waitingEvent.id)).send({ teamCount: 2 });
            expect(res.status).toBe(401);
        });
    });

    // ─── Resultado do sorteio ────────────────────────────────────────────────

    describe("Resultado", () => {
        it("retorna estrutura correta com 2 times", async () => {
            const res = await request(app)
                .post(URL(court.id, waitingEvent.id))
                .set("Authorization", organizerToken)
                .send({ teamCount: 2 });

            expect(res.status).toBe(200);
            expect(res.body.data.teamCount).toBe(2);
            expect(res.body.data.totalPlayers).toBe(6);
            expect(res.body.data.teams).toHaveLength(2);
            expect(res.body.data.teams[0].name).toBe("Time 1");
            expect(res.body.data.teams[1].name).toBe("Time 2");
        });

        it("distribui jogadores equilibradamente entre os times", async () => {
            const res = await request(app)
                .post(URL(court.id, waitingEvent.id))
                .set("Authorization", organizerToken)
                .send({ teamCount: 2 });

            const sizes = res.body.data.teams.map((t) => t.players.length);
            const max = Math.max(...sizes);
            const min = Math.min(...sizes);
            // 6 jogadores em 2 times → 3 e 3
            expect(max - min).toBeLessThanOrEqual(1);
        });

        it("total de jogadores nos times bate com totalPlayers", async () => {
            const res = await request(app)
                .post(URL(court.id, waitingEvent.id))
                .set("Authorization", organizerToken)
                .send({ teamCount: 3 });

            const totalInTeams = res.body.data.teams.reduce((sum, t) => sum + t.players.length, 0);
            expect(totalInTeams).toBe(res.body.data.totalPlayers);
        });

        it("cada jogador tem id, name e avatarUrl", async () => {
            const res = await request(app)
                .post(URL(court.id, waitingEvent.id))
                .set("Authorization", organizerToken)
                .send({ teamCount: 2 });

            const player = res.body.data.teams[0].players[0];
            expect(player).toHaveProperty("id");
            expect(player).toHaveProperty("name");
            expect(player).toHaveProperty("avatarUrl");
        });

        it("sorteios diferentes geram ordens diferentes (não determinístico)", async () => {
            const draws = await Promise.all(
                Array.from({ length: 5 }, () =>
                    request(app)
                        .post(URL(court.id, waitingEvent.id))
                        .set("Authorization", organizerToken)
                        .send({ teamCount: 2 }),
                ),
            );

            const firstTeamIds = draws.map((r) => r.body.data.teams[0].players.map((p) => p.id).join(","));
            const unique = new Set(firstTeamIds);
            // Com 6 jogadores, é altamente improvável que 5 sorteios sejam idênticos
            expect(unique.size).toBeGreaterThan(1);
        });
    });

    // ─── Validações de status ────────────────────────────────────────────────

    describe("Status da pelada", () => {
        it("pelada FINISHED retorna 409", async () => {
            const res = await request(app)
                .post(URL(court.id, finishedEvent.id))
                .set("Authorization", organizerToken)
                .send({ teamCount: 2 });

            expect(res.status).toBe(409);
        });

        it("pelada CANCELLED retorna 409", async () => {
            const res = await request(app)
                .post(URL(court.id, cancelledEvent.id))
                .set("Authorization", organizerToken)
                .send({ teamCount: 2 });

            expect(res.status).toBe(409);
        });

        it("pelada inexistente retorna 404", async () => {
            const res = await request(app)
                .post(URL(court.id, "pelada-nao-existe"))
                .set("Authorization", adminToken)
                .send({ teamCount: 2 });

            expect(res.status).toBe(404);
        });
    });

    // ─── Validações de teamCount ─────────────────────────────────────────────

    describe("Validação de teamCount", () => {
        it("teamCount < 2 retorna 422", async () => {
            const res = await request(app)
                .post(URL(court.id, waitingEvent.id))
                .set("Authorization", organizerToken)
                .send({ teamCount: 1 });

            expect(res.status).toBe(422);
        });

        it("teamCount > 10 retorna 422", async () => {
            const res = await request(app)
                .post(URL(court.id, waitingEvent.id))
                .set("Authorization", organizerToken)
                .send({ teamCount: 11 });

            expect(res.status).toBe(422);
        });

        it("teamCount ausente retorna 422", async () => {
            const res = await request(app)
                .post(URL(court.id, waitingEvent.id))
                .set("Authorization", organizerToken)
                .send({});

            expect(res.status).toBe(422);
        });

        it("jogadores insuficientes para o teamCount retorna 409", async () => {
            // waitingEvent tem 6 participantes — pedir 7 times deve falhar
            const res = await request(app)
                .post(URL(court.id, waitingEvent.id))
                .set("Authorization", organizerToken)
                .send({ teamCount: 7 });

            expect(res.status).toBe(409);
        });
    });
});
