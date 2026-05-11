import prisma from "../../config/prisma.js";

const courtInclude = {
    select: {
        id: true,
        name: true,
        type: true,
        place: {
            select: {
                id: true,
                name: true,
                city: true,
                neighborhood: true,
                state: true,
            },
        },
    },
};

const organizerInclude = {
    select: {
        id: true,
        name: true,
        avatarUrl: true,
    },
};

const defaultInclude = {
    court: courtInclude,
    organizer: organizerInclude,
    _count: { select: { participations: true } },
};

export function findAllByCourt(courtId, filters = {}) {
    const { status, from, to } = filters;
    const where = { courtId };

    if (status) where.status = status;
    if (from || to) {
        where.date = {};
        if (from) where.date.gte = from;
        if (to) where.date.lte = to;
    }

    return prisma.pelada.findMany({
        where,
        include: defaultInclude,
        orderBy: { date: "asc" },
    });
}

export function search(filters = {}) {
    const { status, from, to, city, neighborhood, courtType } = filters;
    const where = {};

    if (status) where.status = status;
    if (from || to) {
        where.date = {};
        if (from) where.date.gte = from;
        if (to) where.date.lte = to;
    }

    const courtWhere = {};
    if (courtType) courtWhere.type = courtType;
    if (city || neighborhood) {
        courtWhere.place = {};
        if (city) courtWhere.place.city = { contains: city, mode: "insensitive" };
        if (neighborhood) courtWhere.place.neighborhood = { contains: neighborhood, mode: "insensitive" };
    }
    if (Object.keys(courtWhere).length) where.court = courtWhere;

    return prisma.pelada.findMany({
        where,
        include: defaultInclude,
        orderBy: { date: "asc" },
    });
}

export function findById(id) {
    return prisma.pelada.findUnique({ where: { id }, include: defaultInclude });
}

export function create(courtId, organizerId, data) {
    return prisma.pelada.create({
        data: { ...data, courtId, organizerId },
        include: defaultInclude,
    });
}

export function update(id, data) {
    return prisma.pelada.update({ where: { id }, data, include: defaultInclude });
}

export function remove(id) {
    return prisma.pelada.delete({
        where: { id },
        include: { court: courtInclude, organizer: organizerInclude },
    });
}

export function findCourt(id) {
    return prisma.court.findUnique({ where: { id } });
}

export function findTimeConflict(courtId, date, excludeId = null) {
    const where = { courtId, date, status: { in: ["WAITING", "FULL"] } };
    if (excludeId) where.id = { not: excludeId };
    return prisma.pelada.findFirst({ where });
}

export function findUserById(id) {
    return prisma.user.findUnique({ where: { id }, select: { id: true, name: true, role: true } });
}
