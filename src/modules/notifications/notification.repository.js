import prisma from "../../config/prisma.js";

export function create(data) {
    return prisma.notification.create({ data });
}

export function findByUser(userId, { unread } = {}) {
    return prisma.notification.findMany({
        where: { userId, ...(unread ? { read: false } : {}) },
        orderBy: { createdAt: "desc" },
        take: 50,
    });
}

export function countUnread(userId) {
    return prisma.notification.count({ where: { userId, read: false } });
}

export async function markRead(id, userId) {
    const result = await prisma.notification.updateMany({
        where: { id, userId },
        data: { read: true },
    });
    return result.count > 0;
}

export function markAllRead(userId) {
    return prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
    });
}
