import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "API is running successfully",
        data: {
            status: "ok",
            service: "futmatch-api",
        },
    });
});
router.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Rota não encontrada",
        error: "404 Not Found"

    });
});
export default router;