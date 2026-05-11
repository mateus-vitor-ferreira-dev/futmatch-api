import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { isOrganizerOrAdmin } from "../../middlewares/eventOrganizer.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { leavePeladaSchema, confirmAttendanceSchema } from "./participation.validator.js";
import * as participationController from "./participation.controller.js";

// Montado em /courts/:courtId/events/:eventId/participations
const router = Router({ mergeParams: true });

router.get("/", participationController.listParticipants);
router.post("/", authenticate, participationController.join);
router.delete("/", authenticate, validate(leavePeladaSchema), participationController.leave);

router.patch(
    "/:userId/attendance",
    authenticate,
    isOrganizerOrAdmin,
    validate(confirmAttendanceSchema),
    participationController.confirmAttendance,
);

export default router;
