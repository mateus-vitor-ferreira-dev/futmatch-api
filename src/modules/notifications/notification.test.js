import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { truncateAll } from "../../tests/setupTests.js";
import { createUser, createPlace, createCourt, createEvent, tokenFor } from "../../tests/helpers/factories.js";
import prisma from "../../config/prisma.js";

describe("Notifications", () => {
    let player, organizer, place, court, event;
    let playerToken, organizerToken;

    beforeAll(async () => {
        await truncateAll();

        [player, organizer] = await Promise.all([
            createUser({ email: "notif-player@test.com", name: "Notif Player" }),
            createUser({ email: "notif-organizer@test.com", name: "Notif Organizer" }),
        ]);

        playerToken = tokenFor(player);
        organizerToken = tokenFor(organizer);

        place = await createPlace({ ownerId: organizer.id });
        court = await createCourt({ placeId: place.id });
        event = await createEvent({ courtId: court.id, organizerId: organizer.id });
    });

    // ─── GET /notifications ──────────────────────────────────────────────────

    describe("GET /notifications", () => {
        it("retorna lista vazia inicialmente (200)", async () => {
            const res = await request(app).get("/notifications").set("Authorization", playerToken);
            expect(res.status).toBe(200);
            expect(res.body.data.notifications).toEqual([]);
            expect(res.body.data.unreadCount).toBe(0);
        });

        it("sem autenticação retorna 401", async () => {
            const res = await request(app).get("/notifications");
            expect(res.status).toBe(401);
        });

        it("retorna notificações criadas no banco e unreadCount correto", async () => {
            await prisma.notification.createMany({
                data: [
                    { userId: player.id, type: "PLAYER_JOINED", title: "Título A", body: "Body A" },
                    { userId: player.id, type: "PELADA_CANCELLED", title: "Título B", body: "Body B" },
                ],
            });

            const res = await request(app).get("/notifications").set("Authorization", playerToken);
            expect(res.status).toBe(200);
            expect(res.body.data.notifications).toHaveLength(2);
            expect(res.body.data.unreadCount).toBe(2);
        });

        it("?unread=true retorna apenas não lidas", async () => {
            // marca uma como lida direto no banco
            const [first] = await prisma.notification.findMany({
                where: { userId: player.id },
                take: 1,
            });
            await prisma.notification.update({ where: { id: first.id }, data: { read: true } });

            const res = await request(app).get("/notifications?unread=true").set("Authorization", playerToken);
            expect(res.status).toBe(200);
            expect(res.body.data.notifications.every((n) => !n.read)).toBe(true);
        });
    });

    // ─── PATCH /notifications/read-all ──────────────────────────────────────

    describe("PATCH /notifications/read-all", () => {
        it("marca todas como lidas e retorna 204", async () => {
            const res = await request(app).patch("/notifications/read-all").set("Authorization", playerToken);
            expect(res.status).toBe(204);

            const unread = await prisma.notification.count({ where: { userId: player.id, read: false } });
            expect(unread).toBe(0);
        });

        it("sem autenticação retorna 401", async () => {
            const res = await request(app).patch("/notifications/read-all");
            expect(res.status).toBe(401);
        });
    });

    // ─── PATCH /notifications/:id/read ──────────────────────────────────────

    describe("PATCH /notifications/:id/read", () => {
        it("marca uma notificação como lida e retorna 204", async () => {
            const notif = await prisma.notification.create({
                data: { userId: player.id, type: "PELADA_FINISHED", title: "Finalizada", body: "Pelada ok" },
            });

            const res = await request(app)
                .patch(`/notifications/${notif.id}/read`)
                .set("Authorization", playerToken);
            expect(res.status).toBe(204);

            const updated = await prisma.notification.findUnique({ where: { id: notif.id } });
            expect(updated.read).toBe(true);
        });

        it("id inexistente ou de outro usuário retorna 404", async () => {
            const outrosNotif = await prisma.notification.create({
                data: { userId: organizer.id, type: "PLAYER_JOINED", title: "X", body: "Y" },
            });

            const res = await request(app)
                .patch(`/notifications/${outrosNotif.id}/read`)
                .set("Authorization", playerToken);
            expect(res.status).toBe(404);
        });

        it("sem autenticação retorna 401", async () => {
            const res = await request(app).patch("/notifications/qualquer-id/read");
            expect(res.status).toBe(401);
        });
    });

    // ─── Disparos automáticos ────────────────────────────────────────────────

    describe("Disparo automático de notificações", () => {
        it("organizer recebe PLAYER_JOINED quando jogador entra na pelada", async () => {
            await prisma.notification.deleteMany({ where: { userId: organizer.id } });

            await request(app)
                .post(`/courts/${court.id}/events/${event.id}/participations`)
                .set("Authorization", playerToken);

            await new Promise((r) => setTimeout(r, 300));

            const notif = await prisma.notification.findFirst({
                where: { userId: organizer.id, type: "PLAYER_JOINED" },
            });
            expect(notif).not.toBeNull();
            expect(notif.data).toMatchObject({ peladaId: event.id });
        });

        it("organizer recebe PLAYER_LEFT quando jogador sai da pelada", async () => {
            await prisma.notification.deleteMany({ where: { userId: organizer.id } });

            await request(app)
                .delete(`/courts/${court.id}/events/${event.id}/participations`)
                .set("Authorization", playerToken);

            await new Promise((r) => setTimeout(r, 300));

            const notif = await prisma.notification.findFirst({
                where: { userId: organizer.id, type: "PLAYER_LEFT" },
            });
            expect(notif).not.toBeNull();
        });

        it("participantes recebem PELADA_CANCELLED quando pelada é cancelada", async () => {
            const admin = await createUser({ role: "ADMIN", email: "notif-admin@test.com" });
            const adminToken = tokenFor(admin);
            const newEvent = await createEvent({ courtId: court.id, organizerId: organizer.id });

            await prisma.participation.create({ data: { peladaId: newEvent.id, userId: player.id } });
            await prisma.notification.deleteMany({ where: { userId: player.id } });

            await request(app)
                .patch(`/courts/${court.id}/events/${newEvent.id}/status`)
                .set("Authorization", adminToken)
                .send({ status: "CANCELLED" });

            // pequena espera para o dispatch fire-and-forget completar
            await new Promise((r) => setTimeout(r, 300));

            const notif = await prisma.notification.findFirst({
                where: { userId: player.id, type: "PELADA_CANCELLED" },
            });
            expect(notif).not.toBeNull();
        });
    });

    // ─── GET /notifications/stream ───────────────────────────────────────────

    describe("GET /notifications/stream", () => {
        it("retorna headers SSE corretos e 200", async () => {
            const server = await new Promise((resolve) => {
                const s = app.listen(0, () => resolve(s));
            });
            const { port } = server.address();

            const controller = new AbortController();
            setTimeout(() => controller.abort(), 500);

            let status, contentType;
            try {
                const res = await fetch(`http://127.0.0.1:${port}/notifications/stream`, {
                    headers: { Authorization: playerToken },
                    signal: controller.signal,
                });
                status = res.status;
                contentType = res.headers.get("content-type");
            } catch (e) {
                if (e.name !== "AbortError") throw e;
            } finally {
                await new Promise((resolve) => server.close(resolve));
            }

            expect(status).toBe(200);
            expect(contentType).toContain("text/event-stream");
        });

        it("sem autenticação retorna 401", async () => {
            const res = await request(app).get("/notifications/stream");
            expect(res.status).toBe(401);
        });
    });
});
