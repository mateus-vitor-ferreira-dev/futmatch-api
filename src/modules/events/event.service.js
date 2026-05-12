import { AppError } from "../../utils/AppError.js";
import HTTP from "../../constants/httpStatus.js";
import { EVENT_MESSAGES } from "../../constants/messages/event.messages.js";
import * as eventRepository from "./event.repository.js";

export function listByCourt(courtId, filters) {
    return eventRepository.findAllByCourt(courtId, filters);
}

export function search(filters) {
    return eventRepository.search(filters);
}

export async function getEvent(id) {
    const event = await eventRepository.findById(id);
    if (!event) throw new AppError(EVENT_MESSAGES.NOT_FOUND, HTTP.NOT_FOUND, "EVENT_NOT_FOUND");
    return event;
}

export async function createEvent(courtId, organizerId, data) {
    const court = await eventRepository.findCourt(courtId);
    if (!court) throw new AppError(EVENT_MESSAGES.COURT_NOT_FOUND, HTTP.NOT_FOUND, "COURT_NOT_FOUND");
    if (court.status === "CLOSED")
        throw new AppError(EVENT_MESSAGES.COURT_CLOSED, HTTP.UNPROCESSABLE_ENTITY, "COURT_CLOSED");

    const conflict = await eventRepository.findTimeConflict(courtId, new Date(data.date));
    if (conflict) throw new AppError(EVENT_MESSAGES.TIME_CONFLICT, HTTP.CONFLICT, "EVENT_TIME_CONFLICT");

    return eventRepository.create(courtId, organizerId, data);
}

export async function updateEvent(event, data, actorId) {
    if (event.status === "CANCELLED") {
        throw new AppError(EVENT_MESSAGES.CANNOT_EDIT_CANCELLED, HTTP.UNPROCESSABLE_ENTITY, "EVENT_CANCELLED");
    }
    if (event.status === "FINISHED") {
        throw new AppError(EVENT_MESSAGES.CANNOT_EDIT_FINISHED, HTTP.UNPROCESSABLE_ENTITY, "EVENT_FINISHED");
    }

    const allowed = ["date", "maxPlayers", "totalValue", "pixKey"];
    const updateData = Object.fromEntries(
        Object.entries(data).filter(([key]) => allowed.includes(key) && data[key] !== undefined),
    );

    if (updateData.date) {
        const conflict = await eventRepository.findTimeConflict(event.courtId, new Date(updateData.date), event.id);
        if (conflict) throw new AppError(EVENT_MESSAGES.TIME_CONFLICT, HTTP.CONFLICT, "EVENT_TIME_CONFLICT");
    }

    const [updated, actor] = await Promise.all([
        eventRepository.update(event.id, updateData),
        eventRepository.findUserById(actorId),
    ]);
    return { ...updated, updatedBy: { id: actor.id, name: actor.name, role: actor.role } };
}

export async function updateEventStatus(event, status, actorId) {
    if (event.status === "CANCELLED") {
        throw new AppError(EVENT_MESSAGES.ALREADY_CANCELLED, HTTP.UNPROCESSABLE_ENTITY, "EVENT_ALREADY_CANCELLED");
    }
    if (event.status === "FINISHED") {
        throw new AppError(EVENT_MESSAGES.ALREADY_FINISHED, HTTP.UNPROCESSABLE_ENTITY, "EVENT_ALREADY_FINISHED");
    }

    const [updated, actor] = await Promise.all([
        eventRepository.update(event.id, { status }),
        eventRepository.findUserById(actorId),
    ]);
    return { ...updated, updatedBy: { id: actor.id, name: actor.name, role: actor.role } };
}

export function deleteEvent(eventId) {
    return eventRepository.remove(eventId);
}
