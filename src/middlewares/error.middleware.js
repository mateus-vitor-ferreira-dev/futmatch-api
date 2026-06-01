import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/client";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

const PRISMA_ERROR_MAP = {
    P2000: { status: 422, message: "Valor muito longo para o campo informado", code: "VALUE_TOO_LONG" },
    P2001: { status: 404, message: "Registro não encontrado", code: "RECORD_NOT_FOUND" },
    P2002: { status: 409, message: "Registro duplicado: esse valor já existe", code: "DUPLICATE_ENTRY" },
    P2003: { status: 409, message: "Operação inválida: registro referenciado não existe", code: "FOREIGN_KEY_VIOLATION" },
    P2004: { status: 409, message: "Restrição de banco de dados violada", code: "CONSTRAINT_VIOLATION" },
    P2011: { status: 422, message: "Campo obrigatório não pode ser nulo", code: "NULL_CONSTRAINT" },
    P2012: { status: 422, message: "Valor obrigatório ausente", code: "MISSING_REQUIRED_VALUE" },
    P2014: { status: 409, message: "Operação inválida: violação de relação entre registros", code: "RELATION_VIOLATION" },
    P2025: { status: 404, message: "Registro não encontrado", code: "RECORD_NOT_FOUND" },
};

const isDev = env.NODE_ENV !== "production";

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
        // Código Prisma não mapeado — loga e retorna genérico
        console.error(`[prisma] Unhandled error code ${error.code}:`, error.message);
        return res.status(500).json({
            success: false,
            message: "Erro interno no banco de dados",
            code: "DATABASE_ERROR",
        });
    }

    if (error instanceof PrismaClientValidationError) {
        return res.status(422).json({
            success: false,
            message: "Dados inválidos na requisição",
            code: "VALIDATION_ERROR",
        });
    }

    // Erro inesperado — loga sempre, expõe detalhes apenas em dev
    console.error(`[error] ${req.method} ${req.path}:`, error);

    return res.status(500).json({
        success: false,
        message: "Erro interno no servidor",
        code: "INTERNAL_SERVER_ERROR",
        ...(isDev && { detail: error.message }),
    });
}
