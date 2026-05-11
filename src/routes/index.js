import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import placeRoutes from "../modules/places/place.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        data: { status: "ok", service: "futmatch-api" },
    });
});

router.use("/auth", authRoutes);
router.use("/places", placeRoutes);
router.use("/admin", adminRoutes);

export default router;
