import { verifyToken } from "../config/jwt.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import HTTP from "../constants/httpStatus.js";

export const authenticate = asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
        throw new AppError("Token não fornecido", HTTP.UNAUTHORIZED, "MISSING_TOKEN");
    }

    const token = header.split(" ")[1];

    let payload;
    try {
        payload = verifyToken(token);
    } catch {
        throw new AppError("Token inválido ou expirado", HTTP.UNAUTHORIZED, "INVALID_TOKEN");
    }

    req.user = payload;
    next();
});
