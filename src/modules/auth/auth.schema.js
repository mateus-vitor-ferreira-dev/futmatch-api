import * as yup from "yup";

export const registerSchema = yup.object({
    name: yup.string().min(2, "Nome deve ter no mínimo 2 caracteres").required("Nome é obrigatório"),
    email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
    password: yup.string().min(6, "Senha deve ter no mínimo 6 caracteres").required("Senha é obrigatória"),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "As senhas não coincidem")
        .required("Confirmação de senha é obrigatória"),
});

export const loginSchema = yup.object({
    email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
    password: yup.string().required("Senha é obrigatória"),
});

export const googleSchema = yup.object({
    idToken: yup.string().required("Token do Google é obrigatório"),
});

export const forgotPasswordSchema = yup.object({
    email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
});

export const resetPasswordSchema = yup.object({
    token:           yup.string().required("Token é obrigatório"),
    newPassword:     yup.string().min(6, "Mínimo 6 caracteres").required("Obrigatório"),
    confirmPassword: yup.string()
        .oneOf([yup.ref("newPassword")], "As senhas não coincidem")
        .required("Obrigatório"),
});
