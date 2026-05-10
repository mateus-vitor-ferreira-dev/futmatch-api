import { asyncHandler } from "../../utils/asyncHandler.js";
import { success, created } from "../../utils/apiResponse.js";
import * as authService from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    return created(res, result);
});

export const login = asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    return success(res, result);
});

export const googleAuth = asyncHandler(async (req, res) => {
    const result = await authService.googleAuth(req.body);
    return success(res, result);
});

export const me = asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.sub);
    return success(res, user);
});
