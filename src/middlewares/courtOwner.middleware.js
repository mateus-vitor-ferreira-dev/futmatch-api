import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import HTTP from "../constants/httpStatus.js";

export const isCourtPlaceOwnerOrAdmin = asyncHandler(async (req, _res, next) => {
    const court = await prisma.court.findUnique({
        where: { id: req.params.courtId },
        include: { place: true },
    });

    if (!court || court.placeId !== req.params.placeId) {
        throw new AppError("Quadra não encontrada", HTTP.NOT_FOUND, "COURT_NOT_FOUND");
    }

    const { role, sub } = req.user;

    const isAdmin = role === "ADMIN";
    const isOwner = role === "OWNER" && court.place.ownerId === sub;

    if (!isAdmin && !isOwner) {
        throw new AppError("Sem permissão para gerenciar esta quadra", HTTP.FORBIDDEN, "FORBIDDEN");
    }

    req.court = court;
    next();
});
