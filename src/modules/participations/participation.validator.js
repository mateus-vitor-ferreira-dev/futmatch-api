import * as yup from "yup";

const PELADA_STATUSES = ["WAITING", "FULL", "FINISHED", "CANCELLED"];

export const leavePeladaSchema = yup.object({
    reason: yup.string().trim().max(200, "Motivo deve ter no máximo 200 caracteres"),
});

export const confirmAttendanceSchema = yup.object({
    attended: yup.boolean().required("Presença é obrigatória"),
});

export const myPeladasQuerySchema = yup.object({
    status: yup.string().oneOf(PELADA_STATUSES, "Status inválido"),
});
