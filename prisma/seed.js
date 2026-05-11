import bcrypt from "bcrypt";
import prisma from "../src/config/prisma.js";

async function main() {
    const passwordHash = await bcrypt.hash("admin123", 10);

    const admin = await prisma.user.upsert({
        where: { email: "admin@futmatch.com" },
        update: {},
        create: {
            name: "Admin FutMatch",
            email: "admin@futmatch.com",
            password: passwordHash,
            role: "ADMIN",
        },
        select: { id: true, name: true, email: true, role: true },
    });

    console.log("✅ Admin criado:", admin);
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
