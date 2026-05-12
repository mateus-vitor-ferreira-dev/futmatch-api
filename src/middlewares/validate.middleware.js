import { AppError } from "../utils/AppError.js";
import HTTP from "../constants/httpStatus.js";

export function validate(schema) {
    return async (req, res, next) => {
        try {
            req.body = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
            next();
        } catch (error) {
            throw new AppError(error.errors.join(", "), HTTP.UNPROCESSABLE_ENTITY, "VALIDATION_ERROR");
        }
    };
}

export function validateQuery(schema) {
    return async (req, res, next) => {
        try {
            req.validatedQuery = await schema.validate(req.query, { abortEarly: false, stripUnknown: true });
            next();
        } catch (error) {
            throw new AppError(error.errors.join(", "), HTTP.UNPROCESSABLE_ENTITY, "VALIDATION_ERROR");
        }
    };
}
