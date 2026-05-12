import { AppError } from "../../utils/AppError.js";
import HTTP from "../../constants/httpStatus.js";
import * as repo from "./place-request.repository.js";
import * as placeRepo from "../places/place.repository.js";

export function create(ownerId, data) {
    return repo.create(ownerId, data);
}

export function listAll(status) {
    return repo.findAll(status);
}

export function listMine(ownerId, status) {
    return repo.findByOwner(ownerId, status);
}

async function findOrFail(id) {
    const request = await repo.findById(id);
    if (!request) throw new AppError("Solicitação não encontrada", HTTP.NOT_FOUND, "REQUEST_NOT_FOUND");
    return request;
}

export async function approve(id) {
    const request = await findOrFail(id);

    if (request.status !== "PENDING") {
        throw new AppError(
            "Apenas solicitações pendentes podem ser aprovadas",
            HTTP.BAD_REQUEST,
            "REQUEST_NOT_PENDING",
        );
    }

    const {
        owner,
        status: _status,
        adminNote: _adminNote,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        ...placeData
    } = request;

    await placeRepo.create({ ...placeData, ownerId: owner.id });

    return repo.update(id, { status: "APPROVED" });
}

export async function reject(id, adminNote) {
    const request = await findOrFail(id);

    if (request.status !== "PENDING") {
        throw new AppError(
            "Apenas solicitações pendentes podem ser rejeitadas",
            HTTP.BAD_REQUEST,
            "REQUEST_NOT_PENDING",
        );
    }

    return repo.update(id, { status: "REJECTED", adminNote: adminNote ?? null });
}
