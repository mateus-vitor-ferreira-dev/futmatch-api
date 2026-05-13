import * as yup from "yup";

const REVIEW_TAGS = ["CRAQUE_DA_PELADA", "JOGA_FACIL", "PASSA_DE_ANO", "PONTUAL", "FAIR_PLAY", "BOA_COMUNICACAO"];

export const createReviewSchema = yup.object({
    reviewedId: yup.string().required("ID do jogador avaliado é obrigatório"),
    stars: yup
        .number()
        .integer()
        .min(1, "Mínimo 1 estrela")
        .max(5, "Máximo 5 estrelas")
        .required("Estrelas são obrigatórias"),
    tag: yup.string().oneOf(REVIEW_TAGS, "Tag inválida").required("Tag é obrigatória"),
    comment: yup.string().trim().max(300, "Comentário deve ter no máximo 300 caracteres").nullable(),
});
