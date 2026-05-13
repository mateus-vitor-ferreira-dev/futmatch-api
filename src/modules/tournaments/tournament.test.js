import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { truncateAll } from "../../tests/setupTests.js";
import {
    createUser,
    createPlace,
    tokenFor,
    createTournament,
    createTournamentDivision,
} from "../../tests/helpers/factories.js";

const BASE = "/tournaments";

const tournamentPayload = {
    name: "Copa FutMatch 2026",
    description: "Campeonato anual de futevôlei",
    sportType: "AREIA",
    format: "GROUPS_AND_KNOCKOUT",
    registrationMode: "OPEN",
    maxParticipants: 16,
};

const divisionPayload = {
    name: "Masculino Intermediário",
    level: "INTERMEDIATE",
    minPlayersPerTeam: 2,
    maxPlayersPerTeam: 2,
    maxParticipants: 8,
};

describe("Tournaments", () => {
    let admin, owner, otherOwner, player, organizer;
    let adminToken, ownerToken, otherOwnerToken, playerToken, organizerToken;
    let place, otherPlace;

    beforeAll(async () => {
        await truncateAll();

        [admin, owner, otherOwner, player, organizer] = await Promise.all([
            createUser({ role: "ADMIN", email: "admin-tournaments@test.com" }),
            createUser({ role: "OWNER", email: "owner-tournaments@test.com" }),
            createUser({ role: "OWNER", email: "other-owner-tournaments@test.com" }),
            createUser({ role: "PLAYER", email: "player-tournaments@test.com" }),
            createUser({ role: "PLAYER", email: "organizer-tournaments@test.com" }),
        ]);

        adminToken = tokenFor(admin);
        ownerToken = tokenFor(owner);
        otherOwnerToken = tokenFor(otherOwner);
        playerToken = tokenFor(player);
        organizerToken = tokenFor(organizer);

        [place, otherPlace] = await Promise.all([
            createPlace({ ownerId: owner.id }),
            createPlace({ ownerId: otherOwner.id }),
        ]);
    });

    // ─── GET /tournaments ────────────────────────────────────────────────────

    describe("GET /tournaments", () => {
        beforeAll(async () => {
            await Promise.all([
                createTournament({ placeId: place.id, createdById: owner.id, sportType: "AREIA", status: "OPEN" }),
                createTournament({
                    placeId: place.id,
                    createdById: admin.id,
                    sportType: "BEACH_TENNIS",
                    status: "DRAFT",
                }),
                createTournament({ placeId: otherPlace.id, createdById: otherOwner.id }),
            ]);
        });

        it("lista campeonatos sem autenticação (público)", async () => {
            const res = await request(app).get(BASE);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThanOrEqual(3);
        });

        it("filtra por placeId", async () => {
            const res = await request(app).get(`${BASE}?placeId=${place.id}`);
            expect(res.status).toBe(200);
            expect(res.body.data.every((t) => t.placeId === place.id)).toBe(true);
        });

        it("filtra por sportType", async () => {
            const res = await request(app).get(`${BASE}?sportType=BEACH_TENNIS`);
            expect(res.status).toBe(200);
            expect(res.body.data.every((t) => t.sportType === "BEACH_TENNIS")).toBe(true);
        });

        it("filtra por status", async () => {
            const res = await request(app).get(`${BASE}?status=OPEN`);
            expect(res.status).toBe(200);
            expect(res.body.data.every((t) => t.status === "OPEN")).toBe(true);
        });

        it("filtra por format", async () => {
            const res = await request(app).get(`${BASE}?format=LEAGUE`);
            expect(res.status).toBe(200);
            expect(res.body.data.every((t) => t.format === "LEAGUE")).toBe(true);
        });

        it("rejeita sportType inválido (422)", async () => {
            const res = await request(app).get(`${BASE}?sportType=INVALIDO`);
            expect(res.status).toBe(422);
        });
    });

    // ─── GET /tournaments/:tournamentId ──────────────────────────────────────

    describe("GET /tournaments/:tournamentId", () => {
        let tournament;

        beforeAll(async () => {
            tournament = await createTournament({ placeId: place.id, createdById: owner.id });
            await createTournamentDivision({ tournamentId: tournament.id });
        });

        it("retorna campeonato com divisões (público)", async () => {
            const res = await request(app).get(`${BASE}/${tournament.id}`);
            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(tournament.id);
            expect(Array.isArray(res.body.data.divisions)).toBe(true);
        });

        it("retorna 404 para id inexistente", async () => {
            const res = await request(app).get(`${BASE}/id-que-nao-existe`);
            expect(res.status).toBe(404);
        });
    });

    // ─── POST /tournaments ───────────────────────────────────────────────────

    describe("POST /tournaments", () => {
        it("OWNER cria campeonato no próprio place (201)", async () => {
            const res = await request(app)
                .post(BASE)
                .set("Authorization", ownerToken)
                .send({ ...tournamentPayload, placeId: place.id });

            expect(res.status).toBe(201);
            expect(res.body.data.name).toBe(tournamentPayload.name);
            expect(res.body.data.status).toBe("DRAFT");
            expect(res.body.data.createdById).toBe(owner.id);
        });

        it("ADMIN cria campeonato em qualquer place (201)", async () => {
            const res = await request(app)
                .post(BASE)
                .set("Authorization", adminToken)
                .send({ ...tournamentPayload, placeId: place.id, name: "Copa Admin" });

            expect(res.status).toBe(201);
            expect(res.body.data.createdById).toBe(admin.id);
        });

        it("OWNER cria campeonato com organizerUserId (organizer designado)", async () => {
            const res = await request(app)
                .post(BASE)
                .set("Authorization", ownerToken)
                .send({
                    ...tournamentPayload,
                    placeId: place.id,
                    name: "Copa com Organizador",
                    organizerUserId: organizer.id,
                    organizerType: "USER",
                    organizerName: "Organizador Teste",
                });

            expect(res.status).toBe(201);
            expect(res.body.data.organizerUserId).toBe(organizer.id);
        });

        it("PLAYER não pode criar campeonato (403)", async () => {
            const res = await request(app)
                .post(BASE)
                .set("Authorization", playerToken)
                .send({ ...tournamentPayload, placeId: place.id });

            expect(res.status).toBe(403);
        });

        it("sem autenticação retorna 401", async () => {
            const res = await request(app)
                .post(BASE)
                .send({ ...tournamentPayload, placeId: place.id });

            expect(res.status).toBe(401);
        });

        it("place inexistente retorna 404", async () => {
            const res = await request(app)
                .post(BASE)
                .set("Authorization", adminToken)
                .send({ ...tournamentPayload, placeId: "place-nao-existe" });

            expect(res.status).toBe(404);
        });

        it("campos obrigatórios ausentes retornam 422", async () => {
            const res = await request(app)
                .post(BASE)
                .set("Authorization", ownerToken)
                .send({ name: "Sem esporte nem format" });

            expect(res.status).toBe(422);
        });

        it("sportType inválido retorna 422", async () => {
            const res = await request(app)
                .post(BASE)
                .set("Authorization", ownerToken)
                .send({ ...tournamentPayload, placeId: place.id, sportType: "INVALIDO" });

            expect(res.status).toBe(422);
        });

        it("format inválido retorna 422", async () => {
            const res = await request(app)
                .post(BASE)
                .set("Authorization", ownerToken)
                .send({ ...tournamentPayload, placeId: place.id, format: "INVALIDO" });

            expect(res.status).toBe(422);
        });
    });

    // ─── PATCH /tournaments/:tournamentId ────────────────────────────────────

    describe("PATCH /tournaments/:tournamentId", () => {
        let tournament, tournamentWithOrganizer, inProgressTournament;

        beforeAll(async () => {
            [tournament, tournamentWithOrganizer, inProgressTournament] = await Promise.all([
                createTournament({ placeId: place.id, createdById: owner.id }),
                createTournament({
                    placeId: place.id,
                    createdById: owner.id,
                    organizerUserId: organizer.id,
                    organizerType: "USER",
                }),
                createTournament({ placeId: place.id, createdById: owner.id, status: "IN_PROGRESS" }),
            ]);
        });

        it("OWNER do place atualiza campeonato (200)", async () => {
            const res = await request(app)
                .patch(`${BASE}/${tournament.id}`)
                .set("Authorization", ownerToken)
                .send({ name: "Nome Atualizado" });

            expect(res.status).toBe(200);
            expect(res.body.data.name).toBe("Nome Atualizado");
        });

        it("ADMIN atualiza qualquer campeonato (200)", async () => {
            const res = await request(app)
                .patch(`${BASE}/${tournament.id}`)
                .set("Authorization", adminToken)
                .send({ description: "Descrição nova" });

            expect(res.status).toBe(200);
            expect(res.body.data.description).toBe("Descrição nova");
        });

        it("organizerUser atualiza campeonato em que foi designado (200)", async () => {
            const res = await request(app)
                .patch(`${BASE}/${tournamentWithOrganizer.id}`)
                .set("Authorization", organizerToken)
                .send({ rules: "Regras do organizador" });

            expect(res.status).toBe(200);
            expect(res.body.data.rules).toBe("Regras do organizador");
        });

        it("outro OWNER sem vínculo retorna 403", async () => {
            const res = await request(app)
                .patch(`${BASE}/${tournament.id}`)
                .set("Authorization", otherOwnerToken)
                .send({ name: "Tentativa" });

            expect(res.status).toBe(403);
        });

        it("PLAYER retorna 403", async () => {
            const res = await request(app)
                .patch(`${BASE}/${tournament.id}`)
                .set("Authorization", playerToken)
                .send({ name: "Tentativa player" });

            expect(res.status).toBe(403);
        });

        it("não pode alterar format com status IN_PROGRESS (409)", async () => {
            const res = await request(app)
                .patch(`${BASE}/${inProgressTournament.id}`)
                .set("Authorization", ownerToken)
                .send({ format: "KNOCKOUT" });

            expect(res.status).toBe(409);
        });

        it("campeonato inexistente retorna 404", async () => {
            const res = await request(app)
                .patch(`${BASE}/nao-existe`)
                .set("Authorization", adminToken)
                .send({ name: "x" });

            expect(res.status).toBe(404);
        });
    });

    // ─── PATCH /tournaments/:tournamentId/status ─────────────────────────────

    describe("PATCH /tournaments/:tournamentId/status", () => {
        let tDraft, tOpen, tCancel, tInvalidDraft, tInvalidFinished, tInvalidBody, tPlayer;

        beforeAll(async () => {
            [tDraft, tOpen, tCancel, tInvalidDraft, tInvalidFinished, tInvalidBody, tPlayer] = await Promise.all([
                createTournament({ placeId: place.id, createdById: owner.id, status: "DRAFT" }),
                createTournament({ placeId: place.id, createdById: owner.id, status: "OPEN" }),
                createTournament({ placeId: place.id, createdById: owner.id, status: "OPEN" }),
                createTournament({ placeId: place.id, createdById: owner.id, status: "DRAFT" }),
                createTournament({ placeId: place.id, createdById: owner.id, status: "FINISHED" }),
                createTournament({ placeId: place.id, createdById: owner.id, status: "DRAFT" }),
                createTournament({ placeId: place.id, createdById: owner.id, status: "DRAFT" }),
            ]);
        });

        it("OWNER transiciona DRAFT → OPEN (200)", async () => {
            const res = await request(app)
                .patch(`${BASE}/${tDraft.id}/status`)
                .set("Authorization", ownerToken)
                .send({ status: "OPEN" });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe("OPEN");
        });

        it("ADMIN transiciona OPEN → REGISTRATION_CLOSED (200)", async () => {
            const res = await request(app)
                .patch(`${BASE}/${tOpen.id}/status`)
                .set("Authorization", adminToken)
                .send({ status: "REGISTRATION_CLOSED" });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe("REGISTRATION_CLOSED");
        });

        it("OWNER cancela campeonato OPEN (200)", async () => {
            const res = await request(app)
                .patch(`${BASE}/${tCancel.id}/status`)
                .set("Authorization", ownerToken)
                .send({ status: "CANCELLED" });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe("CANCELLED");
        });

        it("transição inválida retorna 409 (DRAFT → IN_PROGRESS)", async () => {
            const res = await request(app)
                .patch(`${BASE}/${tInvalidDraft.id}/status`)
                .set("Authorization", ownerToken)
                .send({ status: "IN_PROGRESS" });

            expect(res.status).toBe(409);
        });

        it("transição inválida retorna 409 (FINISHED → OPEN)", async () => {
            const res = await request(app)
                .patch(`${BASE}/${tInvalidFinished.id}/status`)
                .set("Authorization", ownerToken)
                .send({ status: "OPEN" });

            expect(res.status).toBe(409);
        });

        it("status inválido no body retorna 422", async () => {
            const res = await request(app)
                .patch(`${BASE}/${tInvalidBody.id}/status`)
                .set("Authorization", ownerToken)
                .send({ status: "STATUS_INVALIDO" });

            expect(res.status).toBe(422);
        });

        it("PLAYER retorna 403", async () => {
            const res = await request(app)
                .patch(`${BASE}/${tPlayer.id}/status`)
                .set("Authorization", playerToken)
                .send({ status: "OPEN" });

            expect(res.status).toBe(403);
        });
    });

    // ─── DELETE /tournaments/:tournamentId ───────────────────────────────────

    describe("DELETE /tournaments/:tournamentId", () => {
        let tOwner, tAdmin, tOpen, tInProgress, tOtherOwner, tPlayer;

        beforeAll(async () => {
            [tOwner, tAdmin, tOpen, tInProgress, tOtherOwner, tPlayer] = await Promise.all([
                createTournament({ placeId: place.id, createdById: owner.id, status: "DRAFT" }),
                createTournament({ placeId: place.id, createdById: owner.id, status: "DRAFT" }),
                createTournament({ placeId: place.id, createdById: owner.id, status: "OPEN" }),
                createTournament({ placeId: place.id, createdById: owner.id, status: "IN_PROGRESS" }),
                createTournament({ placeId: place.id, createdById: owner.id, status: "DRAFT" }),
                createTournament({ placeId: place.id, createdById: owner.id, status: "DRAFT" }),
            ]);
        });

        it("OWNER exclui campeonato em DRAFT (200)", async () => {
            const res = await request(app).delete(`${BASE}/${tOwner.id}`).set("Authorization", ownerToken);
            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(tOwner.id);
        });

        it("ADMIN exclui campeonato em DRAFT (200)", async () => {
            const res = await request(app).delete(`${BASE}/${tAdmin.id}`).set("Authorization", adminToken);
            expect(res.status).toBe(200);
        });

        it("não pode excluir campeonato OPEN (409)", async () => {
            const res = await request(app).delete(`${BASE}/${tOpen.id}`).set("Authorization", ownerToken);
            expect(res.status).toBe(409);
        });

        it("não pode excluir campeonato IN_PROGRESS (409)", async () => {
            const res = await request(app).delete(`${BASE}/${tInProgress.id}`).set("Authorization", ownerToken);
            expect(res.status).toBe(409);
        });

        it("outro OWNER retorna 403", async () => {
            const res = await request(app).delete(`${BASE}/${tOtherOwner.id}`).set("Authorization", otherOwnerToken);
            expect(res.status).toBe(403);
        });

        it("PLAYER retorna 403", async () => {
            const res = await request(app).delete(`${BASE}/${tPlayer.id}`).set("Authorization", playerToken);
            expect(res.status).toBe(403);
        });

        it("campeonato inexistente retorna 404", async () => {
            const res = await request(app).delete(`${BASE}/nao-existe`).set("Authorization", adminToken);
            expect(res.status).toBe(404);
        });
    });

    // ─── Divisions ───────────────────────────────────────────────────────────

    describe("Divisions", () => {
        let tournament, tournamentWithOrganizer;

        beforeAll(async () => {
            [tournament, tournamentWithOrganizer] = await Promise.all([
                createTournament({ placeId: place.id, createdById: owner.id }),
                createTournament({
                    placeId: place.id,
                    createdById: owner.id,
                    organizerUserId: organizer.id,
                    organizerType: "USER",
                }),
            ]);
        });

        describe("GET /tournaments/:tournamentId/divisions", () => {
            beforeAll(async () => {
                await Promise.all([
                    createTournamentDivision({ tournamentId: tournament.id, name: "Masc. Iniciante" }),
                    createTournamentDivision({ tournamentId: tournament.id, name: "Fem. Intermediário" }),
                ]);
            });

            it("lista divisões sem autenticação (público)", async () => {
                const res = await request(app).get(`${BASE}/${tournament.id}/divisions`);
                expect(res.status).toBe(200);
                expect(Array.isArray(res.body.data)).toBe(true);
                expect(res.body.data.length).toBeGreaterThanOrEqual(2);
            });
        });

        describe("GET /tournaments/:tournamentId/divisions/:divisionId", () => {
            let division, otherDiv;

            beforeAll(async () => {
                const otherT = await createTournament({ placeId: place.id, createdById: owner.id });
                [division, otherDiv] = await Promise.all([
                    createTournamentDivision({ tournamentId: tournament.id, name: "Misto Amador" }),
                    createTournamentDivision({ tournamentId: otherT.id, name: "Div Outro" }),
                ]);
            });

            it("retorna divisão existente (público)", async () => {
                const res = await request(app).get(`${BASE}/${tournament.id}/divisions/${division.id}`);
                expect(res.status).toBe(200);
                expect(res.body.data.id).toBe(division.id);
            });

            it("retorna 404 para divisão inexistente", async () => {
                const res = await request(app).get(`${BASE}/${tournament.id}/divisions/nao-existe`);
                expect(res.status).toBe(404);
            });

            it("retorna 404 quando divisão pertence a outro campeonato", async () => {
                const res = await request(app).get(`${BASE}/${tournament.id}/divisions/${otherDiv.id}`);
                expect(res.status).toBe(404);
            });
        });

        describe("POST /tournaments/:tournamentId/divisions", () => {
            it("OWNER cria divisão (201)", async () => {
                const res = await request(app)
                    .post(`${BASE}/${tournament.id}/divisions`)
                    .set("Authorization", ownerToken)
                    .send({ ...divisionPayload, name: "Masc. Avançado" });

                expect(res.status).toBe(201);
                expect(res.body.data.tournamentId).toBe(tournament.id);
            });

            it("ADMIN cria divisão (201)", async () => {
                const res = await request(app)
                    .post(`${BASE}/${tournament.id}/divisions`)
                    .set("Authorization", adminToken)
                    .send({ ...divisionPayload, name: "Fem. Avançado" });

                expect(res.status).toBe(201);
            });

            it("organizer designado cria divisão (201)", async () => {
                const res = await request(app)
                    .post(`${BASE}/${tournamentWithOrganizer.id}/divisions`)
                    .set("Authorization", organizerToken)
                    .send({ ...divisionPayload, name: "Misto Iniciante" });

                expect(res.status).toBe(201);
            });

            it("PLAYER retorna 403", async () => {
                const res = await request(app)
                    .post(`${BASE}/${tournament.id}/divisions`)
                    .set("Authorization", playerToken)
                    .send(divisionPayload);

                expect(res.status).toBe(403);
            });

            it("sem autenticação retorna 401", async () => {
                const res = await request(app)
                    .post(`${BASE}/${tournament.id}/divisions`)
                    .send(divisionPayload);

                expect(res.status).toBe(401);
            });

            it("campos obrigatórios ausentes retornam 422", async () => {
                const res = await request(app)
                    .post(`${BASE}/${tournament.id}/divisions`)
                    .set("Authorization", ownerToken)
                    .send({});

                expect(res.status).toBe(422);
            });

            it("level inválido retorna 422", async () => {
                const res = await request(app)
                    .post(`${BASE}/${tournament.id}/divisions`)
                    .set("Authorization", ownerToken)
                    .send({ ...divisionPayload, level: "SUPER_AVANCADO" });

                expect(res.status).toBe(422);
            });
        });

        describe("PATCH /tournaments/:tournamentId/divisions/:divisionId", () => {
            let division, divisionForOrganizer;

            beforeAll(async () => {
                [division, divisionForOrganizer] = await Promise.all([
                    createTournamentDivision({ tournamentId: tournament.id, name: "Para Editar" }),
                    createTournamentDivision({ tournamentId: tournamentWithOrganizer.id, name: "Do Organizador" }),
                ]);
            });

            it("OWNER atualiza divisão (200)", async () => {
                const res = await request(app)
                    .patch(`${BASE}/${tournament.id}/divisions/${division.id}`)
                    .set("Authorization", ownerToken)
                    .send({ name: "Nome Editado", level: "ADVANCED" });

                expect(res.status).toBe(200);
                expect(res.body.data.name).toBe("Nome Editado");
                expect(res.body.data.level).toBe("ADVANCED");
            });

            it("ADMIN atualiza divisão (200)", async () => {
                const res = await request(app)
                    .patch(`${BASE}/${tournament.id}/divisions/${division.id}`)
                    .set("Authorization", adminToken)
                    .send({ description: "Atualizada pelo admin" });

                expect(res.status).toBe(200);
            });

            it("organizer atualiza divisão do próprio campeonato (200)", async () => {
                const res = await request(app)
                    .patch(`${BASE}/${tournamentWithOrganizer.id}/divisions/${divisionForOrganizer.id}`)
                    .set("Authorization", organizerToken)
                    .send({ name: "Editado pelo organizador" });

                expect(res.status).toBe(200);
            });

            it("outro OWNER sem vínculo retorna 403", async () => {
                const res = await request(app)
                    .patch(`${BASE}/${tournament.id}/divisions/${division.id}`)
                    .set("Authorization", otherOwnerToken)
                    .send({ name: "Tentativa" });

                expect(res.status).toBe(403);
            });

            it("PLAYER retorna 403", async () => {
                const res = await request(app)
                    .patch(`${BASE}/${tournament.id}/divisions/${division.id}`)
                    .set("Authorization", playerToken)
                    .send({ name: "Tentativa" });

                expect(res.status).toBe(403);
            });
        });

        describe("DELETE /tournaments/:tournamentId/divisions/:divisionId", () => {
            let dOwner, dAdmin, dOrganizer, dOtherOwner, dPlayer;

            beforeAll(async () => {
                [dOwner, dAdmin, dOrganizer, dOtherOwner, dPlayer] = await Promise.all([
                    createTournamentDivision({ tournamentId: tournament.id, name: "Para Deletar Owner" }),
                    createTournamentDivision({ tournamentId: tournament.id, name: "Para Deletar Admin" }),
                    createTournamentDivision({ tournamentId: tournamentWithOrganizer.id, name: "Para Deletar Org" }),
                    createTournamentDivision({ tournamentId: tournament.id, name: "Nao Delete OtherOwner" }),
                    createTournamentDivision({ tournamentId: tournament.id, name: "Nao Delete Player" }),
                ]);
            });

            it("OWNER remove divisão (200)", async () => {
                const res = await request(app)
                    .delete(`${BASE}/${tournament.id}/divisions/${dOwner.id}`)
                    .set("Authorization", ownerToken);

                expect(res.status).toBe(200);
                expect(res.body.data.id).toBe(dOwner.id);
            });

            it("ADMIN remove divisão (200)", async () => {
                const res = await request(app)
                    .delete(`${BASE}/${tournament.id}/divisions/${dAdmin.id}`)
                    .set("Authorization", adminToken);

                expect(res.status).toBe(200);
            });

            it("organizer remove divisão do próprio campeonato (200)", async () => {
                const res = await request(app)
                    .delete(`${BASE}/${tournamentWithOrganizer.id}/divisions/${dOrganizer.id}`)
                    .set("Authorization", organizerToken);

                expect(res.status).toBe(200);
            });

            it("outro OWNER sem vínculo retorna 403", async () => {
                const res = await request(app)
                    .delete(`${BASE}/${tournament.id}/divisions/${dOtherOwner.id}`)
                    .set("Authorization", otherOwnerToken);

                expect(res.status).toBe(403);
            });

            it("PLAYER retorna 403", async () => {
                const res = await request(app)
                    .delete(`${BASE}/${tournament.id}/divisions/${dPlayer.id}`)
                    .set("Authorization", playerToken);

                expect(res.status).toBe(403);
            });

            it("divisão inexistente retorna 404", async () => {
                const res = await request(app)
                    .delete(`${BASE}/${tournament.id}/divisions/nao-existe`)
                    .set("Authorization", adminToken);

                expect(res.status).toBe(404);
            });
        });
    });
});
