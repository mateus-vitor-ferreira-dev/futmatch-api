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

// Permite ADMIN, organizador da pelada ou OWNER do place da quadra
export const isEventManagerOrAdmin = asyncHandler(async (req, _res, next) => {
    const event = await prisma.pelada.findUnique({
        where: { id: req.params.eventId },
        include: { court: { include: { place: { select: { ownerId: true } } } } },
    });

    if (!event || event.courtId !== req.params.courtId) {
        throw new AppError("Pelada não encontrada", HTTP.NOT_FOUND, "EVENT_NOT_FOUND");
    }

    const { role, sub } = req.user;
    const isAdmin = role === "ADMIN";
    const isOrganizer = event.organizerId === sub;
    const isPlaceOwner = role === "OWNER" && event.court.place.ownerId === sub;

    if (!isAdmin && !isOrganizer && !isPlaceOwner) {
        throw new AppError("Sem permissão para gerenciar esta pelada", HTTP.FORBIDDEN, "FORBIDDEN");
    }

    req.event = event;
    next();
});
