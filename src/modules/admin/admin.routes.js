import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/admin.middleware.js";
import { updateUserRoleSchema } from "./admin.schema.js";
import * as adminController from "./admin.controller.js";

const router = Router();

router.use(authenticate, isAdmin);

router.get("/users", adminController.listUsers);
router.patch("/users/:id/role", validate(updateUserRoleSchema), adminController.updateUserRole);

export default router;
