import { asyncHandler } from "../../utils/asyncHandler.js";
import { success, created } from "../../utils/apiResponse.js";
import * as reviewService from "./review.service.js";

export const create = asyncHandler(async (req, res) => {
    const review = await reviewService.createReview(req.params.eventId, req.user.sub, req.body);
    return created(res, review);
});

export const progress = asyncHandler(async (req, res) => {
    const result = await reviewService.getProgress(req.params.eventId, req.user.sub);
    return success(res, result);
});

export const listByEvent = asyncHandler(async (req, res) => {
    const reviews = await reviewService.getByPelada(req.params.eventId);
    return success(res, reviews);
});

export const listByUser = asyncHandler(async (req, res) => {
    const result = await reviewService.getByUser(req.params.userId);
    return success(res, result);
});
