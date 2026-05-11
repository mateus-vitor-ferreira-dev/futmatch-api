import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import placeRoutes from "../modules/places/place.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";
import courtRoutes from "../modules/courts/court.routes.js";
import eventRoutes from "../modules/events/event.routes.js";
import { validateQuery } from "../middlewares/validate.middleware.js";
import { searchCourtsQuerySchema } from "../modules/courts/court.schema.js";
import * as courtController from "../modules/courts/court.controller.js";
import { searchEventsQuerySchema } from "../modules/events/event.validator.js";
import * as eventController from "../modules/events/event.controller.js";

const router = Router();

router.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        data: { status: "ok", service: "futmatch-api" },
    });
});

router.use("/auth", authRoutes);
router.use("/places", placeRoutes);
router.use("/places/:placeId/courts", courtRoutes);
router.use("/courts/:courtId/events", eventRoutes);
router.use("/admin", adminRoutes);

// Busca global de quadras com filtros de localização
router.get("/courts", validateQuery(searchCourtsQuerySchema), courtController.search);

// Busca global de peladas com filtros de localização e modalidade
router.get("/events", validateQuery(searchEventsQuerySchema), eventController.search);

export default router;
