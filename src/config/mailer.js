import nodemailer from "nodemailer";
import { env } from "./env.js";

// Se SMTP_HOST não estiver configurado, usa o modo preview (loga no console)
function createTransport() {
    if (!env.SMTP_HOST) {
        return nodemailer.createTransport({ jsonTransport: true });
    }

    return nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
}

const transporter = createTransport();

export async function sendMail({ to, subject, html }) {
    const info = await transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        subject,
        html,
    });

    // Em desenvolvimento sem SMTP, imprime o e-mail no terminal
    if (!env.SMTP_HOST) {
        const msg = JSON.parse(info.message);
        console.log("\n📧  E-mail (modo preview — configure SMTP_HOST para envio real)");
        console.log("   Para:", msg.to?.[0]?.address);
        console.log("   Assunto:", msg.subject);
        // Extrai o link do HTML para facilitar teste
        const link = msg.html?.match(/href="([^"]+)"/)?.[1];
        if (link) console.log("   Link:", link);
        console.log("");
    }
}
