import { asyncHandler } from "../../utils/asyncHandler.js";
import { success, created } from "../../utils/apiResponse.js";
import * as placeService from "./place.service.js";

export const list = asyncHandler(async (_req, res) => {
    const places = await placeService.listPlaces();
    return success(res, places);
});

export const getOne = asyncHandler(async (req, res) => {
    const place = await placeService.getPlace(req.params.id);
    return success(res, place);
});

export const create = asyncHandler(async (req, res) => {
    const place = await placeService.createPlace(req.body);
    return created(res, place);
});

export const update = asyncHandler(async (req, res) => {
    const place = await placeService.updatePlace(req.place, req.body);
    return success(res, place);
});

export const updateStatus = asyncHandler(async (req, res) => {
    const place = await placeService.updateStatus(req.place, req.body.status);
    return success(res, place);
});

export const assignOwner = asyncHandler(async (req, res) => {
    const place = await placeService.assignOwner(req.params.id, req.body.ownerId);
    return success(res, place);
});
