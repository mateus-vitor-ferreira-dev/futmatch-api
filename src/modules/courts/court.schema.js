import * as yup from "yup";

const COURT_TYPES = [
    "SOCIETY",
    "CAMPO",
    "FUTSAL",
    "AREIA",
    "VOLEI",
    "VOLEI_AREIA",
    "HANDBALL",
    "PETECA",
    "BEACH_TENNIS",
    "BASQUETE",
    "TENIS",
];
const COURT_STATUSES = ["OPEN", "CLOSED"];

export const createCourtSchema = yup.object({
    name: yup.string().trim().required("Nome é obrigatório"),
    type: yup.string().oneOf(COURT_TYPES, "Modalidade inválida").required("Modalidade é obrigatória"),
    pricePerHour: yup.number().positive("Preço deve ser positivo").nullable(),
});

export const updateCourtSchema = yup.object({
    name: yup.string().trim(),
    type: yup.string().oneOf(COURT_TYPES, "Modalidade inválida"),
    pricePerHour: yup.number().positive("Preço deve ser positivo").nullable(),
});

export const updateCourtStatusSchema = yup.object({
    status: yup.string().oneOf(COURT_STATUSES, "Status inválido").required("Status é obrigatório"),
});

export const listCourtsQuerySchema = yup.object({
    type: yup.string().oneOf(COURT_TYPES, "Modalidade inválida"),
    status: yup.string().oneOf(COURT_STATUSES, "Status inválido"),
    minPrice: yup.number().positive("Preço mínimo deve ser positivo"),
    maxPrice: yup.number().positive("Preço máximo deve ser positivo"),
    availableAt: yup.date().typeError("Data/hora inválida"),
});

export const searchCourtsQuerySchema = yup.object({
    type: yup.string().oneOf(COURT_TYPES, "Modalidade inválida"),
    status: yup.string().oneOf(COURT_STATUSES, "Status inválido"),
    minPrice: yup.number().positive("Preço mínimo deve ser positivo"),
    maxPrice: yup.number().positive("Preço máximo deve ser positivo"),
    availableAt: yup.date().typeError("Data/hora inválida"),
    city: yup.string().trim(),
    neighborhood: yup.string().trim(),
});
