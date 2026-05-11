import { asyncHandler } from "../../utils/asyncHandler.js";
import { success, created } from "../../utils/apiResponse.js";
import * as eventService from "./event.service.js";

export const listByCourt = asyncHandler(async (req, res) => {
    const events = await eventService.listByCourt(req.params.courtId, req.validatedQuery ?? {});
    return success(res, events);
});

export const search = asyncHandler(async (req, res) => {
    const events = await eventService.search(req.validatedQuery ?? {});
    return success(res, events);
});

export const getOne = asyncHandler(async (req, res) => {
    const event = await eventService.getEvent(req.params.eventId);
    return success(res, event);
});

export const create = asyncHandler(async (req, res) => {
    const event = await eventService.createEvent(req.params.courtId, req.user.sub, req.body);
    return created(res, event);
});

export const update = asyncHandler(async (req, res) => {
    const event = await eventService.updateEvent(req.event, req.body, req.user.sub);
    return success(res, event);
});

export const updateStatus = asyncHandler(async (req, res) => {
    const event = await eventService.updateEventStatus(req.event, req.body.status, req.user.sub);
    return success(res, event);
});

export const remove = asyncHandler(async (req, res) => {
    const event = await eventService.deleteEvent(req.event.id);
    return success(res, event);
});
