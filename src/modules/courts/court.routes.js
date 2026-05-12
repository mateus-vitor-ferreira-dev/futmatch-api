import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { isPlaceOwnerOrAdmin } from "../../middlewares/placeOwner.middleware.js";
import { isCourtPlaceOwnerOrAdmin } from "../../middlewares/courtOwner.middleware.js";
import { validate, validateQuery } from "../../middlewares/validate.middleware.js";
import {
    createCourtSchema,
    updateCourtSchema,
    updateCourtStatusSchema,
    listCourtsQuerySchema,
} from "./court.schema.js";
import * as courtController from "./court.controller.js";

// Montado em /places/:placeId/courts
const router = Router({ mergeParams: true });

router.get("/", validateQuery(listCourtsQuerySchema), courtController.listByPlace);
router.get("/:courtId", courtController.getOne);

router.post("/", authenticate, isPlaceOwnerOrAdmin("placeId"), validate(createCourtSchema), courtController.create);

router.patch("/:courtId", authenticate, isCourtPlaceOwnerOrAdmin, validate(updateCourtSchema), courtController.update);

router.patch(
    "/:courtId/status",
    authenticate,
    isCourtPlaceOwnerOrAdmin,
    validate(updateCourtStatusSchema),
    courtController.updateStatus,
);

router.delete("/:courtId", authenticate, isCourtPlaceOwnerOrAdmin, courtController.remove);

export default router;
