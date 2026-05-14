import { AppError } from "../../utils/AppError.js";
import HTTP from "../../constants/httpStatus.js";
import { sseManager } from "../../utils/sseManager.js";
import * as repo from "./notification.repository.js";

export async function dispatch(userId, type, title, body, data = null) {
    const notification = await repo.create({ userId, type, title, body, data });
    sseManager.send(userId, notification);
    return notification;
}

export async function list(userId, filters) {
    const [notifications, unreadCount] = await Promise.all([
        repo.findByUser(userId, filters),
        repo.countUnread(userId),
    ]);
    return { notifications, unreadCount };
}

export async function markRead(id, userId) {
    const updated = await repo.markRead(id, userId);
    if (!updated) throw new AppError("Notificação não encontrada", HTTP.NOT_FOUND, "NOTIFICATION_NOT_FOUND");
}

export function markAllRead(userId) {
    return repo.markAllRead(userId);
}
