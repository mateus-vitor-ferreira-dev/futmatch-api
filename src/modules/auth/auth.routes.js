import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { registerSchema, loginSchema, googleSchema } from "./auth.schema.js";
import * as authController from "./auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/google", validate(googleSchema), authController.googleAuth);
router.get("/me", authenticate, authController.me);

export default router;
