import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/admin.middleware.js";
import { isPlaceOwnerOrAdmin } from "../../middlewares/placeOwner.middleware.js";
import {
    createPlaceSchema,
    updatePlaceSchema,
    updateStatusSchema,
    assignOwnerSchema,
} from "./place.schema.js";
import * as placeController from "./place.controller.js";

const router = Router();

router.get("/", placeController.list);
router.get("/:id", placeController.getOne);

router.post("/", authenticate, isAdmin, validate(createPlaceSchema), placeController.create);

router.patch("/:id", authenticate, isPlaceOwnerOrAdmin(), validate(updatePlaceSchema), placeController.update);
router.patch("/:id/status", authenticate, isPlaceOwnerOrAdmin(), validate(updateStatusSchema), placeController.updateStatus);


// Só admin atribui um OWNER a um lugar
router.patch("/:id/owner", authenticate, isAdmin, validate(assignOwnerSchema), placeController.assignOwner);

export default router;
