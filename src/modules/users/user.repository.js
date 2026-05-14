import prisma from "../../config/prisma.js";

const pastStatuses = ["FINISHED", "CANCELLED"];

const peladaInclude = {
    court: {
        select: {
            id: true,
            name: true,
            type: true,
            place: { select: { id: true, name: true, city: true, neighborhood: true, state: true } },
        },
    },
    organizer: { select: { id: true, name: true, avatarUrl: true } },
    _count: { select: { participations: true } },
};

const publicSelect = {
    id: true,
    name: true,
    avatarUrl: true,
    badge: true,
    role: true,
    createdAt: true,
};

export function findById(id) {
    return prisma.user.findUnique({ where: { id }, select: publicSelect });
}

export function findByIdWithPassword(id) {
    return prisma.user.findUnique({
        where: { id },
        select: { ...publicSelect, email: true, pixKey: true, password: true },
    });
}

export function update(id, data) {
    return prisma.user.update({
        where: { id },
        data,
        select: { ...publicSelect, email: true, pixKey: true },
    });
}

export async function findHistory(userId, { role } = {}) {
    const [participations, organized] = await Promise.all([
        role !== "organizer"
            ? prisma.participation.findMany({
                  where: { userId, pelada: { status: { in: pastStatuses } } },
                  include: { pelada: { include: peladaInclude } },
              })
            : [],
        role !== "participant"
            ? prisma.pelada.findMany({
                  where: { organizerId: userId, status: { in: pastStatuses } },
                  include: peladaInclude,
              })
            : [],
    ]);

    const seen = new Set();
    const items = [];

    for (const part of participations) {
        seen.add(part.peladaId);
        const isOrganizer = part.pelada.organizerId === userId;
        items.push({ ...part.pelada, role: isOrganizer ? "organizer" : "participant", attended: part.attended });
    }

    for (const pelada of organized) {
        if (!seen.has(pelada.id)) {
            items.push({ ...pelada, role: "organizer", attended: null });
        }
    }

    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    return items;
}

export async function getPublicProfile(userId) {
    const [user, reviewStats, totalPeladas] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: publicSelect }),
        prisma.review.groupBy({
            by: ["tag"],
            where: { reviewedId: userId },
            _count: { tag: true },
            orderBy: { _count: { tag: "desc" } },
        }),
        prisma.participation.count({ where: { userId } }),
    ]);

    if (!user) return null;

    const avgResult = await prisma.review.aggregate({
        where: { reviewedId: userId },
        _avg: { stars: true },
        _count: { stars: true },
    });

    return {
        ...user,
        stats: {
            averageStars: avgResult._avg.stars ? Number(avgResult._avg.stars.toFixed(2)) : null,
            totalReviews: avgResult._count.stars,
            totalPeladas,
            tags: reviewStats.map((t) => ({ tag: t.tag, count: t._count.tag })),
        },
    };
}
