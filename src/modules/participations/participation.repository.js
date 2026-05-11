import prisma from "../../config/prisma.js";

const userSelect = {
    select: { id: true, name: true, avatarUrl: true, badge: true },
};

const peladaInclude = {
    court: {
        select: {
            id: true,
            name: true,
            type: true,
            place: {
                select: { id: true, name: true, city: true, neighborhood: true, state: true },
            },
        },
    },
    organizer: { select: { id: true, name: true, avatarUrl: true } },
    _count: { select: { participations: true } },
};

export function findByPeladaAndUser(peladaId, userId) {
    return prisma.participation.findUnique({
        where: { peladaId_userId: { peladaId, userId } },
    });
}

export function findAllByPelada(peladaId) {
    return prisma.participation.findMany({
        where: { peladaId },
        include: { user: userSelect },
        orderBy: { joinedAt: "asc" },
    });
}

export function create(peladaId, userId) {
    return prisma.participation.create({
        data: { peladaId, userId },
        include: { user: userSelect },
    });
}

export function remove(peladaId, userId) {
    return prisma.participation.delete({
        where: { peladaId_userId: { peladaId, userId } },
    });
}

export function count(peladaId) {
    return prisma.participation.count({ where: { peladaId } });
}

export function updateAttendance(peladaId, userId, attended) {
    return prisma.participation.update({
        where: { peladaId_userId: { peladaId, userId } },
        data: { attended },
        include: { user: userSelect },
    });
}

export function findUserById(userId) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, avatarUrl: true },
    });
}

export function updatePeladaStatus(peladaId, status) {
    return prisma.pelada.update({ where: { id: peladaId }, data: { status } });
}

export function findCreatedByUser(organizerId, filters = {}) {
    const { status } = filters;
    const where = { organizerId };
    if (status) where.status = status;
    return prisma.pelada.findMany({
        where,
        include: peladaInclude,
        orderBy: { date: "asc" },
    });
}

export function findByParticipant(userId, filters = {}) {
    const { status } = filters;
    const where = { userId };
    if (status) where.pelada = { status };
    return prisma.participation.findMany({
        where,
        include: { pelada: { include: peladaInclude } },
        orderBy: { joinedAt: "desc" },
    });
}
