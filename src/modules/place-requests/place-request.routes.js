import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/admin.middleware.js";
import { isOwnerOrAdmin } from "../../middlewares/admin.middleware.js";
import { validate, validateQuery } from "../../middlewares/validate.middleware.js";
import {
    createPlaceRequestSchema,
    rejectPlaceRequestSchema,
    listRequestsQuerySchema,
} from "./place-request.schema.js";
import * as controller from "./place-request.controller.js";

const router = Router();

// Owner envia uma solicitação
router.post("/", authenticate, isOwnerOrAdmin, validate(createPlaceRequestSchema), controller.create);

// Owner consulta as próprias solicitações
router.get("/my", authenticate, isOwnerOrAdmin, validateQuery(listRequestsQuerySchema), controller.listMine);

// Admin lista todas as solicitações
router.get("/", authenticate, isAdmin, validateQuery(listRequestsQuerySchema), controller.listAll);

// Admin aprova ou rejeita
router.patch("/:id/approve", authenticate, isAdmin, controller.approve);
router.patch("/:id/reject", authenticate, isAdmin, validate(rejectPlaceRequestSchema), controller.reject);

export default router;
