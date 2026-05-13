import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { updateProfileSchema } from "./user.schema.js";
import * as userController from "./user.controller.js";

const router = Router();

// Rotas autenticadas — /me antes de /:userId para evitar conflito de parâmetro
router.get("/me", authenticate, userController.getMe);
router.patch("/me", authenticate, validate(updateProfileSchema), userController.updateMe);

// Perfil público
router.get("/:userId", userController.getProfile);

export default router;
