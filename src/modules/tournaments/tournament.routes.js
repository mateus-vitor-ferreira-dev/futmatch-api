import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { isOwnerOrAdmin } from "../../middlewares/admin.middleware.js";
import { isTournamentManager } from "../../middlewares/tournamentManager.middleware.js";
import { validate, validateQuery } from "../../middlewares/validate.middleware.js";
import {
    createTournamentSchema,
    updateTournamentSchema,
    updateTournamentStatusSchema,
    listTournamentsQuerySchema,
    createDivisionSchema,
    updateDivisionSchema,
} from "./tournament.schema.js";
import * as tournamentController from "./tournament.controller.js";

const router = Router();

// Tournaments
router.get("/", validateQuery(listTournamentsQuerySchema), tournamentController.list);
router.get("/:tournamentId", tournamentController.getOne);

router.post(
    "/",
    authenticate,
    isOwnerOrAdmin,
    validate(createTournamentSchema),
    tournamentController.create,
);

router.patch(
    "/:tournamentId",
    authenticate,
    isTournamentManager,
    validate(updateTournamentSchema),
    tournamentController.update,
);

router.patch(
    "/:tournamentId/status",
    authenticate,
    isTournamentManager,
    validate(updateTournamentStatusSchema),
    tournamentController.updateStatus,
);

router.delete("/:tournamentId", authenticate, isTournamentManager, tournamentController.remove);

// Divisions
router.get("/:tournamentId/divisions", tournamentController.listDivisions);
router.get("/:tournamentId/divisions/:divisionId", tournamentController.getOneDivision);

router.post(
    "/:tournamentId/divisions",
    authenticate,
    isTournamentManager,
    validate(createDivisionSchema),
    tournamentController.createDivision,
);

router.patch(
    "/:tournamentId/divisions/:divisionId",
    authenticate,
    isTournamentManager,
    validate(updateDivisionSchema),
    tournamentController.updateDivision,
);

router.delete(
    "/:tournamentId/divisions/:divisionId",
    authenticate,
    isTournamentManager,
    tournamentController.removeDivision,
);

export default router;
