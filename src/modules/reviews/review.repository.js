import prisma from "../../config/prisma.js";

const reviewerSelect = { select: { id: true, name: true, avatarUrl: true } };
const reviewedSelect = { select: { id: true, name: true, avatarUrl: true, badge: true } };

export function findPeladaById(peladaId) {
    return prisma.pelada.findUnique({
        where: { id: peladaId },
        select: { id: true, status: true },
    });
}

export function findParticipation(peladaId, userId) {
    return prisma.participation.findUnique({
        where: { peladaId_userId: { peladaId, userId } },
        select: { peladaId: true, userId: true },
    });
}

export function findExistingReview(peladaId, reviewerId, reviewedId) {
    return prisma.review.findUnique({
        where: { peladaId_reviewerId_reviewedId: { peladaId, reviewerId, reviewedId } },
    });
}

export function create(data) {
    return prisma.review.create({
        data,
        include: { reviewer: reviewerSelect, reviewed: reviewedSelect },
    });
}

// Quantos participantes há na pelada e quantos já foram avaliados pelo reviewer
export async function getProgress(peladaId, reviewerId) {
    const [totalParticipants, reviewed] = await Promise.all([
        prisma.participation.count({ where: { peladaId } }),
        prisma.review.count({ where: { peladaId, reviewerId } }),
    ]);
    // subtrai 1 para excluir o próprio reviewer da contagem de "a avaliar"
    return { total: totalParticipants - 1, reviewed };
}

// Todas as avaliações de uma pelada (para admin/organizador)
export function findByPelada(peladaId) {
    return prisma.review.findMany({
        where: { peladaId },
        include: { reviewer: reviewerSelect, reviewed: reviewedSelect },
        orderBy: { createdAt: "desc" },
    });
}

// Todas as avaliações recebidas por um usuário
export function findByReviewed(reviewedId) {
    return prisma.review.findMany({
        where: { reviewedId },
        include: {
            reviewer: reviewerSelect,
            pelada: {
                select: {
                    id: true,
                    date: true,
                    court: { select: { id: true, name: true, place: { select: { id: true, name: true } } } },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

// Média de estrelas e contagem de tags para um usuário
export async function getSummary(reviewedId) {
    const [aggregate, tags] = await Promise.all([
        prisma.review.aggregate({
            where: { reviewedId },
            _avg: { stars: true },
            _count: { stars: true },
        }),
        prisma.review.groupBy({
            by: ["tag"],
            where: { reviewedId },
            _count: { tag: true },
            orderBy: { _count: { tag: "desc" } },
        }),
    ]);

    return {
        averageStars: aggregate._avg.stars ? Number(aggregate._avg.stars.toFixed(2)) : null,
        totalReviews: aggregate._count.stars,
        tags: tags.map((t) => ({ tag: t.tag, count: t._count.tag })),
    };
}
