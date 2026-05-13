import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { isEventManagerOrAdmin } from "../../middlewares/eventOrganizer.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { drawSchema } from "./draw.schema.js";
import { draw } from "./draw.controller.js";

// Montado em /courts/:courtId/events/:eventId
const router = Router({ mergeParams: true });

router.post("/draw", authenticate, isEventManagerOrAdmin, validate(drawSchema), draw);

export default router;
