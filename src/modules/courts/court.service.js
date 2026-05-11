import { AppError } from "../../utils/AppError.js";
import HTTP from "../../constants/httpStatus.js";
import { COURT_MESSAGES } from "../../constants/messages/court.messages.js";
import * as courtRepository from "./court.repository.js";

export function listByPlace(placeId, filters) {
    return courtRepository.findAllByPlace(placeId, filters);
}

export function search(filters) {
    return courtRepository.search(filters);
}

export async function getCourt(id) {
    const court = await courtRepository.findById(id);
    if (!court) {
        throw new AppError(COURT_MESSAGES.NOT_FOUND, HTTP.NOT_FOUND, "COURT_NOT_FOUND");
    }
    return court;
}

export function createCourt(placeId, data) {
    return courtRepository.create(placeId, data);
}

export async function updateCourt(court, data, actorId) {
    const allowed = ["name", "type", "pricePerHour"];
    const updateData = Object.fromEntries(
        Object.entries(data).filter(([key]) => allowed.includes(key) && data[key] !== undefined)
    );
    const [updated, actor] = await Promise.all([
        courtRepository.update(court.id, updateData),
        courtRepository.findUserById(actorId),
    ]);
    return { ...updated, updatedBy: { id: actor.id, name: actor.name, role: actor.role } };
}

export async function updateCourtStatus(court, status, actorId) {
    const [updated, actor] = await Promise.all([
        courtRepository.update(court.id, { status }),
        courtRepository.findUserById(actorId),
    ]);
    return { ...updated, updatedBy: { id: actor.id, name: actor.name, role: actor.role } };
}

export async function deleteCourt(courtId) {
    const activeCount = await courtRepository.countActivePeladas(courtId);
    if (activeCount > 0) {
        throw new AppError(COURT_MESSAGES.HAS_ACTIVE_PELADAS, HTTP.CONFLICT, "COURT_HAS_ACTIVE_PELADAS");
    }
    const deleted = await courtRepository.remove(courtId);
    return deleted;
}
