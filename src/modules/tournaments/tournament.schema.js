import * as yup from "yup";

const TOURNAMENT_FORMATS = ["LEAGUE", "KNOCKOUT", "GROUPS_AND_KNOCKOUT", "DOUBLE_ELIMINATION", "SWISS"];
const PARTICIPANT_TYPES = ["TEAM", "INDIVIDUAL"];
const REGISTRATION_MODES = ["OPEN", "APPROVAL_REQUIRED"];
const ORGANIZER_TYPES = ["PLACE", "USER", "COMPANY", "OTHER"];
const TOURNAMENT_STATUSES = ["DRAFT", "OPEN", "REGISTRATION_CLOSED", "IN_PROGRESS", "FINISHED", "CANCELLED"];
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
const COMPETITION_LEVELS = ["BEGINNER", "INTERMEDIATE", "AMATEUR", "ADVANCED", "PROFESSIONAL"];

export const createTournamentSchema = yup.object({
    name: yup.string().trim().required("Nome é obrigatório"),
    description: yup.string().trim().nullable(),
    placeId: yup.string().required("Estabelecimento é obrigatório"),
    organizerType: yup.string().oneOf(ORGANIZER_TYPES, "Tipo de organizador inválido").default("PLACE"),
    organizerName: yup.string().trim().nullable(),
    organizerUserId: yup.string().nullable(),
    sportType: yup.string().oneOf(COURT_TYPES, "Modalidade inválida").required("Modalidade é obrigatória"),
    format: yup.string().oneOf(TOURNAMENT_FORMATS, "Formato inválido").required("Formato é obrigatório"),
    participantType: yup.string().oneOf(PARTICIPANT_TYPES, "Tipo de participante inválido").default("TEAM"),
    registrationMode: yup.string().oneOf(REGISTRATION_MODES, "Modo de inscrição inválido").default("OPEN"),
    registrationStartDate: yup.date().nullable(),
    registrationEndDate: yup
        .date()
        .nullable()
        .when("registrationStartDate", ([start], schema) =>
            start ? schema.min(start, "Data de encerramento deve ser após a abertura") : schema,
        ),
    startDate: yup.date().nullable(),
    endDate: yup
        .date()
        .nullable()
        .when("startDate", ([start], schema) =>
            start ? schema.min(start, "Data de término deve ser após a de início") : schema,
        ),
    maxParticipants: yup.number().integer().min(2, "Mínimo de 2 participantes").nullable(),
    registrationFee: yup.number().min(0).nullable(),
    paymentInstructions: yup.string().trim().nullable(),
    pixKey: yup.string().trim().nullable(),
    rules: yup.string().trim().nullable(),
});

export const updateTournamentSchema = yup.object({
    name: yup.string().trim(),
    description: yup.string().trim().nullable(),
    organizerType: yup.string().oneOf(ORGANIZER_TYPES, "Tipo de organizador inválido"),
    organizerName: yup.string().trim().nullable(),
    organizerUserId: yup.string().nullable(),
    sportType: yup.string().oneOf(COURT_TYPES, "Modalidade inválida"),
    format: yup.string().oneOf(TOURNAMENT_FORMATS, "Formato inválido"),
    participantType: yup.string().oneOf(PARTICIPANT_TYPES, "Tipo de participante inválido"),
    registrationMode: yup.string().oneOf(REGISTRATION_MODES, "Modo de inscrição inválido"),
    registrationStartDate: yup.date().nullable(),
    registrationEndDate: yup.date().nullable(),
    startDate: yup.date().nullable(),
    endDate: yup.date().nullable(),
    maxParticipants: yup.number().integer().min(2).nullable(),
    registrationFee: yup.number().min(0).nullable(),
    paymentInstructions: yup.string().trim().nullable(),
    pixKey: yup.string().trim().nullable(),
    rules: yup.string().trim().nullable(),
});

export const updateTournamentStatusSchema = yup.object({
    status: yup.string().oneOf(TOURNAMENT_STATUSES, "Status inválido").required("Status é obrigatório"),
});

export const listTournamentsQuerySchema = yup.object({
    placeId: yup.string(),
    sportType: yup.string().oneOf(COURT_TYPES, "Modalidade inválida"),
    status: yup.string().oneOf(TOURNAMENT_STATUSES, "Status inválido"),
    format: yup.string().oneOf(TOURNAMENT_FORMATS, "Formato inválido"),
});

export const createDivisionSchema = yup.object({
    name: yup.string().trim().required("Nome da divisão é obrigatório"),
    description: yup.string().trim().nullable(),
    genderRestriction: yup.string().trim().nullable(),
    ageRestriction: yup.string().trim().nullable(),
    level: yup.string().oneOf(COMPETITION_LEVELS, "Nível inválido").default("AMATEUR"),
    minPlayersPerTeam: yup.number().integer().min(1).default(2),
    maxPlayersPerTeam: yup
        .number()
        .integer()
        .min(1)
        .default(2)
        .when("minPlayersPerTeam", ([min], schema) =>
            min ? schema.min(min, "Máximo deve ser maior ou igual ao mínimo") : schema,
        ),
    maxParticipants: yup.number().integer().min(2).nullable(),
});

export const updateDivisionSchema = yup.object({
    name: yup.string().trim(),
    description: yup.string().trim().nullable(),
    genderRestriction: yup.string().trim().nullable(),
    ageRestriction: yup.string().trim().nullable(),
    level: yup.string().oneOf(COMPETITION_LEVELS, "Nível inválido"),
    minPlayersPerTeam: yup.number().integer().min(1),
    maxPlayersPerTeam: yup.number().integer().min(1),
    maxParticipants: yup.number().integer().min(2).nullable(),
});
