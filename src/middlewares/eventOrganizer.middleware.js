import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import HTTP from "../constants/httpStatus.js";

export const isOrganizerOrAdmin = asyncHandler(async (req, _res, next) => {
    const event = await prisma.pelada.findUnique({ where: { id: req.params.eventId } });

    if (!event || event.courtId !== req.params.courtId) {
        throw new AppError("Pelada não encontrada", HTTP.NOT_FOUND, "EVENT_NOT_FOUND");
    }

    const { role, sub } = req.user;

    const isAdmin = role === "ADMIN";
    const isOrganizer = event.organizerId === sub;

    if (!isAdmin && !isOrganizer) {
        throw new AppError("Sem permissão para gerenciar esta pelada", HTTP.FORBIDDEN, "FORBIDDEN");
    }

    req.event = event;
    next();
});
