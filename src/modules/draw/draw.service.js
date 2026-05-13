import { AppError } from "../../utils/AppError.js";
import HTTP from "../../constants/httpStatus.js";
import prisma from "../../config/prisma.js";

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export async function drawTeams(peladaId, teamCount) {
    const pelada = await prisma.pelada.findUnique({
        where: { id: peladaId },
        select: {
            id: true,
            status: true,
            participations: {
                include: { user: { select: { id: true, name: true, avatarUrl: true, badge: true } } },
                orderBy: { joinedAt: "asc" },
            },
        },
    });

    if (!pelada) {
        throw new AppError("Pelada não encontrada", HTTP.NOT_FOUND, "EVENT_NOT_FOUND");
    }

    if (pelada.status === "FINISHED" || pelada.status === "CANCELLED") {
        throw new AppError(
            "Não é possível sortear times em uma pelada finalizada ou cancelada",
            HTTP.CONFLICT,
            "PELADA_NOT_ACTIVE",
        );
    }

    const players = pelada.participations.map((p) => p.user);

    if (players.length < teamCount) {
        throw new AppError(
            `Participantes insuficientes: ${players.length} jogador(es) para ${teamCount} time(s)`,
            HTTP.CONFLICT,
            "INSUFFICIENT_PLAYERS",
        );
    }

    const shuffled = shuffle(players);

    const teams = Array.from({ length: teamCount }, (_, i) => ({
        name: `Time ${i + 1}`,
        players: [],
    }));

    shuffled.forEach((player, idx) => {
        teams[idx % teamCount].players.push(player);
    });

    return {
        peladaId,
        teamCount,
        totalPlayers: players.length,
        teams,
    };
}
