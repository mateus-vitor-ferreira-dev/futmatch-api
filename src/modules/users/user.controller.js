import { asyncHandler } from "../../utils/asyncHandler.js";
import { success } from "../../utils/apiResponse.js";
import * as userService from "./user.service.js";

export const getMe = asyncHandler(async (req, res) => {
    const user = await userService.getMe(req.user.sub);
    return success(res, user);
});

export const updateMe = asyncHandler(async (req, res) => {
    const user = await userService.updateMe(req.user.sub, req.body);
    return success(res, user);
});

export const getProfile = asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.params.userId);
    return success(res, user);
});
