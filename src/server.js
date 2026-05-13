import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, () => {
    console.log(`🚀 Server running at http://localhost:${env.PORT}`);
    console.log(`📚 Swagger docs at  http://localhost:${env.PORT}/docs`);
});
