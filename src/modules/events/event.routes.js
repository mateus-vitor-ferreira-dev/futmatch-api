import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { isOrganizerOrAdmin } from "../../middlewares/eventOrganizer.middleware.js";
import { validate, validateQuery } from "../../middlewares/validate.middleware.js";
import {
    createEventSchema,
    updateEventSchema,
    updateEventStatusSchema,
    listEventsQuerySchema,
} from "./event.validator.js";
import * as eventController from "./event.controller.js";

// Montado em /courts/:courtId/events
const router = Router({ mergeParams: true });

router.get("/", validateQuery(listEventsQuerySchema), eventController.listByCourt);
router.get("/:eventId", eventController.getOne);

router.post("/", authenticate, validate(createEventSchema), eventController.create);

router.patch(
    "/:eventId",
    authenticate,
    isOrganizerOrAdmin,
    validate(updateEventSchema),
    eventController.update,
);

router.patch(
    "/:eventId/status",
    authenticate,
    isOrganizerOrAdmin,
    validate(updateEventStatusSchema),
    eventController.updateStatus,
);

router.delete("/:eventId", authenticate, isOrganizerOrAdmin, eventController.remove);

export default router;
