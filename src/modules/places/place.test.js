import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { truncateAll } from "../../tests/setupTests.js";
import { createUser, createPlace, tokenFor } from "../../tests/helpers/factories.js";

const placePayload = {
    name: "Arena FutMatch",
    street: "Rua das Flores",
    number: "100",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    zipCode: "01310-100",
};

describe("Places", () => {
    let admin, owner, player;
    let adminToken, ownerToken, playerToken;

    beforeAll(async () => {
        await truncateAll();
        [admin, owner, player] = await Promise.all([
            createUser({ role: "ADMIN", email: "admin-places@test.com" }),
            createUser({ role: "OWNER", email: "owner-places@test.com" }),
            createUser({ role: "PLAYER", email: "player-places@test.com" }),
        ]);
        adminToken = tokenFor(admin);
        ownerToken = tokenFor(owner);
        playerToken = tokenFor(player);
    });

    describe("GET /places", () => {
        it("lista lugares sem autenticação", async () => {
            const res = await request(app).get("/places");
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe("GET /places/:id", () => {
        it("retorna lugar existente", async () => {
            const place = await createPlace({ ownerId: owner.id });
            const res = await request(app).get(`/places/${place.id}`);
            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(place.id);
        });

        it("retorna 404 para id inexistente", async () => {
            const res = await request(app).get("/places/id-que-nao-existe");
            expect(res.status).toBe(404);
        });
    });

    describe("POST /places", () => {
        it("admin cria lugar com sucesso", async () => {
            const res = await request(app)
                .post("/places")
                .set("Authorization", adminToken)
                .send(placePayload);

            expect(res.status).toBe(201);
            expect(res.body.data.name).toBe(placePayload.name);
        });

        it("player não consegue criar lugar (403)", async () => {
            const res = await request(app)
                .post("/places")
                .set("Authorization", playerToken)
                .send(placePayload);
            expect(res.status).toBe(403);
        });

        it("owner não consegue criar lugar (403)", async () => {
            const res = await request(app)
                .post("/places")
                .set("Authorization", ownerToken)
                .send(placePayload);
            expect(res.status).toBe(403);
        });

        it("retorna 401 sem autenticação", async () => {
            const res = await request(app).post("/places").send(placePayload);
            expect(res.status).toBe(401);
        });
    });

    describe("PATCH /places/:id", () => {
        let place;

        beforeAll(async () => {
            place = await createPlace({ ownerId: owner.id });
        });

        it("owner atualiza seu lugar", async () => {
            const res = await request(app)
                .patch(`/places/${place.id}`)
                .set("Authorization", ownerToken)
                .send({ name: "Arena Atualizada" });

            expect(res.status).toBe(200);
            expect(res.body.data.name).toBe("Arena Atualizada");
        });

        it("admin atualiza qualquer lugar", async () => {
            const res = await request(app)
                .patch(`/places/${place.id}`)
                .set("Authorization", adminToken)
                .send({ city: "Campinas" });

            expect(res.status).toBe(200);
        });

        it("player não consegue atualizar (403)", async () => {
            const res = await request(app)
                .patch(`/places/${place.id}`)
                .set("Authorization", playerToken)
                .send({ name: "Tentativa" });

            expect(res.status).toBe(403);
        });
    });

    describe("PATCH /places/:id/status", () => {
        let place;

        beforeAll(async () => {
            place = await createPlace({ ownerId: owner.id });
        });

        it("owner altera status do lugar", async () => {
            const res = await request(app)
                .patch(`/places/${place.id}/status`)
                .set("Authorization", ownerToken)
                .send({ status: "CLOSED" });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe("CLOSED");
        });
    });

    describe("PATCH /places/:id/owner", () => {
        let place;
        let newOwner;

        beforeAll(async () => {
            [place, newOwner] = await Promise.all([
                createPlace(),
                createUser({ role: "OWNER", email: "new-owner@test.com" }),
            ]);
        });

        it("admin atribui owner ao lugar", async () => {
            const res = await request(app)
                .patch(`/places/${place.id}/owner`)
                .set("Authorization", adminToken)
                .send({ ownerId: newOwner.id });

            expect(res.status).toBe(200);
            expect(res.body.data.ownerId).toBe(newOwner.id);
        });

        it("player não consegue atribuir owner (403)", async () => {
            const res = await request(app)
                .patch(`/places/${place.id}/owner`)
                .set("Authorization", playerToken)
                .send({ ownerId: newOwner.id });

            expect(res.status).toBe(403);
        });
    });
});
