import prisma from "../../config/prisma.js";

const ownerSelect = { select: { id: true, name: true } };

export function findAll() {
    return prisma.place.findMany({
        orderBy: { name: "asc" },
        include: {
            owner: ownerSelect,
            _count: { select: { courts: true } },
        },
    });
}

export function findById(id) {
    return prisma.place.findUnique({
        where: { id },
        include: {
            owner: ownerSelect,
            courts: { orderBy: { name: "asc" } },
        },
    });
}

export function create(data) {
    return prisma.place.create({ data, include: { owner: ownerSelect } });
}

export function update(id, data) {
    return prisma.place.update({ where: { id }, data, include: { owner: ownerSelect } });
}

export function findUserById(id) {
    return prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
}
