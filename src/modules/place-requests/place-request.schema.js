import * as yup from "yup";

export const createPlaceRequestSchema = yup.object({
    name:         yup.string().min(2).required("Nome obrigatório"),
    street:       yup.string().required("Rua obrigatória"),
    number:       yup.string().required("Número obrigatório"),
    complement:   yup.string().optional(),
    neighborhood: yup.string().required("Bairro obrigatório"),
    city:         yup.string().required("Cidade obrigatória"),
    state:        yup.string().length(2, "Use a sigla do estado (ex: SP)").required("Estado obrigatório"),
    zipCode:      yup.string().required("CEP obrigatório"),
    country:      yup.string().default("BR"),
    latitude:     yup.number().optional().nullable(),
    longitude:    yup.number().optional().nullable(),
});

export const rejectPlaceRequestSchema = yup.object({
    adminNote: yup.string().optional(),
});

export const listRequestsQuerySchema = yup.object({
    status: yup.string().oneOf(["PENDING", "APPROVED", "REJECTED"]).optional(),
});
