import * as yup from "yup";

export const createPlaceSchema = yup.object({
    name: yup.string().trim().required("Nome é obrigatório"),
    street: yup.string().trim().required("Rua é obrigatória"),
    number: yup.string().trim().required("Número é obrigatório"),
    complement: yup.string().trim().nullable(),
    neighborhood: yup.string().trim().required("Bairro é obrigatório"),
    city: yup.string().trim().required("Cidade é obrigatória"),
    state: yup.string().trim().length(2, "Use a sigla do estado (ex: SP)").uppercase().required("Estado é obrigatório"),
    zipCode: yup.string().trim().required("CEP é obrigatório"),
    country: yup.string().trim().default("BR"),
});

export const updatePlaceSchema = yup.object({
    name: yup.string().trim(),
    street: yup.string().trim(),
    number: yup.string().trim(),
    complement: yup.string().trim().nullable(),
    neighborhood: yup.string().trim(),
    city: yup.string().trim(),
    state: yup.string().trim().length(2, "Use a sigla do estado (ex: SP)").uppercase(),
    zipCode: yup.string().trim(),
    latitude: yup.number(),
    longitude: yup.number(),
});

export const updateStatusSchema = yup.object({
    status: yup.string().oneOf(["OPEN", "CLOSED"], "Status inválido").required("Status é obrigatório"),
});

export const assignOwnerSchema = yup.object({
    ownerId: yup.string().required("ID do proprietário é obrigatório"),
});
