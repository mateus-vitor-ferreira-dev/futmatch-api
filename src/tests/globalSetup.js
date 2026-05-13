import { execSync } from "child_process";
import dotenv from "dotenv";
import pg from "pg";

export async function setup() {
    dotenv.config();

    const directUrl = process.env.DIRECT_URL_TEST;
    const poolerUrl = process.env.DATABASE_URL_TEST;

    if (!directUrl) throw new Error("DIRECT_URL_TEST não definida no .env");

    console.log("\n🗄️  Rodando migrations no banco de testes...");

    execSync("npx prisma migrate deploy", {
        env: { ...process.env, DATABASE_URL: directUrl },
        stdio: "inherit",
    });

    console.log("🧹 Limpando banco de testes...");

    const client = new pg.Client({ connectionString: poolerUrl ?? directUrl });
    await client.connect();
    await client.query(`
        TRUNCATE TABLE
            "Review", "Participation", "Pelada",
            "TournamentDivision", "Tournament",
            "Court", "PlaceRequest", "Place", "Account", "User"
        CASCADE
    `);
    await client.end();

    console.log("✅ Banco de testes pronto.\n");
}
