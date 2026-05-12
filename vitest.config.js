import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
    test: {
        environment: "node",
        globals: false,
        env: {
            NODE_ENV: "test",
            DATABASE_URL: process.env.DATABASE_URL_TEST ?? "",
        },
        globalSetup: ["./src/tests/globalSetup.js"],
        setupFiles: ["./src/tests/setupTests.js"],
        coverage: {
            provider: "v8",
            reporter: ["text", "lcov"],
            include: ["src/modules/**", "src/middlewares/**"],
            exclude: ["**/*.test.js"],
        },
        fileParallelism: false,
        testTimeout: 15000,
    },
});
