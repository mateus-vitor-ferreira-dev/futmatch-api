import { asyncHandler } from "../../utils/asyncHandler.js";
import { success } from "../../utils/apiResponse.js";
import { drawTeams } from "./draw.service.js";

export const draw = asyncHandler(async (req, res) => {
    const result = await drawTeams(req.params.eventId, req.body.teamCount);
    return success(res, result);
});
