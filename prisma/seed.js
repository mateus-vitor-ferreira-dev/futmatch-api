import bcrypt from "bcrypt";
import prisma from "../src/config/prisma.js";

async function main() {
    const hash = (pwd) => bcrypt.hash(pwd, 10);

    // ─── Users ───────────────────────────────────────────────────────────────

    const [admin, owner1, owner2, owner3, gabriel, lucas, rafael, pedro, ana, julia, marcos, thiago] =
        await Promise.all([
            prisma.user.upsert({
                where: { email: "admin@futmatch.com" },
                update: {},
                create: { name: "Admin FutMatch", email: "admin@futmatch.com", password: await hash("admin123"), role: "ADMIN" },
            }),
            prisma.user.upsert({
                where: { email: "carlos@arenasportzone.com" },
                update: {},
                create: { name: "Carlos Arena", email: "carlos@arenasportzone.com", password: await hash("senha123"), role: "OWNER", pixKey: "carlos@arenasportzone.com" },
            }),
            prisma.user.upsert({
                where: { email: "fernanda@barrasports.com" },
                update: {},
                create: { name: "Fernanda Sports", email: "fernanda@barrasports.com", password: await hash("senha123"), role: "OWNER", pixKey: "fernanda@barrasports.com" },
            }),
            prisma.user.upsert({
                where: { email: "roberto@quadrassavassi.com" },
                update: {},
                create: { name: "Roberto Savassi", email: "roberto@quadrassavassi.com", password: await hash("senha123"), role: "OWNER", pixKey: "roberto@quadrassavassi.com" },
            }),
            prisma.user.upsert({
                where: { email: "gabriel@player.com" },
                update: {},
                create: { name: "Gabriel Oliveira", email: "gabriel@player.com", password: await hash("senha123"), role: "PLAYER", pixKey: "gabriel.oliveira@pix" },
            }),
            prisma.user.upsert({
                where: { email: "lucas@player.com" },
                update: {},
                create: { name: "Lucas Santos", email: "lucas@player.com", password: await hash("senha123"), role: "PLAYER" },
            }),
            prisma.user.upsert({
                where: { email: "rafael@player.com" },
                update: {},
                create: { name: "Rafael Costa", email: "rafael@player.com", password: await hash("senha123"), role: "PLAYER" },
            }),
            prisma.user.upsert({
                where: { email: "pedro@player.com" },
                update: {},
                create: { name: "Pedro Alves", email: "pedro@player.com", password: await hash("senha123"), role: "PLAYER" },
            }),
            prisma.user.upsert({
                where: { email: "ana@player.com" },
                update: {},
                create: { name: "Ana Lima", email: "ana@player.com", password: await hash("senha123"), role: "PLAYER" },
            }),
            prisma.user.upsert({
                where: { email: "julia@player.com" },
                update: {},
                create: { name: "Júlia Ferreira", email: "julia@player.com", password: await hash("senha123"), role: "PLAYER" },
            }),
            prisma.user.upsert({
                where: { email: "marcos@player.com" },
                update: {},
                create: { name: "Marcos Pereira", email: "marcos@player.com", password: await hash("senha123"), role: "PLAYER" },
            }),
            prisma.user.upsert({
                where: { email: "thiago@player.com" },
                update: {},
                create: { name: "Thiago Rodrigues", email: "thiago@player.com", password: await hash("senha123"), role: "PLAYER" },
            }),
        ]);

    console.log("✅ Usuários criados/atualizados");

    // ─── Places ──────────────────────────────────────────────────────────────

    const upsertPlace = async (name, ownerId, data) => {
        const existing = await prisma.place.findFirst({ where: { name, ownerId } });
        return existing ?? await prisma.place.create({ data: { name, ownerId, ...data } });
    };

    const [sportzone, barra, savassi] = await Promise.all([
        upsertPlace("Arena SportZone", owner1.id, {
            street: "Rua das Olimpíadas", number: "142", neighborhood: "Vila Olímpia",
            city: "São Paulo", state: "SP", zipCode: "04551-000",
            latitude: -23.5991, longitude: -46.6872, status: "OPEN",
        }),
        upsertPlace("Complex Barra Sports", owner2.id, {
            street: "Avenida das Américas", number: "3900", neighborhood: "Barra da Tijuca",
            city: "Rio de Janeiro", state: "RJ", zipCode: "22640-102",
            latitude: -23.0003, longitude: -43.3654, status: "OPEN",
        }),
        upsertPlace("Quadras Savassi", owner3.id, {
            street: "Rua Pernambuco", number: "300", neighborhood: "Savassi",
            city: "Belo Horizonte", state: "MG", zipCode: "30130-150",
            latitude: -19.9379, longitude: -43.9352, status: "OPEN",
        }),
    ]);

    console.log("✅ Estabelecimentos criados/atualizados");

    // ─── Courts ──────────────────────────────────────────────────────────────

    const upsertCourt = async (placeId, name, data) => {
        const existing = await prisma.court.findFirst({ where: { placeId, name } });
        return existing ?? await prisma.court.create({ data: { placeId, name, ...data } });
    };

    // Arena SportZone — SP (Vila Olímpia)
    const [courtSociety, courtFutsal, courtVolei, courtBasquete] = await Promise.all([
        upsertCourt(sportzone.id, "Campo Society 1", { type: "SOCIETY", pricePerHour: 180, status: "OPEN" }),
        upsertCourt(sportzone.id, "Quadra Futsal A", { type: "FUTSAL", pricePerHour: 120, status: "OPEN" }),
        upsertCourt(sportzone.id, "Quadra Vôlei Indoor", { type: "VOLEI", pricePerHour: 100, status: "OPEN" }),
        upsertCourt(sportzone.id, "Quadra Basquete", { type: "BASQUETE", pricePerHour: 110, status: "OPEN" }),
    ]);

    // Complex Barra Sports — RJ (Barra da Tijuca)
    const [courtCampo, courtVoleiAreia, courtBeachTennis, courtAreia] = await Promise.all([
        upsertCourt(barra.id, "Campo de Futebol", { type: "CAMPO", pricePerHour: 300, status: "OPEN" }),
        upsertCourt(barra.id, "Quadra Vôlei de Areia 1", { type: "VOLEI_AREIA", pricePerHour: 80, status: "OPEN" }),
        upsertCourt(barra.id, "Quadra Beach Tennis 1", { type: "BEACH_TENNIS", pricePerHour: 90, status: "OPEN" }),
        upsertCourt(barra.id, "Arena de Areia (Futevôlei)", { type: "AREIA", pricePerHour: 85, status: "OPEN" }),
    ]);

    // Quadras Savassi — BH
    const [courtHandball, courtTenis, courtPeteca, courtFutsalBH] = await Promise.all([
        upsertCourt(savassi.id, "Quadra Handebol", { type: "HANDBALL", pricePerHour: 130, status: "OPEN" }),
        upsertCourt(savassi.id, "Quadra Tênis 1", { type: "TENIS", pricePerHour: 70, status: "OPEN" }),
        upsertCourt(savassi.id, "Quadra Peteca", { type: "PETECA", pricePerHour: 60, status: "OPEN" }),
        upsertCourt(savassi.id, "Quadra Futsal BH", { type: "FUTSAL", pricePerHour: 100, status: "OPEN" }),
    ]);

    console.log("✅ Quadras criadas/atualizadas");

    // ─── Peladas ─────────────────────────────────────────────────────────────

    const upsertPelada = async (courtId, organizerId, date, data) => {
        const existing = await prisma.pelada.findFirst({ where: { courtId, date } });
        return existing ?? await prisma.pelada.create({ data: { courtId, organizerId, date, ...data } });
    };

    const now = new Date();
    const d = (daysFromNow, hour = 19) => {
        const dt = new Date(now);
        dt.setDate(dt.getDate() + daysFromNow);
        dt.setHours(hour, 0, 0, 0);
        return dt;
    };

    // Peladas futuras — WAITING
    const [
        peladaSociety1, peladaSociety2,
        peladaFutsal1, peladaFutsal2,
        peladaVolei1,
        peladaBasquete1,
        peladaCampo1,
        peladaVoleiAreia1,
        peladaBeachTennis1,
        peladaHandball1,
        peladaTenis1,
        peladaPeteca1,
    ] = await Promise.all([
        upsertPelada(courtSociety.id, gabriel.id,   d(3, 18),  { maxPlayers: 18, totalValue: 360, pixKey: "gabriel.oliveira@pix", status: "WAITING" }),
        upsertPelada(courtSociety.id, lucas.id,     d(5, 20),  { maxPlayers: 14, totalValue: 280, pixKey: "lucas@player.com",     status: "WAITING" }),
        upsertPelada(courtFutsal.id,  rafael.id,    d(2, 19),  { maxPlayers: 12, totalValue: 240, pixKey: "rafael@player.com",    status: "WAITING" }),
        upsertPelada(courtFutsal.id,  pedro.id,     d(6, 21),  { maxPlayers: 10, totalValue: 200, pixKey: "pedro@player.com",     status: "WAITING" }),
        upsertPelada(courtVolei.id,   ana.id,       d(4, 17),  { maxPlayers: 14, totalValue: 210, pixKey: "ana@player.com",       status: "WAITING" }),
        upsertPelada(courtBasquete.id,julia.id,     d(7, 18),  { maxPlayers: 12, totalValue: 240, pixKey: "julia@player.com",     status: "WAITING" }),
        upsertPelada(courtCampo.id,   marcos.id,    d(10, 15), { maxPlayers: 22, totalValue: 440, pixKey: "marcos@player.com",    status: "WAITING" }),
        upsertPelada(courtVoleiAreia.id, ana.id,    d(3, 9),   { maxPlayers: 6,  totalValue: 90,  pixKey: "ana@player.com",       status: "WAITING" }),
        upsertPelada(courtBeachTennis.id, julia.id, d(8, 8),   { maxPlayers: 4,  totalValue: 80,  pixKey: "julia@player.com",     status: "WAITING" }),
        upsertPelada(courtHandball.id, thiago.id,   d(5, 20),  { maxPlayers: 16, totalValue: 320, pixKey: "thiago@player.com",    status: "WAITING" }),
        upsertPelada(courtTenis.id,   pedro.id,     d(2, 7),   { maxPlayers: 4,  totalValue: 60,  pixKey: "pedro@player.com",     status: "WAITING" }),
        upsertPelada(courtPeteca.id,  gabriel.id,   d(9, 16),  { maxPlayers: 6,  totalValue: 60,  pixKey: "gabriel.oliveira@pix", status: "WAITING" }),
    ]);

    // Pelada FULL (futsal com vagas esgotadas)
    const peladaFutsalFull = await upsertPelada(courtFutsalBH.id, thiago.id, d(1, 19), {
        maxPlayers: 4, totalValue: 80, pixKey: "thiago@player.com", status: "FULL",
    });

    // Pelada FINISHED (já aconteceu)
    const peladaFinished = await (async () => {
        const pastDate = d(-7, 19);
        const existing = await prisma.pelada.findFirst({ where: { courtId: courtFutsal.id, date: pastDate } });
        return existing ?? await prisma.pelada.create({
            data: {
                courtId: courtFutsal.id,
                organizerId: gabriel.id,
                date: pastDate,
                maxPlayers: 10,
                totalValue: 200,
                pixKey: "gabriel.oliveira@pix",
                status: "FINISHED",
            },
        });
    })();

    console.log("✅ Peladas criadas/atualizadas");

    // ─── Participações ───────────────────────────────────────────────────────

    const join = async (peladaId, userId, attended = null) => {
        const existing = await prisma.participation.findUnique({
            where: { peladaId_userId: { peladaId, userId } },
        });
        if (!existing) {
            await prisma.participation.create({ data: { peladaId, userId, attended } });
        }
    };

    // Pelada society 1 — gabriel organiza, 5 participantes
    await Promise.all([gabriel, lucas, rafael, pedro, ana].map((u) => join(peladaSociety1.id, u.id)));

    // Pelada futsal 1 — rafael organiza, 4 participantes
    await Promise.all([rafael, gabriel, marcos, thiago].map((u) => join(peladaFutsal1.id, u.id)));

    // Pelada vôlei — ana, 6 participantes
    await Promise.all([ana, julia, lucas, pedro, marcos, thiago].map((u) => join(peladaVolei1.id, u.id)));

    // Pelada FULL (futsal BH) — 4/4
    await Promise.all([thiago, gabriel, lucas, rafael].map((u) => join(peladaFutsalFull.id, u.id)));

    // Pelada FINISHED — todos participaram, presenças confirmadas
    await Promise.all([
        join(peladaFinished.id, gabriel.id, true),
        join(peladaFinished.id, lucas.id, true),
        join(peladaFinished.id, rafael.id, true),
        join(peladaFinished.id, pedro.id, false),
        join(peladaFinished.id, ana.id, true),
    ]);

    console.log("✅ Participações criadas/atualizadas");
    console.log("\n🎉 Seed concluído com sucesso!");
    console.log("\n📋 Credenciais:");
    console.log("   Admin   → admin@futmatch.com       / admin123");
    console.log("   Owners  → carlos@arenasportzone.com, fernanda@barrasports.com, roberto@quadrassavassi.com / senha123");
    console.log("   Players → gabriel, lucas, rafael, pedro, ana, julia, marcos, thiago @player.com / senha123");
}

main()
    .catch((err) => { console.error(err); process.exit(1); })
    .finally(() => prisma.$disconnect());
