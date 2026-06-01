import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { swaggerSpec } from "./config/swagger.js";
import routes from "./routes/index.js";

const ALLOWED_ORIGINS = [
    env.APP_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
].filter(Boolean);

const app = express();

app.use(helmet({ contentSecurityPolicy: false, crossOriginOpenerPolicy: false }));
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origem não permitida — ${origin}`));
    },
    credentials: true,
}));
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(routes);

app.use(errorMiddleware);

export default app;
