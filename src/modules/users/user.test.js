import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { truncateAll } from "../../tests/setupTests.js";
import { createUser, createPlace, createCourt, createEvent, tokenFor } from "../../tests/helpers/factories.js";
import prisma from "../../config/prisma.js";

describe("User Profile", () => {
    let player, player2, admin;
    let playerToken, adminToken;

    beforeAll(async () => {
        await truncateAll();

        [player, player2, admin] = await Promise.all([
            createUser({ role: "PLAYER", email: "player-profile@test.com", name: "Player Um" }),
            createUser({ role: "PLAYER", email: "player2-profile@test.com", name: "Player Dois" }),
            createUser({ role: "ADMIN", email: "admin-profile@test.com" }),
        ]);

        playerToken = tokenFor(player);
        adminToken = tokenFor(admin);
    });

    // ─── GET /users/me ───────────────────────────────────────────────────────

    describe("GET /users/me", () => {
        it("retorna perfil completo do usuário autenticado (200)", async () => {
            const res = await request(app).get("/users/me").set("Authorization", playerToken);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(player.id);
            expect(res.body.data.name).toBe("Player Um");
            expect(res.body.data).toHaveProperty("email");
            expect(res.body.data).toHaveProperty("pixKey");
            expect(res.body.data).toHaveProperty("stats");
            expect(res.body.data.stats).toHaveProperty("averageStars");
            expect(res.body.data.stats).toHaveProperty("totalPeladas");
            expect(res.body.data.stats).toHaveProperty("tags");
        });

        it("não expõe password no retorno", async () => {
            const res = await request(app).get("/users/me").set("Authorization", playerToken);
            expect(res.body.data).not.toHaveProperty("password");
        });

        it("sem autenticação retorna 401", async () => {
            const res = await request(app).get("/users/me");
            expect(res.status).toBe(401);
        });
    });

    // ─── PATCH /users/me ─────────────────────────────────────────────────────

    describe("PATCH /users/me", () => {
        it("atualiza nome (200)", async () => {
            const res = await request(app)
                .patch("/users/me")
                .set("Authorization", playerToken)
                .send({ name: "Nome Atualizado" });

            expect(res.status).toBe(200);
            expect(res.body.data.name).toBe("Nome Atualizado");
        });

        it("atualiza avatarUrl (200)", async () => {
            const res = await request(app)
                .patch("/users/me")
                .set("Authorization", playerToken)
                .send({ avatarUrl: "https://example.com/avatar.jpg" });

            expect(res.status).toBe(200);
            expect(res.body.data.avatarUrl).toBe("https://example.com/avatar.jpg");
        });

        it("atualiza pixKey (200)", async () => {
            const res = await request(app)
                .patch("/users/me")
                .set("Authorization", playerToken)
                .send({ pixKey: "player@pix.com" });

            expect(res.status).toBe(200);
            expect(res.body.data.pixKey).toBe("player@pix.com");
        });

        it("atualiza senha com currentPassword correta (200)", async () => {
            const res = await request(app)
                .patch("/users/me")
                .set("Authorization", playerToken)
                .send({ currentPassword: "senha123", newPassword: "novaSenha456", confirmNewPassword: "novaSenha456" });

            expect(res.status).toBe(200);
        });

        it("senha atual incorreta retorna 401", async () => {
            const res = await request(app)
                .patch("/users/me")
                .set("Authorization", playerToken)
                .send({ currentPassword: "errada", newPassword: "nova123", confirmNewPassword: "nova123" });

            expect(res.status).toBe(401);
        });

        it("newPassword sem currentPassword retorna 422", async () => {
            const res = await request(app)
                .patch("/users/me")
                .set("Authorization", playerToken)
                .send({ newPassword: "nova123", confirmNewPassword: "nova123" });

            expect(res.status).toBe(422);
        });

        it("confirmNewPassword diferente retorna 422", async () => {
            const res = await request(app)
                .patch("/users/me")
                .set("Authorization", playerToken)
                .send({ currentPassword: "novaSenha456", newPassword: "abc123", confirmNewPassword: "diferente" });

            expect(res.status).toBe(422);
        });

        it("avatarUrl inválida retorna 422", async () => {
            const res = await request(app)
                .patch("/users/me")
                .set("Authorization", playerToken)
                .send({ avatarUrl: "nao-e-uma-url" });

            expect(res.status).toBe(422);
        });

        it("não expõe password no retorno", async () => {
            const res = await request(app)
                .patch("/users/me")
                .set("Authorization", playerToken)
                .send({ name: "Teste Seguro" });

            expect(res.body.data).not.toHaveProperty("password");
        });

        it("sem autenticação retorna 401", async () => {
            const res = await request(app).patch("/users/me").send({ name: "Anon" });
            expect(res.status).toBe(401);
        });

        it("conta Google sem senha retorna 400 ao tentar alterar senha", async () => {
            const googleUser = await prisma.user.create({
                data: { name: "Google User", email: "google-profile@test.com", password: null, role: "PLAYER" },
            });
            const googleToken = tokenFor(googleUser);

            const res = await request(app)
                .patch("/users/me")
                .set("Authorization", googleToken)
                .send({ currentPassword: "qualquer", newPassword: "nova123", confirmNewPassword: "nova123" });

            expect(res.status).toBe(400);
        });
    });

    // ─── GET /users/:userId ──────────────────────────────────────────────────

    describe("GET /users/:userId", () => {
        it("retorna perfil público com stats (200)", async () => {
            const res = await request(app).get(`/users/${player.id}`);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(player.id);
            expect(res.body.data).toHaveProperty("name");
            expect(res.body.data).toHaveProperty("badge");
            expect(res.body.data).toHaveProperty("role");
            expect(res.body.data).toHaveProperty("stats");
            expect(res.body.data.stats).toHaveProperty("averageStars");
            expect(res.body.data.stats).toHaveProperty("totalPeladas");
            expect(res.body.data.stats).toHaveProperty("totalReviews");
            expect(res.body.data.stats).toHaveProperty("tags");
        });

        it("não expõe email nem pixKey no perfil público", async () => {
            const res = await request(app).get(`/users/${player.id}`);
            expect(res.body.data).not.toHaveProperty("email");
            expect(res.body.data).not.toHaveProperty("pixKey");
            expect(res.body.data).not.toHaveProperty("password");
        });

        it("retorna 404 para usuário inexistente", async () => {
            const res = await request(app).get("/users/nao-existe");
            expect(res.status).toBe(404);
        });

        it("é público — não exige autenticação", async () => {
            const res = await request(app).get(`/users/${player2.id}`);
            expect(res.status).toBe(200);
        });
    });

    // ─── Badge automático ────────────────────────────────────────────────────

    describe("Badge automático", () => {
        let badgePlayer, badgePlace, badgeCourt, badgeEvent;

        beforeAll(async () => {
            badgePlayer = await createUser({ role: "PLAYER", email: "badge-player@test.com" });
            const reviewerA = await createUser({ role: "PLAYER", email: "badge-reviewer-a@test.com" });
            const reviewerB = await createUser({ role: "PLAYER", email: "badge-reviewer-b@test.com" });

            badgePlace = await createPlace({ ownerId: admin.id });
            badgeCourt = await createCourt({ placeId: badgePlace.id });
            badgeEvent = await createEvent({
                courtId: badgeCourt.id,
                organizerId: admin.id,
                status: "FINISHED",
            });

            // todos participam
            await Promise.all([
                prisma.participation.create({ data: { peladaId: badgeEvent.id, userId: badgePlayer.id } }),
                prisma.participation.create({ data: { peladaId: badgeEvent.id, userId: reviewerA.id } }),
                prisma.participation.create({ data: { peladaId: badgeEvent.id, userId: reviewerB.id } }),
            ]);

            // badgePlayer recebe duas avaliações 5 estrelas → deve ganhar badge CRAQUE
            await Promise.all([
                prisma.review.create({
                    data: {
                        peladaId: badgeEvent.id,
                        reviewerId: reviewerA.id,
                        reviewedId: badgePlayer.id,
                        stars: 5,
                        tag: "CRAQUE_DA_PELADA",
                    },
                }),
                prisma.review.create({
                    data: {
                        peladaId: badgeEvent.id,
                        reviewerId: reviewerB.id,
                        reviewedId: badgePlayer.id,
                        stars: 5,
                        tag: "FAIR_PLAY",
                    },
                }),
            ]);
        });

        it("badge CRAQUE é atribuído via POST /reviews quando média ≥ 4.5", async () => {
            const reviewerC = await createUser({ role: "PLAYER", email: "badge-reviewer-c@test.com" });
            await prisma.participation.create({ data: { peladaId: badgeEvent.id, userId: reviewerC.id } });

            const reviewerCToken = tokenFor(reviewerC);

            await request(app)
                .post(`/courts/${badgeCourt.id}/events/${badgeEvent.id}/reviews`)
                .set("Authorization", reviewerCToken)
                .send({ reviewedId: badgePlayer.id, stars: 5, tag: "CRAQUE_DA_PELADA" });

            // aguarda badge ser calculado (é fire-and-forget mas é rápido em testes)
            await new Promise((r) => setTimeout(r, 300));

            const res = await request(app).get(`/users/${badgePlayer.id}`);
            expect(res.body.data.badge).toBe("CRAQUE");
        });

        it("badge ORGANIZADOR_NATO é atribuído quando ≥ 5 peladas criadas", async () => {
            const orgPlayer = await createUser({ role: "PLAYER", email: "org-nato@test.com" });
            const orgToken = tokenFor(orgPlayer);
            const orgPlace = await createPlace({ ownerId: admin.id });
            const orgCourt = await createCourt({ placeId: orgPlace.id });

            // cria 5 peladas finalizadas
            const events = await Promise.all(
                Array.from({ length: 5 }, () =>
                    createEvent({ courtId: orgCourt.id, organizerId: orgPlayer.id, status: "FINISHED" }),
                ),
            );

            // confirma presença do orgPlayer em uma delas para triggerar o badge
            await prisma.participation.create({ data: { peladaId: events[0].id, userId: orgPlayer.id } });

            await request(app)
                .patch(`/courts/${orgCourt.id}/events/${events[0].id}/participations/${orgPlayer.id}/attendance`)
                .set("Authorization", adminToken)
                .send({ attended: true });

            await new Promise((r) => setTimeout(r, 300));

            const res = await request(app).get(`/users/${orgPlayer.id}`).set("Authorization", orgToken);
            expect(res.body.data.badge).toBe("ORGANIZADOR_NATO");
        });
    });
});
