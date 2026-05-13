import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { truncateAll } from "../../tests/setupTests.js";
import { createUser, createPlace, createCourt, createEvent, tokenFor } from "../../tests/helpers/factories.js";
import prisma from "../../config/prisma.js";

const BASE = (courtId, eventId) => `/courts/${courtId}/events/${eventId}`;

describe("Reviews", () => {
    let admin, player1, player2, player3, outsider;
    let adminToken, player1Token, player2Token, player3Token, outsiderToken;
    let place, court, finishedEvent, openEvent;

    beforeAll(async () => {
        await truncateAll();

        [admin, player1, player2, player3, outsider] = await Promise.all([
            createUser({ role: "ADMIN", email: "admin-reviews@test.com" }),
            createUser({ role: "PLAYER", email: "player1-reviews@test.com" }),
            createUser({ role: "PLAYER", email: "player2-reviews@test.com" }),
            createUser({ role: "PLAYER", email: "player3-reviews@test.com" }),
            createUser({ role: "PLAYER", email: "outsider-reviews@test.com" }),
        ]);

        adminToken = tokenFor(admin);
        player1Token = tokenFor(player1);
        player2Token = tokenFor(player2);
        player3Token = tokenFor(player3);
        outsiderToken = tokenFor(outsider);

        place = await createPlace({ ownerId: admin.id });
        court = await createCourt({ placeId: place.id });

        [finishedEvent, openEvent] = await Promise.all([
            createEvent({ courtId: court.id, organizerId: admin.id, status: "FINISHED" }),
            createEvent({ courtId: court.id, organizerId: admin.id }),
        ]);

        // player1, player2 e player3 participam da pelada finalizada
        await Promise.all([
            prisma.participation.create({ data: { peladaId: finishedEvent.id, userId: player1.id } }),
            prisma.participation.create({ data: { peladaId: finishedEvent.id, userId: player2.id } }),
            prisma.participation.create({ data: { peladaId: finishedEvent.id, userId: player3.id } }),
        ]);

        // player1 participa da pelada aberta
        await prisma.participation.create({ data: { peladaId: openEvent.id, userId: player1.id } });
    });

    // ─── POST /courts/:courtId/events/:eventId/reviews ───────────────────────

    describe("POST reviews", () => {
        it("participante avalia outro participante (201)", async () => {
            const res = await request(app)
                .post(`${BASE(court.id, finishedEvent.id)}/reviews`)
                .set("Authorization", player1Token)
                .send({ reviewedId: player2.id, stars: 5, tag: "CRAQUE_DA_PELADA", comment: "Ótimo jogador!" });

            expect(res.status).toBe(201);
            expect(res.body.data.stars).toBe(5);
            expect(res.body.data.tag).toBe("CRAQUE_DA_PELADA");
            expect(res.body.data.reviewer.id).toBe(player1.id);
            expect(res.body.data.reviewed.id).toBe(player2.id);
        });

        it("sem comentário também funciona (201)", async () => {
            const res = await request(app)
                .post(`${BASE(court.id, finishedEvent.id)}/reviews`)
                .set("Authorization", player2Token)
                .send({ reviewedId: player1.id, stars: 4, tag: "FAIR_PLAY" });

            expect(res.status).toBe(201);
            expect(res.body.data.comment).toBeNull();
        });

        it("não pode avaliar a si mesmo (400)", async () => {
            const res = await request(app)
                .post(`${BASE(court.id, finishedEvent.id)}/reviews`)
                .set("Authorization", player1Token)
                .send({ reviewedId: player1.id, stars: 5, tag: "PONTUAL" });

            expect(res.status).toBe(400);
        });

        it("pelada não finalizada rejeita avaliação (409)", async () => {
            const res = await request(app)
                .post(`${BASE(court.id, openEvent.id)}/reviews`)
                .set("Authorization", player1Token)
                .send({ reviewedId: player2.id, stars: 3, tag: "JOGA_FACIL" });

            expect(res.status).toBe(409);
        });

        it("quem não participou não pode avaliar (403)", async () => {
            const res = await request(app)
                .post(`${BASE(court.id, finishedEvent.id)}/reviews`)
                .set("Authorization", outsiderToken)
                .send({ reviewedId: player1.id, stars: 3, tag: "JOGA_FACIL" });

            expect(res.status).toBe(403);
        });

        it("não pode avaliar jogador que não participou (400)", async () => {
            const res = await request(app)
                .post(`${BASE(court.id, finishedEvent.id)}/reviews`)
                .set("Authorization", player1Token)
                .send({ reviewedId: outsider.id, stars: 2, tag: "PASSA_DE_ANO" });

            expect(res.status).toBe(400);
        });

        it("avaliação duplicada retorna 409", async () => {
            // player3 avalia player2 pela primeira vez
            await request(app)
                .post(`${BASE(court.id, finishedEvent.id)}/reviews`)
                .set("Authorization", player3Token)
                .send({ reviewedId: player2.id, stars: 4, tag: "BOA_COMUNICACAO" });

            // tenta avaliar de novo
            const res = await request(app)
                .post(`${BASE(court.id, finishedEvent.id)}/reviews`)
                .set("Authorization", player3Token)
                .send({ reviewedId: player2.id, stars: 3, tag: "JOGA_FACIL" });

            expect(res.status).toBe(409);
        });

        it("sem autenticação retorna 401", async () => {
            const res = await request(app)
                .post(`${BASE(court.id, finishedEvent.id)}/reviews`)
                .send({ reviewedId: player2.id, stars: 3, tag: "JOGA_FACIL" });

            expect(res.status).toBe(401);
        });

        it("stars inválido retorna 422", async () => {
            const res = await request(app)
                .post(`${BASE(court.id, finishedEvent.id)}/reviews`)
                .set("Authorization", player1Token)
                .send({ reviewedId: player2.id, stars: 6, tag: "PONTUAL" });

            expect(res.status).toBe(422);
        });

        it("tag inválida retorna 422", async () => {
            const res = await request(app)
                .post(`${BASE(court.id, finishedEvent.id)}/reviews`)
                .set("Authorization", player1Token)
                .send({ reviewedId: player2.id, stars: 3, tag: "TAG_INVALIDA" });

            expect(res.status).toBe(422);
        });

        it("pelada inexistente retorna 404", async () => {
            const res = await request(app)
                .post(`${BASE(court.id, "pelada-nao-existe")}/reviews`)
                .set("Authorization", player1Token)
                .send({ reviewedId: player2.id, stars: 3, tag: "PONTUAL" });

            expect(res.status).toBe(404);
        });
    });

    // ─── GET /reviews/progress ───────────────────────────────────────────────

    describe("GET reviews/progress", () => {
        it("retorna progresso do participante (200)", async () => {
            const res = await request(app)
                .get(`${BASE(court.id, finishedEvent.id)}/reviews/progress`)
                .set("Authorization", player1Token);

            expect(res.status).toBe(200);
            // player1 avaliou player2 (nos testes de POST acima)
            expect(res.body.data.total).toBe(2); // player2 e player3
            expect(typeof res.body.data.reviewed).toBe("number");
            expect(typeof res.body.data.pending).toBe("number");
            expect(typeof res.body.data.completed).toBe("boolean");
        });

        it("progresso reflete avaliações feitas", async () => {
            // player2 avaliou player1 (nos testes de POST)
            const res = await request(app)
                .get(`${BASE(court.id, finishedEvent.id)}/reviews/progress`)
                .set("Authorization", player2Token);

            expect(res.status).toBe(200);
            expect(res.body.data.reviewed).toBeGreaterThanOrEqual(1);
        });

        it("quem não participou retorna 403", async () => {
            const res = await request(app)
                .get(`${BASE(court.id, finishedEvent.id)}/reviews/progress`)
                .set("Authorization", outsiderToken);

            expect(res.status).toBe(403);
        });

        it("pelada inexistente retorna 404", async () => {
            const res = await request(app)
                .get(`${BASE(court.id, "nao-existe")}/reviews/progress`)
                .set("Authorization", player1Token);

            expect(res.status).toBe(404);
        });

        it("sem autenticação retorna 401", async () => {
            const res = await request(app).get(`${BASE(court.id, finishedEvent.id)}/reviews/progress`);
            expect(res.status).toBe(401);
        });
    });

    // ─── GET /reviews (por pelada — admin) ───────────────────────────────────

    describe("GET reviews (por pelada)", () => {
        it("admin lista avaliações da pelada (200)", async () => {
            const res = await request(app)
                .get(`${BASE(court.id, finishedEvent.id)}/reviews`)
                .set("Authorization", adminToken);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
            expect(res.body.data[0]).toHaveProperty("reviewer");
            expect(res.body.data[0]).toHaveProperty("reviewed");
        });

        it("player não admin retorna 403", async () => {
            const res = await request(app)
                .get(`${BASE(court.id, finishedEvent.id)}/reviews`)
                .set("Authorization", player1Token);

            expect(res.status).toBe(403);
        });

        it("sem autenticação retorna 401", async () => {
            const res = await request(app).get(`${BASE(court.id, finishedEvent.id)}/reviews`);
            expect(res.status).toBe(401);
        });

        it("pelada inexistente retorna 404", async () => {
            const res = await request(app)
                .get(`${BASE(court.id, "nao-existe")}/reviews`)
                .set("Authorization", adminToken);

            expect(res.status).toBe(404);
        });
    });

    // ─── GET /users/:userId/reviews ──────────────────────────────────────────

    describe("GET /users/:userId/reviews", () => {
        it("retorna avaliações recebidas com summary (público)", async () => {
            const res = await request(app).get(`/users/${player2.id}/reviews`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty("summary");
            expect(res.body.data).toHaveProperty("reviews");
            expect(res.body.data.summary).toHaveProperty("averageStars");
            expect(res.body.data.summary).toHaveProperty("totalReviews");
            expect(res.body.data.summary).toHaveProperty("tags");
            expect(res.body.data.summary.totalReviews).toBeGreaterThan(0);
            expect(Array.isArray(res.body.data.reviews)).toBe(true);
        });

        it("retorna summary zerado para usuário sem avaliações", async () => {
            const res = await request(app).get(`/users/${outsider.id}/reviews`);

            expect(res.status).toBe(200);
            expect(res.body.data.summary.averageStars).toBeNull();
            expect(res.body.data.summary.totalReviews).toBe(0);
            expect(res.body.data.reviews).toHaveLength(0);
        });

        it("retorna pelada e quadra nas avaliações", async () => {
            const res = await request(app).get(`/users/${player2.id}/reviews`);

            expect(res.status).toBe(200);
            expect(res.body.data.reviews[0]).toHaveProperty("pelada");
            expect(res.body.data.reviews[0].pelada).toHaveProperty("court");
        });
    });
});
