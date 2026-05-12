import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { createUser, createPlace, createCourt, tokenFor } from "../../tests/helpers/factories.js";

describe("Courts", () => {
    let admin, owner, player;
    let adminToken, ownerToken, playerToken;
    let place;

    beforeAll(async () => {
        [admin, owner, player] = await Promise.all([
            createUser({ role: "ADMIN", email: "admin-courts@test.com" }),
            createUser({ role: "OWNER", email: "owner-courts@test.com" }),
            createUser({ role: "PLAYER", email: "player-courts@test.com" }),
        ]);
        adminToken = tokenFor(admin);
        ownerToken = tokenFor(owner);
        playerToken = tokenFor(player);
        place = await createPlace({ ownerId: owner.id });
    });

    describe("GET /places/:placeId/courts", () => {
        it("lista quadras de um lugar sem autenticação", async () => {
            await createCourt({ placeId: place.id });

            const res = await request(app).get(`/places/${place.id}/courts`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it("filtra por tipo de quadra", async () => {
            const res = await request(app).get(`/places/${place.id}/courts?type=FUTSAL`);
            expect(res.status).toBe(200);
        });
    });

    describe("GET /places/:placeId/courts/:courtId", () => {
        it("retorna quadra por id", async () => {
            const court = await createCourt({ placeId: place.id });
            const res = await request(app).get(`/places/${place.id}/courts/${court.id}`);
            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(court.id);
        });

        it("retorna 404 para id inexistente", async () => {
            const res = await request(app).get(`/places/${place.id}/courts/id-invalido`);
            expect(res.status).toBe(404);
        });
    });

    describe("POST /places/:placeId/courts", () => {
        const courtPayload = { name: "Quadra 1", type: "FUTSAL", pricePerHour: 100 };

        it("owner cria quadra em seu lugar", async () => {
            const res = await request(app)
                .post(`/places/${place.id}/courts`)
                .set("Authorization", ownerToken)
                .send(courtPayload);

            expect(res.status).toBe(201);
            expect(res.body.data.name).toBe("Quadra 1");
        });

        it("admin cria quadra em qualquer lugar", async () => {
            const res = await request(app)
                .post(`/places/${place.id}/courts`)
                .set("Authorization", adminToken)
                .send({ name: "Quadra Admin", type: "SOCIETY" });

            expect(res.status).toBe(201);
        });

        it("player não consegue criar quadra (403)", async () => {
            const res = await request(app)
                .post(`/places/${place.id}/courts`)
                .set("Authorization", playerToken)
                .send(courtPayload);

            expect(res.status).toBe(403);
        });

        it("retorna 422 com tipo inválido", async () => {
            const res = await request(app)
                .post(`/places/${place.id}/courts`)
                .set("Authorization", ownerToken)
                .send({ name: "Quadra", type: "INVALIDO" });

            expect(res.status).toBe(422);
        });
    });

    describe("PATCH /places/:placeId/courts/:courtId", () => {
        let court;

        beforeAll(async () => {
            court = await createCourt({ placeId: place.id });
        });

        it("owner atualiza quadra", async () => {
            const res = await request(app)
                .patch(`/places/${place.id}/courts/${court.id}`)
                .set("Authorization", ownerToken)
                .send({ name: "Quadra Atualizada" });

            expect(res.status).toBe(200);
            expect(res.body.data.name).toBe("Quadra Atualizada");
        });

        it("player não atualiza quadra (403)", async () => {
            const res = await request(app)
                .patch(`/places/${place.id}/courts/${court.id}`)
                .set("Authorization", playerToken)
                .send({ name: "Tentativa" });

            expect(res.status).toBe(403);
        });
    });

    describe("PATCH /places/:placeId/courts/:courtId/status", () => {
        it("owner muda status da quadra", async () => {
            const court = await createCourt({ placeId: place.id });

            const res = await request(app)
                .patch(`/places/${place.id}/courts/${court.id}/status`)
                .set("Authorization", ownerToken)
                .send({ status: "CLOSED" });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe("CLOSED");
        });
    });

    describe("DELETE /places/:placeId/courts/:courtId", () => {
        it("owner remove quadra", async () => {
            const court = await createCourt({ placeId: place.id });

            const res = await request(app)
                .delete(`/places/${place.id}/courts/${court.id}`)
                .set("Authorization", ownerToken);

            expect(res.status).toBe(200);
        });

        it("player não remove quadra (403)", async () => {
            const court = await createCourt({ placeId: place.id });

            const res = await request(app)
                .delete(`/places/${place.id}/courts/${court.id}`)
                .set("Authorization", playerToken);

            expect(res.status).toBe(403);
        });
    });

    describe("GET /courts (busca global)", () => {
        it("retorna lista de quadras sem filtros", async () => {
            const res = await request(app).get("/courts");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it("filtra por cidade", async () => {
            const res = await request(app).get("/courts?city=São Paulo");
            expect(res.status).toBe(200);
        });

        it("filtra por tipo", async () => {
            const res = await request(app).get("/courts?type=FUTSAL");
            expect(res.status).toBe(200);
        });
    });
});
