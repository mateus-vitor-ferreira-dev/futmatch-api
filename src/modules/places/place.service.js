import { AppError } from "../../utils/AppError.js";
import HTTP from "../../constants/httpStatus.js";
import * as placeRepository from "./place.repository.js";

export function listPlaces() {
    return placeRepository.findAll();
}

export async function getPlace(id) {
    const place = await placeRepository.findById(id);

    if (!place) {
        throw new AppError("Estabelecimento não encontrado", HTTP.NOT_FOUND, "PLACE_NOT_FOUND");
    }

    return place;
}

export function createPlace(data) {
    return placeRepository.create(data);
}

export function updatePlace(place, data) {
    const allowed = ["name", "street", "number", "complement", "neighborhood", "city", "state", "zipCode", "latitude", "longitude"];
    const updateData = Object.fromEntries(
        Object.entries(data).filter(([key]) => allowed.includes(key) && data[key] !== undefined)
    );
    return placeRepository.update(place.id, updateData);
}

export function updateStatus(place, status) {
    return placeRepository.update(place.id, { status });
}


export async function assignOwner(placeId, ownerId) {
    const user = await placeRepository.findUserById(ownerId);

    if (!user) {
        throw new AppError("Usuário não encontrado", HTTP.NOT_FOUND, "USER_NOT_FOUND");
    }

    if (user.role !== "OWNER") {
        throw new AppError(
            "O usuário precisa ter o role OWNER para ser atribuído a um estabelecimento",
            HTTP.BAD_REQUEST,
            "USER_NOT_OWNER"
        );
    }

    return placeRepository.update(placeId, { ownerId });
}
