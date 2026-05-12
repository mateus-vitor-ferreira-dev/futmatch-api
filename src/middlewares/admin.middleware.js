import { AppError } from "../utils/AppError.js";
import HTTP from "../constants/httpStatus.js";

export function isAdmin(req, _res, next) {
    if (req.user?.role !== "ADMIN") {
        throw new AppError("Acesso restrito a administradores", HTTP.FORBIDDEN, "FORBIDDEN");
    }
    next();
}

export function isOwnerOrAdmin(req, _res, next) {
    const { role } = req.user ?? {};
    if (role !== "OWNER" && role !== "ADMIN") {
        throw new AppError("Acesso restrito a proprietários", HTTP.FORBIDDEN, "FORBIDDEN");
    }
    next();
}
