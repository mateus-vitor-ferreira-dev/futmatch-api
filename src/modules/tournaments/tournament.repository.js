import prisma from "../../config/prisma.js";

const createdBySelect = { select: { id: true, name: true } };
const organizerUserSelect = { select: { id: true, name: true } };
const placeSelect = { select: { id: true, name: true, city: true, state: true } };

const tournamentInclude = {
    place: placeSelect,
    createdBy: createdBySelect,
    organizerUser: organizerUserSelect,
    _count: { select: { divisions: true } },
};

const tournamentDetailInclude = {
    place: placeSelect,
    createdBy: createdBySelect,
    organizerUser: organizerUserSelect,
    divisions: { orderBy: { name: "asc" } },
};

export function findAll(filters = {}) {
    const where = {};
    if (filters.placeId) where.placeId = filters.placeId;
    if (filters.sportType) where.sportType = filters.sportType;
    if (filters.status) where.status = filters.status;
    if (filters.format) where.format = filters.format;

    return prisma.tournament.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: tournamentInclude,
    });
}

export function findById(id) {
    return prisma.tournament.findUnique({
        where: { id },
        include: tournamentDetailInclude,
    });
}

export function findByIdWithPlace(id) {
    return prisma.tournament.findUnique({
        where: { id },
        include: { place: true },
    });
}

export function create(data) {
    return prisma.tournament.create({
        data,
        include: tournamentDetailInclude,
    });
}

export function update(id, data) {
    return prisma.tournament.update({
        where: { id },
        data,
        include: tournamentDetailInclude,
    });
}

export function remove(id) {
    return prisma.tournament.delete({ where: { id } });
}

export function findPlace(id) {
    return prisma.place.findUnique({ where: { id }, select: { id: true, ownerId: true } });
}

// Division queries

export function findDivisionById(id) {
    return prisma.tournamentDivision.findUnique({ where: { id } });
}

export function findDivisionsByTournament(tournamentId) {
    return prisma.tournamentDivision.findMany({
        where: { tournamentId },
        orderBy: { name: "asc" },
    });
}

export function createDivision(data) {
    return prisma.tournamentDivision.create({ data });
}

export function updateDivision(id, data) {
    return prisma.tournamentDivision.update({ where: { id }, data });
}

export function removeDivision(id) {
    return prisma.tournamentDivision.delete({ where: { id } });
}
