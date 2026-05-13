import * as yup from "yup";

export const updateProfileSchema = yup.object({
    name: yup.string().trim().min(2, "Nome deve ter ao menos 2 caracteres"),
    avatarUrl: yup.string().url("avatarUrl deve ser uma URL válida").nullable(),
    pixKey: yup.string().trim().nullable(),
    currentPassword: yup.string().when("newPassword", {
        is: (val) => !!val,
        then: (s) => s.required("Senha atual é obrigatória para alterar a senha"),
        otherwise: (s) => s.optional(),
    }),
    newPassword: yup.string().min(6, "Nova senha deve ter ao menos 6 caracteres"),
    confirmNewPassword: yup.string().when("newPassword", {
        is: (val) => !!val,
        then: (s) =>
            s
                .required("Confirmação de senha é obrigatória")
                .oneOf([yup.ref("newPassword")], "A nova senha e a confirmação não coincidem"),
        otherwise: (s) => s.optional(),
    }),
});
