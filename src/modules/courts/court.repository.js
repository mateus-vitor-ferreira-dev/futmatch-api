import prisma from "../../config/prisma.js";

const placeSelect = {
    select: {
        id: true,
        name: true,
        city: true,
        neighborhood: true,
        state: true,
        owner: { select: { id: true, name: true } },
    },
};

export function findAllByPlace(placeId, filters = {}) {
    const { type, status, minPrice, maxPrice, availableAt } = filters;

    const where = { placeId };

    if (type) where.type = type;
    if (status) where.status = status;

    if (minPrice !== undefined || maxPrice !== undefined) {
        where.pricePerHour = {};
        if (minPrice !== undefined) where.pricePerHour.gte = minPrice;
        if (maxPrice !== undefined) where.pricePerHour.lte = maxPrice;
    }

    if (availableAt) {
        where.peladas = { none: { status: { in: ["WAITING", "FULL"] }, date: availableAt } };
    }

    return prisma.court.findMany({
        where,
        include: { place: placeSelect },
        orderBy: { name: "asc" },
    });
}

export function search(filters = {}) {
    const { type, status, minPrice, maxPrice, city, neighborhood, availableAt } = filters;

    const placeWhere = { status: "OPEN" };
    if (city) placeWhere.city = { contains: city, mode: "insensitive" };
    if (neighborhood) placeWhere.neighborhood = { contains: neighborhood, mode: "insensitive" };

    const where = {
        status: status ?? "OPEN",
        place: placeWhere,
    };

    if (type) where.type = type;

    if (minPrice !== undefined || maxPrice !== undefined) {
        where.pricePerHour = {};
        if (minPrice !== undefined) where.pricePerHour.gte = minPrice;
        if (maxPrice !== undefined) where.pricePerHour.lte = maxPrice;
    }

    if (availableAt) {
        where.peladas = { none: { status: { in: ["WAITING", "FULL"] }, date: availableAt } };
    }

    return prisma.court.findMany({
        where,
        include: { place: placeSelect },
        orderBy: [{ place: { city: "asc" } }, { name: "asc" }],
    });
}

export function findById(id) {
    return prisma.court.findUnique({ where: { id }, include: { place: placeSelect } });
}

export function create(placeId, data) {
    return prisma.court.create({ data: { ...data, placeId }, include: { place: placeSelect } });
}

export function update(id, data) {
    return prisma.court.update({ where: { id }, data, include: { place: placeSelect } });
}

export function remove(id) {
    return prisma.court.delete({ where: { id }, include: { place: placeSelect } });
}

export function countActivePeladas(courtId) {
    return prisma.pelada.count({ where: { courtId, status: { in: ["WAITING", "FULL"] } } });
}

export function findUserById(id) {
    return prisma.user.findUnique({ where: { id }, select: { id: true, name: true, role: true } });
}
