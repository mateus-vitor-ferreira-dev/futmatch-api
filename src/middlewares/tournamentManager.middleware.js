import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import HTTP from "../constants/httpStatus.js";
import { TOURNAMENT_MESSAGES } from "../constants/messages/tournament.messages.js";

// Permite ADMIN, OWNER do place ou organizador definido no campeonato
export const isTournamentManager = asyncHandler(async (req, _res, next) => {
    const tournament = await prisma.tournament.findUnique({
        where: { id: req.params.tournamentId },
        include: { place: true },
    });

    if (!tournament) {
        throw new AppError(TOURNAMENT_MESSAGES.NOT_FOUND, HTTP.NOT_FOUND, "TOURNAMENT_NOT_FOUND");
    }

    const { role, sub } = req.user;

    const isAdmin = role === "ADMIN";
    const isPlaceOwner = role === "OWNER" && tournament.place.ownerId === sub;
    const isOrganizer = tournament.organizerUserId === sub;

    if (!isAdmin && !isPlaceOwner && !isOrganizer) {
        throw new AppError(TOURNAMENT_MESSAGES.FORBIDDEN, HTTP.FORBIDDEN, "FORBIDDEN");
    }

    req.tournament = tournament;
    next();
});
