import { asyncHandler } from "../../utils/asyncHandler.js";
import { success, noContent } from "../../utils/apiResponse.js";
import { sseManager } from "../../utils/sseManager.js";
import * as notificationService from "./notification.service.js";

export const stream = (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const userId = req.user.sub;
    sseManager.add(userId, res);

    const heartbeat = setInterval(() => res.write(": heartbeat\n\n"), 30000);

    req.on("close", () => {
        clearInterval(heartbeat);
        sseManager.remove(userId, res);
    });
};

export const list = asyncHandler(async (req, res) => {
    const unread = req.query.unread === "true";
    const result = await notificationService.list(req.user.sub, { unread });
    return success(res, result);
});

export const markRead = asyncHandler(async (req, res) => {
    await notificationService.markRead(req.params.id, req.user.sub);
    return noContent(res);
});

export const markAllRead = asyncHandler(async (req, res) => {
    await notificationService.markAllRead(req.user.sub);
    return noContent(res);
});
