import { execSync } from "child_process";
import dotenv from "dotenv";

export async function setup() {
    dotenv.config();

    const directUrl = process.env.DIRECT_URL_TEST;
    if (!directUrl) throw new Error("DIRECT_URL_TEST não definida no .env");

    console.log("\n🗄️  Rodando migrations no banco de testes...");

    execSync("npx prisma migrate deploy", {
        env: { ...process.env, DATABASE_URL: directUrl },
        stdio: "inherit",
    });

    console.log("✅ Banco de testes pronto.\n");
}
