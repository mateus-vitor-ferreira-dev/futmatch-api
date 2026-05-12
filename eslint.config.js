import js from "@eslint/js";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";

export default [
    js.configs.recommended,
    prettierConfig,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.node,
            },
        },
        rules: {
            "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
            "no-console": ["warn", { allow: ["error", "warn"] }],
            "no-undef": "error",
        },
    },
    {
        files: ["src/server.js", "src/tests/globalSetup.js"],
        rules: {
            "no-console": "off",
        },
    },
    {
        ignores: ["node_modules/", "generated/", "prisma/migrations/"],
    },
];
