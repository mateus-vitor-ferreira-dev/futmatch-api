import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import prisma from "../../config/prisma.js";
import { signToken } from "../../config/jwt.js";
import { env } from "../../config/env.js";
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
    if (!idToken) {
        throw new AppError("Token Google ausente", HTTP.BAD_REQUEST, "MISSING_GOOGLE_TOKEN");
    }

    let sub, name, email, picture;

    if (idToken.startsWith("ya29.")) {
        // Access token — troca pelo userinfo do Google
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) throw new AppError("Token Google inválido", HTTP.UNAUTHORIZED, "INVALID_GOOGLE_TOKEN");
        ({ sub, name, email, picture } = await res.json());
    } else {
        // ID token (JWT)
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: env.GOOGLE_CLIENT_ID,
        });
        ({ sub, name, email, picture } = ticket.getPayload());
    }

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
