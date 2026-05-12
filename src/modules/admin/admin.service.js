import prisma from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import HTTP from "../../constants/httpStatus.js";

export async function updateUserRole(targetId, requesterId, role) {
    if (targetId === requesterId) {
        throw new AppError("Você não pode alterar o próprio role", HTTP.BAD_REQUEST, "SELF_ROLE_CHANGE");
    }

    const user = await prisma.user.findUnique({
        where: { id: targetId },
        select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
        throw new AppError("Usuário não encontrado", HTTP.NOT_FOUND, "USER_NOT_FOUND");
    }

    return prisma.user.update({
        where: { id: targetId },
        data: { role },
        select: { id: true, name: true, email: true, role: true },
    });
}

export async function listUsers(role) {
    return prisma.user.findMany({
        where: role ? { role } : undefined,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            badge: true,
            createdAt: true,
            _count: { select: { placesOwned: true, peladasCreated: true, participations: true } },
        },
    });
}
