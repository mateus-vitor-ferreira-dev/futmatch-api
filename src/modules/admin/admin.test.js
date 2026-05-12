import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { truncateAll } from "../../tests/setupTests.js";
import { createUser, tokenFor } from "../../tests/helpers/factories.js";

describe("Admin", () => {
    let admin, player;
    let adminToken, playerToken;

    beforeAll(async () => {
        await truncateAll();
        [admin, player] = await Promise.all([
            createUser({ role: "ADMIN", email: "admin-admin@test.com" }),
            createUser({ role: "PLAYER", email: "player-admin@test.com" }),
        ]);
        adminToken = tokenFor(admin);
        playerToken = tokenFor(player);
    });

    describe("GET /admin/users", () => {
        it("admin lista todos os usuários", async () => {
            const res = await request(app).get("/admin/users").set("Authorization", adminToken);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it("filtra usuários por role", async () => {
            const res = await request(app).get("/admin/users?role=PLAYER").set("Authorization", adminToken);

            expect(res.status).toBe(200);
            expect(res.body.data.every((u) => u.role === "PLAYER")).toBe(true);
        });

        it("player não acessa rota de admin (403)", async () => {
            const res = await request(app).get("/admin/users").set("Authorization", playerToken);

            expect(res.status).toBe(403);
        });

        it("retorna 401 sem autenticação", async () => {
            const res = await request(app).get("/admin/users");
            expect(res.status).toBe(401);
        });
    });

    describe("PATCH /admin/users/:id/role", () => {
        it("admin promove player para owner", async () => {
            const target = await createUser({ role: "PLAYER", email: "target-role@test.com" });

            const res = await request(app)
                .patch(`/admin/users/${target.id}/role`)
                .set("Authorization", adminToken)
                .send({ role: "OWNER" });

            expect(res.status).toBe(200);
            expect(res.body.data.role).toBe("OWNER");
        });

        it("retorna 422 com role inválido", async () => {
            const target = await createUser({ role: "PLAYER", email: "target-invalid@test.com" });

            const res = await request(app)
                .patch(`/admin/users/${target.id}/role`)
                .set("Authorization", adminToken)
                .send({ role: "SUPERUSER" });

            expect(res.status).toBe(422);
        });

        it("player não consegue mudar role (403)", async () => {
            const target = await createUser({ role: "PLAYER", email: "target-forbidden@test.com" });

            const res = await request(app)
                .patch(`/admin/users/${target.id}/role`)
                .set("Authorization", playerToken)
                .send({ role: "OWNER" });

            expect(res.status).toBe(403);
        });
    });
});
