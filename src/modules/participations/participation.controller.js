import { asyncHandler } from "../../utils/asyncHandler.js";
import { success, created, noContent } from "../../utils/apiResponse.js";
import * as participationService from "./participation.service.js";

export const join = asyncHandler(async (req, res) => {
    const participation = await participationService.joinPelada(
        req.params.eventId,
        req.params.courtId,
        req.user.sub,
    );
    return created(res, participation);
});

export const leave = asyncHandler(async (req, res) => {
    const result = await participationService.leavePelada(
        req.params.eventId,
        req.params.courtId,
        req.user.sub,
        req.body?.reason,
    );
    return success(res, result);
});

export const listParticipants = asyncHandler(async (req, res) => {
    const participants = await participationService.listParticipants(req.params.eventId);
    return success(res, participants);
});

export const confirmAttendance = asyncHandler(async (req, res) => {
    const participation = await participationService.confirmAttendance(
        req.params.eventId,
        req.params.courtId,
        req.params.userId,
        req.body.attended,
    );
    return success(res, participation);
});

export const myCreated = asyncHandler(async (req, res) => {
    const peladas = await participationService.myCreatedPeladas(req.user.sub, req.validatedQuery ?? {});
    return success(res, peladas);
});

export const myParticipations = asyncHandler(async (req, res) => {
    const peladas = await participationService.myParticipations(req.user.sub, req.validatedQuery ?? {});
    return success(res, peladas);
});
