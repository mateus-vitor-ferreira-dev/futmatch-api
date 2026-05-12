import { AppError } from "../../utils/AppError.js";
import HTTP from "../../constants/httpStatus.js";
import { PARTICIPATION_MESSAGES } from "../../constants/messages/participation.messages.js";
import * as participationRepository from "./participation.repository.js";
import * as eventRepository from "../events/event.repository.js";

async function getValidEvent(eventId, courtId) {
    const event = await eventRepository.findById(eventId);
    if (!event || event.courtId !== courtId) {
        throw new AppError("Pelada não encontrada", HTTP.NOT_FOUND, "EVENT_NOT_FOUND");
    }
    return event;
}

export async function joinPelada(eventId, courtId, userId) {
    const event = await getValidEvent(eventId, courtId);

    if (event.status === "FULL") {
        throw new AppError(PARTICIPATION_MESSAGES.PELADA_FULL, HTTP.UNPROCESSABLE_ENTITY, "PELADA_FULL");
    }
    if (event.status !== "WAITING") {
        throw new AppError(
            PARTICIPATION_MESSAGES.PELADA_NOT_AVAILABLE,
            HTTP.UNPROCESSABLE_ENTITY,
            "PELADA_NOT_AVAILABLE",
        );
    }

    const existing = await participationRepository.findByPeladaAndUser(eventId, userId);
    if (existing) {
        throw new AppError(PARTICIPATION_MESSAGES.ALREADY_JOINED, HTTP.CONFLICT, "ALREADY_JOINED");
    }

    const participation = await participationRepository.create(eventId, userId);

    const total = await participationRepository.count(eventId);
    if (total >= event.maxPlayers) {
        await participationRepository.updatePeladaStatus(eventId, "FULL");
    }

    return participation;
}

export async function leavePelada(eventId, courtId, userId, reason) {
    const event = await getValidEvent(eventId, courtId);

    if (event.status === "FINISHED") {
        throw new AppError(
            PARTICIPATION_MESSAGES.CANNOT_LEAVE_FINISHED,
            HTTP.UNPROCESSABLE_ENTITY,
            "CANNOT_LEAVE_FINISHED",
        );
    }
    if (event.status === "CANCELLED") {
        throw new AppError(
            PARTICIPATION_MESSAGES.CANNOT_LEAVE_CANCELLED,
            HTTP.UNPROCESSABLE_ENTITY,
            "CANNOT_LEAVE_CANCELLED",
        );
    }

    const existing = await participationRepository.findByPeladaAndUser(eventId, userId);
    if (!existing) {
        throw new AppError(PARTICIPATION_MESSAGES.NOT_PARTICIPATING, HTTP.NOT_FOUND, "NOT_PARTICIPATING");
    }

    const [user] = await Promise.all([
        participationRepository.findUserById(userId),
        participationRepository.remove(eventId, userId),
    ]);

    if (event.status === "FULL") {
        await participationRepository.updatePeladaStatus(eventId, "WAITING");
    }

    const remaining = await participationRepository.count(eventId);

    return {
        user,
        pelada: { id: event.id, date: event.date, maxPlayers: event.maxPlayers },
        remainingPlayers: remaining,
        leftAt: new Date(),
        ...(reason && { reason }),
    };
}

export function listParticipants(eventId) {
    return participationRepository.findAllByPelada(eventId);
}

export async function confirmAttendance(eventId, courtId, targetUserId, attended) {
    const event = await getValidEvent(eventId, courtId);

    if (event.status !== "FINISHED") {
        throw new AppError(
            PARTICIPATION_MESSAGES.PELADA_NOT_FINISHED,
            HTTP.UNPROCESSABLE_ENTITY,
            "PELADA_NOT_FINISHED",
        );
    }

    const participation = await participationRepository.findByPeladaAndUser(eventId, targetUserId);
    if (!participation) {
        throw new AppError(PARTICIPATION_MESSAGES.NOT_PARTICIPATING, HTTP.NOT_FOUND, "NOT_PARTICIPATING");
    }

    return participationRepository.updateAttendance(eventId, targetUserId, attended);
}

export function myCreatedPeladas(userId, filters) {
    return participationRepository.findCreatedByUser(userId, filters);
}

export function myParticipations(userId, filters) {
    return participationRepository.findByParticipant(userId, filters);
}
