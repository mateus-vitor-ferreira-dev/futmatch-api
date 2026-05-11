import { Router } from "express";
import { validate, validateQuery } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/admin.middleware.js";
import { updateUserRoleSchema, listUsersQuerySchema } from "./admin.schema.js";
import * as adminController from "./admin.controller.js";

const router = Router();

router.use(authenticate, isAdmin);

router.get("/users", validateQuery(listUsersQuerySchema), adminController.listUsers);
router.patch("/users/:id/role", validate(updateUserRoleSchema), adminController.updateUserRole);

export default router;
