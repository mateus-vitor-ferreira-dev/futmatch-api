import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../app.js";
import {
    createUser,
    createPlace,
    createCourt,
    createEvent,
    tokenFor,
    futureDate,
} from "../../tests/helpers/factories.js";

describe("Events (Peladas)", () => {
    let admin, organizer, player;
    let adminToken, organizerToken, playerToken;
    let place, court;

    beforeAll(async () => {
        [admin, organizer, player] = await Promise.all([
            createUser({ role: "ADMIN", email: "admin-events@test.com" }),
            createUser({ role: "PLAYER", email: "organizer-events@test.com" }),
            createUser({ role: "PLAYER", email: "player-events@test.com" }),
        ]);
        adminToken = tokenFor(admin);
        organizerToken = tokenFor(organizer);
        playerToken = tokenFor(player);

        const owner = await createUser({ role: "OWNER", email: "owner-events@test.com" });
        place = await createPlace({ ownerId: owner.id });
        court = await createCourt({ placeId: place.id });
    });

    const eventPayload = () => ({
        date: futureDate(10).toISOString(),
        maxPlayers: 10,
        totalValue: 200,
        pixKey: "organizador@pix.com",
    });

    describe("GET /courts/:courtId/events", () => {
        it("lista peladas de uma quadra sem autenticação", async () => {
            await createEvent({ courtId: court.id, organizerId: organizer.id });

            const res = await request(app).get(`/courts/${court.id}/events`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it("filtra por status", async () => {
            const res = await request(app).get(`/courts/${court.id}/events?status=WAITING`);
            expect(res.status).toBe(200);
        });
    });

    describe("GET /courts/:courtId/events/:eventId", () => {
        it("retorna pelada por id", async () => {
            const event = await createEvent({ courtId: court.id, organizerId: organizer.id });
            const res = await request(app).get(`/courts/${court.id}/events/${event.id}`);
            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(event.id);
        });

        it("retorna 404 para id inexistente", async () => {
            const res = await request(app).get(`/courts/${court.id}/events/id-invalido`);
            expect(res.status).toBe(404);
        });
    });

    describe("POST /courts/:courtId/events", () => {
        it("usuário autenticado cria pelada", async () => {
            const res = await request(app)
                .post(`/courts/${court.id}/events`)
                .set("Authorization", playerToken)
                .send(eventPayload());

            expect(res.status).toBe(201);
            expect(res.body.data.status).toBe("WAITING");
        });

        it("retorna 401 sem autenticação", async () => {
            const res = await request(app)
                .post(`/courts/${court.id}/events`)
                .send(eventPayload());

            expect(res.status).toBe(401);
        });

        it("retorna 409 se conflito de horário na mesma quadra", async () => {
            const conflictDate = futureDate(20);
            await createEvent({ courtId: court.id, organizerId: organizer.id, date: conflictDate });

            const res = await request(app)
                .post(`/courts/${court.id}/events`)
                .set("Authorization", organizerToken)
                .send({ ...eventPayload(), date: conflictDate.toISOString() });

            expect(res.status).toBe(409);
        });

        it("retorna 422 com data no passado", async () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);

            const res = await request(app)
                .post(`/courts/${court.id}/events`)
                .set("Authorization", organizerToken)
                .send({ ...eventPayload(), date: pastDate.toISOString() });

            expect(res.status).toBe(422);
        });
    });

    describe("PATCH /courts/:courtId/events/:eventId", () => {
        it("organizador atualiza a própria pelada", async () => {
            const event = await createEvent({ courtId: court.id, organizerId: organizer.id });

            const res = await request(app)
                .patch(`/courts/${court.id}/events/${event.id}`)
                .set("Authorization", organizerToken)
                .send({ maxPlayers: 14 });

            expect(res.status).toBe(200);
            expect(res.body.data.maxPlayers).toBe(14);
        });

        it("player não organizador não atualiza (403)", async () => {
            const event = await createEvent({ courtId: court.id, organizerId: organizer.id });

            const res = await request(app)
                .patch(`/courts/${court.id}/events/${event.id}`)
                .set("Authorization", playerToken)
                .send({ maxPlayers: 14 });

            expect(res.status).toBe(403);
        });

        it("admin atualiza qualquer pelada", async () => {
            const event = await createEvent({ courtId: court.id, organizerId: organizer.id });

            const res = await request(app)
                .patch(`/courts/${court.id}/events/${event.id}`)
                .set("Authorization", adminToken)
                .send({ maxPlayers: 16 });

            expect(res.status).toBe(200);
        });
    });

    describe("PATCH /courts/:courtId/events/:eventId/status", () => {
        it("organizador finaliza pelada", async () => {
            const event = await createEvent({ courtId: court.id, organizerId: organizer.id });

            const res = await request(app)
                .patch(`/courts/${court.id}/events/${event.id}/status`)
                .set("Authorization", organizerToken)
                .send({ status: "FINISHED" });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe("FINISHED");
        });

        it("organizador cancela pelada", async () => {
            const event = await createEvent({ courtId: court.id, organizerId: organizer.id });

            const res = await request(app)
                .patch(`/courts/${court.id}/events/${event.id}/status`)
                .set("Authorization", organizerToken)
                .send({ status: "CANCELLED" });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe("CANCELLED");
        });

        it("retorna 422 com status inválido", async () => {
            const event = await createEvent({ courtId: court.id, organizerId: organizer.id });

            const res = await request(app)
                .patch(`/courts/${court.id}/events/${event.id}/status`)
                .set("Authorization", organizerToken)
                .send({ status: "WAITING" });

            expect(res.status).toBe(422);
        });
    });

    describe("DELETE /courts/:courtId/events/:eventId", () => {
        it("organizador remove a própria pelada", async () => {
            const event = await createEvent({ courtId: court.id, organizerId: organizer.id });

            const res = await request(app)
                .delete(`/courts/${court.id}/events/${event.id}`)
                .set("Authorization", organizerToken);

            expect(res.status).toBe(200);
        });

        it("player não organizador não remove (403)", async () => {
            const event = await createEvent({ courtId: court.id, organizerId: organizer.id });

            const res = await request(app)
                .delete(`/courts/${court.id}/events/${event.id}`)
                .set("Authorization", playerToken);

            expect(res.status).toBe(403);
        });
    });

    describe("GET /events (busca global)", () => {
        it("retorna lista de peladas", async () => {
            const res = await request(app).get("/events");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it("filtra por cidade", async () => {
            const res = await request(app).get("/events?city=São Paulo");
            expect(res.status).toBe(200);
        });
    });

    describe("GET /events/my/created", () => {
        it("retorna peladas criadas pelo usuário autenticado", async () => {
            await createEvent({ courtId: court.id, organizerId: organizer.id });

            const res = await request(app)
                .get("/events/my/created")
                .set("Authorization", organizerToken);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it("retorna 401 sem autenticação", async () => {
            const res = await request(app).get("/events/my/created");
            expect(res.status).toBe(401);
        });
    });

    describe("GET /events/my/participating", () => {
        it("retorna peladas que o usuário participa", async () => {
            const res = await request(app)
                .get("/events/my/participating")
                .set("Authorization", playerToken);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
});
