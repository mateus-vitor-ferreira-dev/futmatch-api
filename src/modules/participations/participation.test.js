import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../app.js";
import prisma from "../../config/prisma.js";
import { truncateAll } from "../../tests/setupTests.js";
import { createUser, createPlace, createCourt, createEvent, tokenFor } from "../../tests/helpers/factories.js";

describe("Participations", () => {
    let organizer, player1, player2;
    let organizerToken, player1Token, player2Token;
    let court;

    beforeAll(async () => {
        await truncateAll();
        [organizer, player1, player2] = await Promise.all([
            createUser({ role: "PLAYER", email: "org-part@test.com" }),
            createUser({ role: "PLAYER", email: "p1-part@test.com" }),
            createUser({ role: "PLAYER", email: "p2-part@test.com" }),
        ]);
        organizerToken = tokenFor(organizer);
        player1Token = tokenFor(player1);
        player2Token = tokenFor(player2);

        const owner = await createUser({ role: "OWNER", email: "owner-part@test.com" });
        const place = await createPlace({ ownerId: owner.id });
        court = await createCourt({ placeId: place.id });
    });

    const url = (courtId, eventId) => `/courts/${courtId}/events/${eventId}/participations`;

    describe("GET participações", () => {
        it("lista participantes sem autenticação", async () => {
            const event = await createEvent({ courtId: court.id, organizerId: organizer.id });
            const res = await request(app).get(url(court.id, event.id));
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe("POST — entrar na pelada", () => {
        it("player entra em pelada WAITING", async () => {
            const event = await createEvent({ courtId: court.id, organizerId: organizer.id });

            const res = await request(app).post(url(court.id, event.id)).set("Authorization", player1Token);

            expect(res.status).toBe(201);
        });

        it("retorna 401 sem autenticação", async () => {
            const event = await createEvent({ courtId: court.id, organizerId: organizer.id });

            const res = await request(app).post(url(court.id, event.id));
            expect(res.status).toBe(401);
        });

        it("retorna 409 se já está inscrito", async () => {
            const event = await createEvent({ courtId: court.id, organizerId: organizer.id });
            await request(app).post(url(court.id, event.id)).set("Authorization", player1Token);

            const res = await request(app).post(url(court.id, event.id)).set("Authorization", player1Token);

            expect(res.status).toBe(409);
        });

        it("pelada muda para FULL quando bate maxPlayers", async () => {
            const event = await createEvent({
                courtId: court.id,
                organizerId: organizer.id,
                maxPlayers: 2,
            });

            await request(app).post(url(court.id, event.id)).set("Authorization", player1Token);
            await request(app).post(url(court.id, event.id)).set("Authorization", player2Token);

            const updated = await prisma.pelada.findUnique({ where: { id: event.id } });
            expect(updated.status).toBe("FULL");
        });

        it("não entra em pelada CANCELLED", async () => {
            const event = await createEvent({
                courtId: court.id,
                organizerId: organizer.id,
                status: "CANCELLED",
            });

            const res = await request(app).post(url(court.id, event.id)).set("Authorization", player1Token);

            expect(res.status).toBe(422);
        });
    });

    describe("DELETE — sair da pelada", () => {
        it("player sai da pelada e status volta a WAITING", async () => {
            const event = await createEvent({
                courtId: court.id,
                organizerId: organizer.id,
                maxPlayers: 1,
            });
            await request(app).post(url(court.id, event.id)).set("Authorization", player1Token);

            const eventFull = await prisma.pelada.findUnique({ where: { id: event.id } });
            expect(eventFull.status).toBe("FULL");

            const res = await request(app).delete(url(court.id, event.id)).set("Authorization", player1Token);

            expect(res.status).toBe(200);

            const eventAfter = await prisma.pelada.findUnique({ where: { id: event.id } });
            expect(eventAfter.status).toBe("WAITING");
        });

        it("retorna 401 sem autenticação", async () => {
            const event = await createEvent({ courtId: court.id, organizerId: organizer.id });
            const res = await request(app).delete(url(court.id, event.id));
            expect(res.status).toBe(401);
        });
    });

    describe("PATCH /:userId/attendance", () => {
        it("organizador confirma presença após FINISHED", async () => {
            const event = await createEvent({ courtId: court.id, organizerId: organizer.id });
            await request(app).post(url(court.id, event.id)).set("Authorization", player1Token);
            await prisma.pelada.update({ where: { id: event.id }, data: { status: "FINISHED" } });

            const res = await request(app)
                .patch(`${url(court.id, event.id)}/${player1.id}/attendance`)
                .set("Authorization", organizerToken)
                .send({ attended: true });

            expect(res.status).toBe(200);
            expect(res.body.data.attended).toBe(true);
        });

        it("player não organizador não confirma presença (403)", async () => {
            const event = await createEvent({ courtId: court.id, organizerId: organizer.id });
            await request(app).post(url(court.id, event.id)).set("Authorization", player1Token);

            const res = await request(app)
                .patch(`${url(court.id, event.id)}/${player1.id}/attendance`)
                .set("Authorization", player2Token)
                .send({ attended: true });

            expect(res.status).toBe(403);
        });
    });
});
