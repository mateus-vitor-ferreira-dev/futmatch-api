import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import HTTP from "../constants/httpStatus.js";

export const isPlaceOwnerOrAdmin = asyncHandler(async (req, _res, next) => {
    const place = await prisma.place.findUnique({ where: { id: req.params.id } });

    if (!place) {
        throw new AppError("Estabelecimento não encontrado", HTTP.NOT_FOUND, "PLACE_NOT_FOUND");
    }

    const { role, sub } = req.user;

    const isAdmin = role === "ADMIN";
    const isOwner = role === "OWNER" && place.ownerId === sub;

    if (!isAdmin && !isOwner) {
        throw new AppError("Sem permissão para gerenciar este estabelecimento", HTTP.FORBIDDEN, "FORBIDDEN");
    }

    req.place = place;
    next();
});
