import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/admin.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createReviewSchema } from "./review.schema.js";
import * as reviewController from "./review.controller.js";

// Rotas aninhadas em /courts/:courtId/events/:eventId
const eventRouter = Router({ mergeParams: true });

eventRouter.post("/reviews", authenticate, validate(createReviewSchema), reviewController.create);
eventRouter.get("/reviews", authenticate, isAdmin, reviewController.listByEvent);
eventRouter.get("/reviews/progress", authenticate, reviewController.progress);

export { eventRouter };

// Rota independente: avaliações recebidas por usuário
const userRouter = Router();
userRouter.get("/:userId/reviews", reviewController.listByUser);

export { userRouter };
