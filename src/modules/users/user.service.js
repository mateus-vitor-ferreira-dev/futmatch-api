import bcrypt from "bcrypt";
import { AppError } from "../../utils/AppError.js";
import HTTP from "../../constants/httpStatus.js";
import { USER_MESSAGES } from "../../constants/messages/user.messages.js";
import * as repo from "./user.repository.js";

export async function getProfile(userId) {
    const profile = await repo.getPublicProfile(userId);
    if (!profile) {
        throw new AppError(USER_MESSAGES.NOT_FOUND, HTTP.NOT_FOUND, "USER_NOT_FOUND");
    }
    return profile;
}

export async function getMe(userId) {
    const user = await repo.findByIdWithPassword(userId);
    if (!user) {
        throw new AppError(USER_MESSAGES.NOT_FOUND, HTTP.NOT_FOUND, "USER_NOT_FOUND");
    }
    // retorna perfil público completo + campos privados
    const profile = await repo.getPublicProfile(userId);
    return { ...profile, email: user.email, pixKey: user.pixKey };
}

export async function updateMe(userId, data) {
    const { name, avatarUrl, pixKey, currentPassword, newPassword } = data;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (pixKey !== undefined) updateData.pixKey = pixKey;

    if (newPassword) {
        const user = await repo.findByIdWithPassword(userId);

        if (!user.password) {
            throw new AppError(USER_MESSAGES.NO_PASSWORD, HTTP.BAD_REQUEST, "NO_PASSWORD");
        }

        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) {
            throw new AppError(USER_MESSAGES.WRONG_PASSWORD, HTTP.UNAUTHORIZED, "WRONG_PASSWORD");
        }

        updateData.password = await bcrypt.hash(newPassword, 10);
    }

    return repo.update(userId, updateData);
}
