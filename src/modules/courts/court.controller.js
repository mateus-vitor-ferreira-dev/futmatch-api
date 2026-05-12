import { asyncHandler } from "../../utils/asyncHandler.js";
import { success, created } from "../../utils/apiResponse.js";
import * as courtService from "./court.service.js";

export const listByPlace = asyncHandler(async (req, res) => {
    const courts = await courtService.listByPlace(req.params.placeId, req.validatedQuery ?? {});
    return success(res, courts);
});

export const search = asyncHandler(async (req, res) => {
    const courts = await courtService.search(req.validatedQuery ?? {});
    return success(res, courts);
});

export const getOne = asyncHandler(async (req, res) => {
    const court = await courtService.getCourt(req.params.courtId);
    return success(res, court);
});

export const create = asyncHandler(async (req, res) => {
    const court = await courtService.createCourt(req.params.placeId, req.body);
    return created(res, court);
});

export const update = asyncHandler(async (req, res) => {
    const court = await courtService.updateCourt(req.court, req.body, req.user.sub);
    return success(res, court);
});

export const updateStatus = asyncHandler(async (req, res) => {
    const court = await courtService.updateCourtStatus(req.court, req.body.status, req.user.sub);
    return success(res, court);
});

export const remove = asyncHandler(async (req, res) => {
    const court = await courtService.deleteCourt(req.court.id);
    return success(res, court);
});
