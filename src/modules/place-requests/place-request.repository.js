import prisma from "../../config/prisma.js";

const select = {
    id: true,
    name: true,
    street: true,
    number: true,
    complement: true,
    neighborhood: true,
    city: true,
    state: true,
    zipCode: true,
    country: true,
    latitude: true,
    longitude: true,
    status: true,
    adminNote: true,
    createdAt: true,
    updatedAt: true,
    owner: { select: { id: true, name: true, email: true } },
};

export function create(ownerId, data) {
    return prisma.placeRequest.create({ data: { ownerId, ...data }, select });
}

export function findAll(status) {
    return prisma.placeRequest.findMany({
        where: status ? { status } : undefined,
        orderBy: { createdAt: "desc" },
        select,
    });
}

export function findByOwner(ownerId, status) {
    return prisma.placeRequest.findMany({
        where: { ownerId, ...(status ? { status } : {}) },
        orderBy: { createdAt: "desc" },
        select,
    });
}

export function findById(id) {
    return prisma.placeRequest.findUnique({ where: { id }, select });
}

export function update(id, data) {
    return prisma.placeRequest.update({ where: { id }, data, select });
}
