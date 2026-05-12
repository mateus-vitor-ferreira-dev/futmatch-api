import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { truncateAll } from "../../tests/setupTests.js";
import { createUser, tokenFor } from "../../tests/helpers/factories.js";

describe("Auth", () => {
    beforeAll(async () => {
        await truncateAll();
    });

    describe("POST /auth/register", () => {
        it("cria conta com dados válidos", async () => {
            const res = await request(app).post("/auth/register").send({
                name: "João Silva",
                email: "joao@test.com",
                password: "senha123",
                confirmPassword: "senha123",
            });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBeDefined();
            expect(res.body.data.user.email).toBe("joao@test.com");
            expect(res.body.data.user.password).toBeUndefined();
        });

        it("retorna 422 se campos obrigatórios ausentes", async () => {
            const res = await request(app).post("/auth/register").send({ email: "sem-nome@test.com" });
            expect(res.status).toBe(422);
        });

        it("retorna 422 se senhas não coincidem", async () => {
            const res = await request(app).post("/auth/register").send({
                name: "Teste",
                email: "teste@test.com",
                password: "senha123",
                confirmPassword: "senhadiferente",
            });
            expect(res.status).toBe(422);
        });

        it("retorna 409 se e-mail já cadastrado", async () => {
            await createUser({ email: "duplicado@test.com" });

            const res = await request(app).post("/auth/register").send({
                name: "Outro",
                email: "duplicado@test.com",
                password: "senha123",
                confirmPassword: "senha123",
            });
            expect(res.status).toBe(409);
            expect(res.body.code).toBe("EMAIL_IN_USE");
        });
    });

    describe("POST /auth/login", () => {
        beforeAll(async () => {
            await createUser({ email: "login@test.com" });
        });

        it("faz login com credenciais válidas", async () => {
            const res = await request(app).post("/auth/login").send({
                email: "login@test.com",
                password: "senha123",
            });

            expect(res.status).toBe(200);
            expect(res.body.data.token).toBeDefined();
            expect(res.body.data.user.password).toBeUndefined();
        });

        it("retorna 401 com senha incorreta", async () => {
            const res = await request(app).post("/auth/login").send({
                email: "login@test.com",
                password: "senhaerrada",
            });
            expect(res.status).toBe(401);
            expect(res.body.code).toBe("INVALID_CREDENTIALS");
        });

        it("retorna 401 com e-mail inexistente", async () => {
            const res = await request(app).post("/auth/login").send({
                email: "naoexiste@test.com",
                password: "senha123",
            });
            expect(res.status).toBe(401);
        });
    });

    describe("GET /auth/me", () => {
        let token;

        beforeAll(async () => {
            const user = await createUser({ email: "me@test.com" });
            token = tokenFor(user);
        });

        it("retorna dados do usuário autenticado", async () => {
            const res = await request(app).get("/auth/me").set("Authorization", token);

            expect(res.status).toBe(200);
            expect(res.body.data.email).toBe("me@test.com");
        });

        it("retorna 401 sem token", async () => {
            const res = await request(app).get("/auth/me");
            expect(res.status).toBe(401);
        });

        it("retorna 401 com token inválido", async () => {
            const res = await request(app).get("/auth/me").set("Authorization", "Bearer token_invalido");
            expect(res.status).toBe(401);
        });
    });
});
