import { asyncHandler } from "../../utils/asyncHandler.js";
import { success } from "../../utils/apiResponse.js";
import * as adminService from "./admin.service.js";

export const listUsers = asyncHandler(async (req, res) => {
    const users = await adminService.listUsers(req.validatedQuery?.role);
    return success(res, users);
});

export const updateUserRole = asyncHandler(async (req, res) => {
    const user = await adminService.updateUserRole(req.params.id, req.user.sub, req.body.role);
    return success(res, user);
});
