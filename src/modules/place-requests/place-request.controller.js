import { asyncHandler } from "../../utils/asyncHandler.js";
import * as respond from "../../utils/apiResponse.js";
import * as service from "./place-request.service.js";

export const create = asyncHandler(async (req, res) => {
    const request = await service.create(req.user.sub, req.body);
    respond.created(res, request);
});

export const listAll = asyncHandler(async (req, res) => {
    const requests = await service.listAll(req.query.status);
    respond.success(res, requests);
});

export const listMine = asyncHandler(async (req, res) => {
    const requests = await service.listMine(req.user.sub, req.query.status);
    respond.success(res, requests);
});

export const approve = asyncHandler(async (req, res) => {
    const request = await service.approve(req.params.id);
    respond.success(res, request);
});

export const reject = asyncHandler(async (req, res) => {
    const request = await service.reject(req.params.id, req.body.adminNote);
    respond.success(res, request);
});
