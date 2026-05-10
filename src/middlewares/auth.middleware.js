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
    const payload = verifyToken(token);

    req.user = payload;
    next();
});
