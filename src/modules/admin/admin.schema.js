import * as yup from "yup";

export const updateUserRoleSchema = yup.object({
    role: yup.string().oneOf(["PLAYER", "OWNER", "ADMIN"], "Role inválido").required("Role é obrigatório"),
});

export const listUsersQuerySchema = yup.object({
    role: yup.string().oneOf(["PLAYER", "OWNER", "ADMIN"], "Role inválido"),
});
