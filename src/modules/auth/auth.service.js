import bcrypt from "bcrypt";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import prisma from "../../config/prisma.js";
import { signToken } from "../../config/jwt.js";
import { env } from "../../config/env.js";
import { sendMail } from "../../config/mailer.js";
import { AppError } from "../../utils/AppError.js";
import HTTP from "../../constants/httpStatus.js";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export async function register({ name, email, password }) {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        throw new AppError("E-mail já cadastrado", HTTP.CONFLICT, "EMAIL_IN_USE");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: { name, email, password: passwordHash },
        select: { id: true, name: true, email: true, avatarUrl: true, role: true, badge: true, createdAt: true },
    });

    const token = signToken({ sub: user.id, name: user.name, email: user.email, role: user.role });

    return { user, token };
}

export async function login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
        throw new AppError("Credenciais inválidas", HTTP.UNAUTHORIZED, "INVALID_CREDENTIALS");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        throw new AppError("Credenciais inválidas", HTTP.UNAUTHORIZED, "INVALID_CREDENTIALS");
    }

    const token = signToken({ sub: user.id, name: user.name, email: user.email, role: user.role });

    const { password: _, ...safeUser } = user;

    return { user: safeUser, token };
}

export async function googleAuth({ idToken }) {
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, name, email, picture } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        user = await prisma.user.create({
            data: {
                name,
                email,
                avatarUrl: picture,
                accounts: {
                    create: { provider: "google", providerAccountId: sub },
                },
            },
        });
    } else {
        const account = await prisma.account.findUnique({
            where: { provider_providerAccountId: { provider: "google", providerAccountId: sub } },
        });

        if (!account) {
            await prisma.account.create({
                data: { userId: user.id, provider: "google", providerAccountId: sub },
            });
        }
    }

    const token = signToken({ sub: user.id, name: user.name, email: user.email, role: user.role });

    const { password: _, ...safeUser } = user;

    return { user: safeUser, token };
}

export async function forgotPassword({ email }) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Resposta genérica — não revela se o e-mail existe
    if (!user || !user.password) return;

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const resetUrl = `${env.APP_URL}/redefinir-senha?token=${token}`;

    try {
        await sendMail({
            to: user.email,
            subject: "Redefinição de senha — FutMatch",
            html: `
                <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px">
                    <h2 style="color:#22c55e;margin:0 0 16px">FutMatch</h2>
                    <p style="font-size:15px;color:#111827">Olá, <strong>${user.name}</strong>!</p>
                    <p style="font-size:15px;color:#374151">
                        Recebemos uma solicitação para redefinir a senha da sua conta.
                        Clique no botão abaixo para criar uma nova senha:
                    </p>
                    <div style="text-align:center;margin:32px 0">
                        <a href="${resetUrl}"
                           style="background:#22c55e;color:#fff;padding:13px 28px;border-radius:10px;
                                  text-decoration:none;font-weight:600;font-size:15px">
                            Redefinir senha
                        </a>
                    </div>
                    <p style="font-size:13px;color:#6b7280">
                        Este link expira em <strong>1 hora</strong>.<br>
                        Se você não solicitou isso, ignore este e-mail — sua senha não será alterada.
                    </p>
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
                    <p style="font-size:12px;color:#9ca3af;text-align:center">
                        FutMatch · Jogue hoje, sem combinar.
                    </p>
                </div>
            `,
        });
    } catch (err) {
        // Token já foi salvo — usuário pode tentar novamente. Não expõe a falha de SMTP.
        console.error("[mailer] Falha ao enviar e-mail de recuperação de senha:", err.message);
    }
}

export async function resetPassword({ token, newPassword }) {
    const user = await prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiry: { gt: new Date() },
        },
    });

    if (!user) {
        throw new AppError("Token inválido ou expirado", HTTP.BAD_REQUEST, "INVALID_RESET_TOKEN");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: { password: passwordHash, resetToken: null, resetTokenExpiry: null },
    });
}

export async function getMe(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            pixKey: true,
            role: true,
            badge: true,
            createdAt: true,
            _count: {
                select: {
                    peladasCreated: true,
                    participations: true,
                    reviewsReceived: true,
                },
            },
        },
    });

    if (!user) {
        throw new AppError("Usuário não encontrado", HTTP.NOT_FOUND, "USER_NOT_FOUND");
    }

    return user;
}
