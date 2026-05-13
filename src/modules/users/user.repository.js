import prisma from "../../config/prisma.js";

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
