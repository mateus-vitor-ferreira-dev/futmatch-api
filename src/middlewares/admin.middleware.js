import { AppError } from "../utils/AppError.js";
import HTTP from "../constants/httpStatus.js";

export function isAdmin(req, _res, next) {
    if (req.user?.role !== "ADMIN") {
        throw new AppError("Acesso restrito a administradores", HTTP.FORBIDDEN, "FORBIDDEN");
    }
    next();
}
