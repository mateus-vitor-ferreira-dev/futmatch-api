import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import placeRoutes from "../modules/places/place.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";
import courtRoutes from "../modules/courts/court.routes.js";
import eventRoutes from "../modules/events/event.routes.js";
import participationRoutes from "../modules/participations/participation.routes.js";
import { validateQuery } from "../middlewares/validate.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { searchCourtsQuerySchema } from "../modules/courts/court.schema.js";
import * as courtController from "../modules/courts/court.controller.js";
import { searchEventsQuerySchema } from "../modules/events/event.validator.js";
import * as eventController from "../modules/events/event.controller.js";
import { myPeladasQuerySchema } from "../modules/participations/participation.validator.js";
import * as participationController from "../modules/participations/participation.controller.js";

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
router.use("/courts/:courtId/events/:eventId/participations", participationRoutes);
router.use("/admin", adminRoutes);

// Busca global de quadras com filtros de localização
router.get("/courts", validateQuery(searchCourtsQuerySchema), courtController.search);

// Busca global de peladas com filtros de localização e modalidade
router.get("/events", validateQuery(searchEventsQuerySchema), eventController.search);

// Peladas do usuário autenticado
router.get("/events/my/created", authenticate, validateQuery(myPeladasQuerySchema), participationController.myCreated);
router.get("/events/my/participating", authenticate, validateQuery(myPeladasQuerySchema), participationController.myParticipations);

// --- SUA ROTA 404 (Sempre no final) ---
router.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Rota não encontrada",
        error: "404 Not Found"
    });
});

// A única exportação do arquivo
export default router;