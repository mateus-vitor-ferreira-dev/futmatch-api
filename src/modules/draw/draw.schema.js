import * as yup from "yup";

export const drawSchema = yup.object({
    teamCount: yup
        .number()
        .integer()
        .min(2, "Mínimo de 2 times")
        .max(10, "Máximo de 10 times")
        .required("Número de times é obrigatório"),
});
