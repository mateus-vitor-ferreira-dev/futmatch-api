import * as yup from "yup";

const PELADA_STATUSES = ["WAITING", "FULL", "FINISHED", "CANCELLED"];
const COURT_TYPES = ["SOCIETY", "CAMPO", "FUTSAL", "AREIA", "VOLEI", "VOLEI_AREIA", "HANDBALL", "PETECA", "BEACH_TENNIS", "BASQUETE", "TENIS"];

export const createEventSchema = yup.object({
    date: yup
        .date()
        .min(new Date(), "A data deve ser no futuro")
        .typeError("Data inválida")
        .required("Data é obrigatória"),
    maxPlayers: yup
        .number()
        .integer("Número de jogadores deve ser inteiro")
        .min(2, "Mínimo de 2 jogadores")
        .required("Número máximo de jogadores é obrigatório"),
    totalValue: yup
        .number()
        .positive("Valor total deve ser positivo")
        .required("Valor total é obrigatório"),
    pixKey: yup.string().trim().required("Chave Pix é obrigatória"),
});

export const updateEventSchema = yup.object({
    date: yup.date().min(new Date(), "A data deve ser no futuro").typeError("Data inválida"),
    maxPlayers: yup
        .number()
        .integer("Número de jogadores deve ser inteiro")
        .min(2, "Mínimo de 2 jogadores"),
    totalValue: yup.number().positive("Valor total deve ser positivo"),
    pixKey: yup.string().trim(),
});

export const updateEventStatusSchema = yup.object({
    status: yup
        .string()
        .oneOf(["FINISHED", "CANCELLED"], "Status inválido. Use FINISHED ou CANCELLED")
        .required("Status é obrigatório"),
});

export const listEventsQuerySchema = yup.object({
    status: yup.string().oneOf(PELADA_STATUSES, "Status inválido"),
    from: yup.date().typeError("Data inicial inválida"),
    to: yup.date().typeError("Data final inválida"),
});

export const searchEventsQuerySchema = yup.object({
    status: yup.string().oneOf(PELADA_STATUSES, "Status inválido"),
    from: yup.date().typeError("Data inicial inválida"),
    to: yup.date().typeError("Data final inválida"),
    city: yup.string().trim(),
    neighborhood: yup.string().trim(),
    courtType: yup.string().oneOf(COURT_TYPES, "Modalidade inválida"),
});
