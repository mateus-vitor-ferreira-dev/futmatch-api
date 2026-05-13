import prisma from "../config/prisma.js";

// Mínimo de peladas com presença registrada para qualificar CONFIAVEL
const MIN_PELADAS_FOR_CONFIAVEL = 5;

async function computeBadge(userId) {
    const [avgResult, attended, recordedAttendance, peladasCreated] = await Promise.all([
        prisma.review.aggregate({ where: { reviewedId: userId }, _avg: { stars: true } }),
        prisma.participation.count({ where: { userId, attended: true } }),
        prisma.participation.count({ where: { userId, attended: { not: null } } }),
        prisma.pelada.count({ where: { organizerId: userId } }),
    ]);

    const avgStars = avgResult._avg.stars ?? 0;
    const attendanceRate = recordedAttendance >= MIN_PELADAS_FOR_CONFIAVEL
        ? attended / recordedAttendance
        : 0;

    if (avgStars >= 4.5) return "CRAQUE";
    if (attendanceRate >= 0.9) return "CONFIAVEL";
    if (peladasCreated >= 5) return "ORGANIZADOR_NATO";
    return null;
}

export async function recalculateBadge(userId) {
    const badge = await computeBadge(userId);
    await prisma.user.update({ where: { id: userId }, data: { badge } });
}
