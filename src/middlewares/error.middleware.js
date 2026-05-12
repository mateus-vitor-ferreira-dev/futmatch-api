import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/client";
import { AppError } from "../utils/AppError.js";

const PRISMA_ERROR_MAP = {
    P2002: { status: 409, message: "Registro duplicado: esse valor já existe", code: "DUPLICATE_ENTRY" },
    P2025: { status: 404, message: "Registro não encontrado", code: "RECORD_NOT_FOUND" },
    P2003: {
        status: 409,
        message: "Operação inválida: registro referenciado não existe",
        code: "FOREIGN_KEY_VIOLATION",
    },
    P2014: {
        status: 409,
        message: "Operação inválida: violação de relação entre registros",
        code: "RELATION_VIOLATION",
    },
};

export function errorMiddleware(error, req, res, _next) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            code: error.code,
        });
    }

    if (error instanceof PrismaClientKnownRequestError) {
        const mapped = PRISMA_ERROR_MAP[error.code];
        if (mapped) {
            return res.status(mapped.status).json({
                success: false,
                message: mapped.message,
                code: mapped.code,
            });
        }
    }

    if (error instanceof PrismaClientValidationError) {
        return res.status(422).json({
            success: false,
            message: "Dados inválidos na requisição",
            code: "VALIDATION_ERROR",
        });
    }

    console.error(error);

    return res.status(500).json({
        success: false,
        message: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
    });
}
