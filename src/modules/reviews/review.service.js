import { AppError } from "../../utils/AppError.js";
import HTTP from "../../constants/httpStatus.js";
import { REVIEW_MESSAGES } from "../../constants/messages/review.messages.js";
import { recalculateBadge } from "../../utils/badge.js";
import * as repo from "./review.repository.js";

export async function createReview(peladaId, reviewerId, data) {
    const { reviewedId, stars, tag, comment } = data;

    if (reviewerId === reviewedId) {
        throw new AppError(REVIEW_MESSAGES.SELF_REVIEW, HTTP.BAD_REQUEST, "SELF_REVIEW");
    }

    const pelada = await repo.findPeladaById(peladaId);
    if (!pelada) {
        throw new AppError(REVIEW_MESSAGES.NOT_FOUND, HTTP.NOT_FOUND, "PELADA_NOT_FOUND");
    }

    if (pelada.status !== "FINISHED") {
        throw new AppError(REVIEW_MESSAGES.NOT_FINISHED, HTTP.CONFLICT, "PELADA_NOT_FINISHED");
    }

    const [reviewerParticipation, reviewedParticipation] = await Promise.all([
        repo.findParticipation(peladaId, reviewerId),
        repo.findParticipation(peladaId, reviewedId),
    ]);

    if (!reviewerParticipation) {
        throw new AppError(REVIEW_MESSAGES.NOT_PARTICIPANT, HTTP.FORBIDDEN, "NOT_PARTICIPANT");
    }

    if (!reviewedParticipation) {
        throw new AppError(REVIEW_MESSAGES.REVIEWED_NOT_PARTICIPANT, HTTP.BAD_REQUEST, "REVIEWED_NOT_PARTICIPANT");
    }

    const existing = await repo.findExistingReview(peladaId, reviewerId, reviewedId);
    if (existing) {
        throw new AppError(REVIEW_MESSAGES.ALREADY_REVIEWED, HTTP.CONFLICT, "ALREADY_REVIEWED");
    }

    const review = await repo.create({ peladaId, reviewerId, reviewedId, stars, tag, comment: comment ?? null });
    // dispara em background — não bloqueia a resposta
    recalculateBadge(reviewedId).catch(() => {});
    return review;
}

export async function getProgress(peladaId, reviewerId) {
    const pelada = await repo.findPeladaById(peladaId);
    if (!pelada) {
        throw new AppError(REVIEW_MESSAGES.NOT_FOUND, HTTP.NOT_FOUND, "PELADA_NOT_FOUND");
    }

    const participation = await repo.findParticipation(peladaId, reviewerId);
    if (!participation) {
        throw new AppError(REVIEW_MESSAGES.NOT_PARTICIPANT, HTTP.FORBIDDEN, "NOT_PARTICIPANT");
    }

    const progress = await repo.getProgress(peladaId, reviewerId);
    return {
        ...progress,
        pending: progress.total - progress.reviewed,
        completed: progress.reviewed === progress.total,
    };
}

export async function getByPelada(peladaId) {
    const pelada = await repo.findPeladaById(peladaId);
    if (!pelada) {
        throw new AppError(REVIEW_MESSAGES.NOT_FOUND, HTTP.NOT_FOUND, "PELADA_NOT_FOUND");
    }
    return repo.findByPelada(peladaId);
}

export async function getByUser(userId) {
    const [reviews, summary] = await Promise.all([repo.findByReviewed(userId), repo.getSummary(userId)]);
    return { summary, reviews };
}
