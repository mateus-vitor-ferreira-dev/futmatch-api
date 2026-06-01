import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { swaggerSpec } from "./config/swagger.js";
import routes from "./routes/index.js";

const app = express();

app.use(helmet({ contentSecurityPolicy: false, crossOriginOpenerPolicy: false }));
app.use(cors());
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(routes);

app.use(errorMiddleware);

export default app;
