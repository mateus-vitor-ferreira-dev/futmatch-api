import { AppError } from "../../utils/AppError.js";
import HTTP from "../../constants/httpStatus.js";
import { TOURNAMENT_MESSAGES } from "../../constants/messages/tournament.messages.js";
import * as repo from "./tournament.repository.js";

// Status transitions permitidas
const VALID_TRANSITIONS = {
    DRAFT: ["OPEN", "CANCELLED"],
    OPEN: ["REGISTRATION_CLOSED", "CANCELLED"],
    REGISTRATION_CLOSED: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["FINISHED", "CANCELLED"],
    FINISHED: [],
    CANCELLED: [],
};

// Campos que podem ser editados no update geral
const ALLOWED_UPDATE_FIELDS = [
    "name",
    "description",
    "organizerType",
    "organizerName",
    "organizerUserId",
    "sportType",
    "format",
    "participantType",
    "registrationMode",
    "registrationStartDate",
    "registrationEndDate",
    "startDate",
    "endDate",
    "maxParticipants",
    "registrationFee",
    "paymentInstructions",
    "pixKey",
    "rules",
];

export function listTournaments(filters) {
    return repo.findAll(filters);
}

export async function getTournament(id) {
    const tournament = await repo.findById(id);
    if (!tournament) {
        throw new AppError(TOURNAMENT_MESSAGES.NOT_FOUND, HTTP.NOT_FOUND, "TOURNAMENT_NOT_FOUND");
    }
    return tournament;
}

export async function createTournament(data, createdById) {
    const place = await repo.findPlace(data.placeId);
    if (!place) {
        throw new AppError(TOURNAMENT_MESSAGES.PLACE_NOT_FOUND, HTTP.NOT_FOUND, "PLACE_NOT_FOUND");
    }
    return repo.create({ ...data, createdById });
}

export async function updateTournament(tournament, data) {
    if (tournament.status === "IN_PROGRESS" && data.format !== undefined) {
        throw new AppError(TOURNAMENT_MESSAGES.FORMAT_LOCKED, HTTP.CONFLICT, "FORMAT_LOCKED");
    }

    const updateData = Object.fromEntries(
        Object.entries(data).filter(([key]) => ALLOWED_UPDATE_FIELDS.includes(key) && data[key] !== undefined),
    );

    return repo.update(tournament.id, updateData);
}

export async function updateTournamentStatus(tournament, newStatus) {
    const allowed = VALID_TRANSITIONS[tournament.status] ?? [];
    if (!allowed.includes(newStatus)) {
        throw new AppError(
            `${TOURNAMENT_MESSAGES.INVALID_STATUS_TRANSITION}: ${tournament.status} → ${newStatus}`,
            HTTP.CONFLICT,
            "INVALID_STATUS_TRANSITION",
        );
    }
    return repo.update(tournament.id, { status: newStatus });
}

export async function deleteTournament(tournament) {
    if (tournament.status !== "DRAFT") {
        throw new AppError(TOURNAMENT_MESSAGES.CANNOT_DELETE, HTTP.CONFLICT, "CANNOT_DELETE_TOURNAMENT");
    }
    return repo.remove(tournament.id);
}

// Divisions

export function listDivisions(tournamentId) {
    return repo.findDivisionsByTournament(tournamentId);
}

export async function getDivision(id, tournamentId) {
    const division = await repo.findDivisionById(id);
    if (!division || division.tournamentId !== tournamentId) {
        throw new AppError(TOURNAMENT_MESSAGES.DIVISION_NOT_FOUND, HTTP.NOT_FOUND, "DIVISION_NOT_FOUND");
    }
    return division;
}

export function createDivision(tournamentId, data) {
    return repo.createDivision({ ...data, tournamentId });
}

export async function updateDivision(division, data) {
    const allowed = [
        "name",
        "description",
        "genderRestriction",
        "ageRestriction",
        "level",
        "minPlayersPerTeam",
        "maxPlayersPerTeam",
        "maxParticipants",
    ];
    const updateData = Object.fromEntries(
        Object.entries(data).filter(([key]) => allowed.includes(key) && data[key] !== undefined),
    );
    return repo.updateDivision(division.id, updateData);
}

export function deleteDivision(division) {
    return repo.removeDivision(division.id);
}
