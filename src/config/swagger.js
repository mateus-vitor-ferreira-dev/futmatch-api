import swaggerJsdoc from "swagger-jsdoc";

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

const TOURNAMENT_FORMATS = ["LEAGUE", "KNOCKOUT", "GROUPS_AND_KNOCKOUT", "DOUBLE_ELIMINATION", "SWISS"];
const TOURNAMENT_STATUSES = ["DRAFT", "OPEN", "REGISTRATION_CLOSED", "IN_PROGRESS", "FINISHED", "CANCELLED"];
const COMPETITION_LEVELS = ["BEGINNER", "INTERMEDIATE", "AMATEUR", "ADVANCED", "PROFESSIONAL"];

const definition = {
    openapi: "3.0.0",
    info: {
        title: "FutMatch API",
        version: "1.0.0",
        description: "API do FutMatch — plataforma de agendamento de peladas e quadras esportivas.",
    },
    servers: [{ url: "http://localhost:3000", description: "Local" }],
    components: {
        securitySchemes: {
            PlayerToken: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description: "Token de um usuário com role **PLAYER**",
            },
            OwnerToken: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description: "Token de um usuário com role **OWNER**",
            },
            AdminToken: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description: "Token de um usuário com role **ADMIN**",
            },
        },
        schemas: {
            // ── Auth ────────────────────────────────────────────────────────
            RegisterBody: {
                type: "object",
                required: ["name", "email", "password", "confirmPassword"],
                properties: {
                    name: { type: "string", example: "João Silva" },
                    email: { type: "string", format: "email", example: "joao@email.com" },
                    password: { type: "string", minLength: 6, example: "senha123" },
                    confirmPassword: { type: "string", example: "senha123" },
                },
            },
            LoginBody: {
                type: "object",
                required: ["email", "password"],
                properties: {
                    email: { type: "string", format: "email", example: "joao@email.com" },
                    password: { type: "string", example: "senha123" },
                },
            },
            GoogleAuthBody: {
                type: "object",
                required: ["idToken"],
                properties: {
                    idToken: { type: "string", example: "eyJhbGci..." },
                },
            },
            // ── Place ───────────────────────────────────────────────────────
            PlaceBody: {
                type: "object",
                required: ["name", "street", "number", "neighborhood", "city", "state", "zipCode"],
                properties: {
                    name: { type: "string", example: "Arena FutMatch" },
                    street: { type: "string", example: "Rua das Flores" },
                    number: { type: "string", example: "123" },
                    complement: { type: "string", example: "Bloco A" },
                    neighborhood: { type: "string", example: "Centro" },
                    city: { type: "string", example: "São Paulo" },
                    state: { type: "string", minLength: 2, maxLength: 2, example: "SP" },
                    zipCode: { type: "string", example: "01310-100" },
                    country: { type: "string", default: "BR" },
                },
            },
            UpdatePlaceBody: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    street: { type: "string" },
                    number: { type: "string" },
                    complement: { type: "string", nullable: true },
                    neighborhood: { type: "string" },
                    city: { type: "string" },
                    state: { type: "string", minLength: 2, maxLength: 2 },
                    zipCode: { type: "string" },
                    latitude: { type: "number" },
                    longitude: { type: "number" },
                },
            },
            PlaceStatusBody: {
                type: "object",
                required: ["status"],
                properties: {
                    status: { type: "string", enum: ["OPEN", "CLOSED"] },
                },
            },
            AssignOwnerBody: {
                type: "object",
                required: ["ownerId"],
                properties: {
                    ownerId: { type: "string", example: "uuid-do-owner" },
                },
            },
            // ── Court ───────────────────────────────────────────────────────
            CourtBody: {
                type: "object",
                required: ["name", "type"],
                properties: {
                    name: { type: "string", example: "Quadra 1" },
                    type: { type: "string", enum: COURT_TYPES },
                    pricePerHour: { type: "number", example: 120.0, nullable: true },
                },
            },
            UpdateCourtBody: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    type: { type: "string", enum: COURT_TYPES },
                    pricePerHour: { type: "number", nullable: true },
                },
            },
            CourtStatusBody: {
                type: "object",
                required: ["status"],
                properties: {
                    status: { type: "string", enum: ["OPEN", "CLOSED"] },
                },
            },
            // ── Event ───────────────────────────────────────────────────────
            EventBody: {
                type: "object",
                required: ["date", "maxPlayers", "totalValue", "pixKey"],
                properties: {
                    date: { type: "string", format: "date-time", example: "2026-06-01T18:00:00.000Z" },
                    maxPlayers: { type: "integer", minimum: 2, example: 14 },
                    totalValue: { type: "number", example: 200.0 },
                    pixKey: { type: "string", example: "joao@email.com" },
                },
            },
            UpdateEventBody: {
                type: "object",
                properties: {
                    date: { type: "string", format: "date-time" },
                    maxPlayers: { type: "integer", minimum: 2 },
                    totalValue: { type: "number" },
                    pixKey: { type: "string" },
                },
            },
            EventStatusBody: {
                type: "object",
                required: ["status"],
                properties: {
                    status: { type: "string", enum: ["FINISHED", "CANCELLED"] },
                },
            },
            // ── Participation ───────────────────────────────────────────────
            LeaveBody: {
                type: "object",
                properties: {
                    reason: { type: "string", maxLength: 200, example: "Compromisso de última hora" },
                },
            },
            AttendanceBody: {
                type: "object",
                required: ["attended"],
                properties: {
                    attended: { type: "boolean", example: true },
                },
            },
            // ── Profile ────────────────────────────────────────────────────
            UpdateProfileBody: {
                type: "object",
                properties: {
                    name: { type: "string", minLength: 2, example: "João Silva" },
                    avatarUrl: { type: "string", format: "uri", nullable: true, example: "https://example.com/foto.jpg" },
                    pixKey: { type: "string", nullable: true, example: "joao@pix.com" },
                    currentPassword: { type: "string", example: "minhasenha123" },
                    newPassword: { type: "string", minLength: 6, example: "novasenha456" },
                    confirmNewPassword: { type: "string", example: "novasenha456" },
                },
            },
            // ── Review ─────────────────────────────────────────────────────
            ReviewBody: {
                type: "object",
                required: ["reviewedId", "stars", "tag"],
                properties: {
                    reviewedId: { type: "string", example: "cuid-do-jogador" },
                    stars: { type: "integer", minimum: 1, maximum: 5, example: 5 },
                    tag: {
                        type: "string",
                        enum: ["CRAQUE_DA_PELADA", "JOGA_FACIL", "PASSA_DE_ANO", "PONTUAL", "FAIR_PLAY", "BOA_COMUNICACAO"],
                        example: "FAIR_PLAY",
                    },
                    comment: { type: "string", maxLength: 300, nullable: true, example: "Ótimo de jogar junto!" },
                },
            },
            // ── Tournament ──────────────────────────────────────────────────
            TournamentBody: {
                type: "object",
                required: ["name", "placeId", "sportType", "format"],
                properties: {
                    name: { type: "string", example: "Copa FutMatch 2026" },
                    description: { type: "string", nullable: true, example: "Campeonato anual de futevôlei" },
                    placeId: { type: "string", example: "cuid-do-place" },
                    organizerType: {
                        type: "string",
                        enum: ["PLACE", "USER", "COMPANY", "OTHER"],
                        default: "PLACE",
                    },
                    organizerName: { type: "string", nullable: true, example: "Liga Esportiva Sul Mineira" },
                    organizerUserId: { type: "string", nullable: true, example: "cuid-do-usuario" },
                    sportType: { type: "string", enum: COURT_TYPES, example: "AREIA" },
                    format: { type: "string", enum: TOURNAMENT_FORMATS, example: "GROUPS_AND_KNOCKOUT" },
                    participantType: { type: "string", enum: ["TEAM", "INDIVIDUAL"], default: "TEAM" },
                    registrationMode: {
                        type: "string",
                        enum: ["OPEN", "APPROVAL_REQUIRED"],
                        default: "OPEN",
                    },
                    registrationStartDate: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        example: "2026-06-01T08:00:00.000Z",
                    },
                    registrationEndDate: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        example: "2026-06-20T23:59:00.000Z",
                    },
                    startDate: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        example: "2026-06-28T08:00:00.000Z",
                    },
                    endDate: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        example: "2026-06-29T18:00:00.000Z",
                    },
                    maxParticipants: { type: "integer", minimum: 2, nullable: true, example: 16 },
                    registrationFee: { type: "number", minimum: 0, nullable: true, example: 150.0 },
                    paymentInstructions: { type: "string", nullable: true, example: "Pagamento via PIX" },
                    pixKey: { type: "string", nullable: true, example: "organizador@email.com" },
                    rules: { type: "string", nullable: true, example: "Segue regulamento CBFS." },
                },
            },
            UpdateTournamentBody: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    description: { type: "string", nullable: true },
                    organizerType: { type: "string", enum: ["PLACE", "USER", "COMPANY", "OTHER"] },
                    organizerName: { type: "string", nullable: true },
                    organizerUserId: { type: "string", nullable: true },
                    sportType: { type: "string", enum: COURT_TYPES },
                    format: { type: "string", enum: TOURNAMENT_FORMATS },
                    participantType: { type: "string", enum: ["TEAM", "INDIVIDUAL"] },
                    registrationMode: { type: "string", enum: ["OPEN", "APPROVAL_REQUIRED"] },
                    registrationStartDate: { type: "string", format: "date-time", nullable: true },
                    registrationEndDate: { type: "string", format: "date-time", nullable: true },
                    startDate: { type: "string", format: "date-time", nullable: true },
                    endDate: { type: "string", format: "date-time", nullable: true },
                    maxParticipants: { type: "integer", minimum: 2, nullable: true },
                    registrationFee: { type: "number", minimum: 0, nullable: true },
                    paymentInstructions: { type: "string", nullable: true },
                    pixKey: { type: "string", nullable: true },
                    rules: { type: "string", nullable: true },
                },
            },
            TournamentStatusBody: {
                type: "object",
                required: ["status"],
                properties: {
                    status: {
                        type: "string",
                        enum: TOURNAMENT_STATUSES,
                        example: "OPEN",
                        description:
                            "Fluxo válido: DRAFT→OPEN→REGISTRATION_CLOSED→IN_PROGRESS→FINISHED. CANCELLED aceito de qualquer estado ativo.",
                    },
                },
            },
            DivisionBody: {
                type: "object",
                required: ["name"],
                properties: {
                    name: { type: "string", example: "Masculino Iniciante" },
                    description: { type: "string", nullable: true },
                    genderRestriction: {
                        type: "string",
                        nullable: true,
                        example: "masculino",
                        description: "Ex: masculino, feminino, misto, livre",
                    },
                    ageRestriction: {
                        type: "string",
                        nullable: true,
                        example: "sub-18",
                        description: "Ex: sub-18, adulto, master",
                    },
                    level: { type: "string", enum: COMPETITION_LEVELS, default: "AMATEUR" },
                    minPlayersPerTeam: { type: "integer", minimum: 1, default: 2, example: 2 },
                    maxPlayersPerTeam: { type: "integer", minimum: 1, default: 2, example: 2 },
                    maxParticipants: { type: "integer", minimum: 2, nullable: true, example: 8 },
                },
            },
            UpdateDivisionBody: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    description: { type: "string", nullable: true },
                    genderRestriction: { type: "string", nullable: true },
                    ageRestriction: { type: "string", nullable: true },
                    level: { type: "string", enum: COMPETITION_LEVELS },
                    minPlayersPerTeam: { type: "integer", minimum: 1 },
                    maxPlayersPerTeam: { type: "integer", minimum: 1 },
                    maxParticipants: { type: "integer", minimum: 2, nullable: true },
                },
            },
            // ── Admin ───────────────────────────────────────────────────────
            UpdateRoleBody: {
                type: "object",
                required: ["role"],
                properties: {
                    role: { type: "string", enum: ["PLAYER", "OWNER", "ADMIN"] },
                },
            },
        },
    },
    paths: {
        // ── Health ──────────────────────────────────────────────────────────
        "/health": {
            get: {
                tags: ["Health"],
                summary: "Verifica se a API está online",
                responses: {
                    200: { description: "API funcionando" },
                },
            },
        },

        // ── Auth ────────────────────────────────────────────────────────────
        "/auth/register": {
            post: {
                tags: ["Auth"],
                summary: "Cria uma nova conta",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterBody" } } },
                },
                responses: {
                    201: { description: "Conta criada com sucesso" },
                    400: { description: "Dados inválidos" },
                    409: { description: "E-mail já cadastrado" },
                },
            },
        },
        "/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "Faz login com e-mail e senha",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/LoginBody" } } },
                },
                responses: {
                    200: { description: "Login realizado, retorna token JWT" },
                    401: { description: "Credenciais inválidas" },
                },
            },
        },
        "/auth/google": {
            post: {
                tags: ["Auth"],
                summary: "Login/cadastro via Google OAuth",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/GoogleAuthBody" } } },
                },
                responses: {
                    200: { description: "Autenticado com sucesso" },
                    401: { description: "Token do Google inválido" },
                },
            },
        },
        "/auth/me": {
            get: {
                tags: ["Auth"],
                summary: "Retorna dados do usuário autenticado",
                security: [{ PlayerToken: [] }, { OwnerToken: [] }, { AdminToken: [] }],
                responses: {
                    200: { description: "Dados do usuário" },
                    401: { description: "Não autenticado" },
                },
            },
        },

        // ── Places ──────────────────────────────────────────────────────────
        "/places": {
            get: {
                tags: ["Places"],
                summary: "Lista todos os lugares",
                responses: { 200: { description: "Lista de lugares" } },
            },
            post: {
                tags: ["Places"],
                summary: "Cria um lugar (admin)",
                security: [{ AdminToken: [] }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/PlaceBody" } } },
                },
                responses: {
                    201: { description: "Lugar criado" },
                    403: { description: "Sem permissão" },
                },
            },
        },
        "/places/{id}": {
            get: {
                tags: ["Places"],
                summary: "Busca um lugar por ID",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                responses: {
                    200: { description: "Lugar encontrado" },
                    404: { description: "Não encontrado" },
                },
            },
            patch: {
                tags: ["Places"],
                summary: "Atualiza dados de um lugar (owner/admin)",
                security: [{ OwnerToken: [] }, { AdminToken: [] }],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/UpdatePlaceBody" } } },
                },
                responses: {
                    200: { description: "Lugar atualizado" },
                    403: { description: "Sem permissão" },
                    404: { description: "Não encontrado" },
                },
            },
        },
        "/places/{id}/status": {
            patch: {
                tags: ["Places"],
                summary: "Atualiza status do lugar (owner/admin)",
                security: [{ OwnerToken: [] }, { AdminToken: [] }],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/PlaceStatusBody" } } },
                },
                responses: {
                    200: { description: "Status atualizado" },
                    403: { description: "Sem permissão" },
                },
            },
        },
        "/places/{id}/owner": {
            patch: {
                tags: ["Places"],
                summary: "Atribui um owner ao lugar (admin)",
                security: [{ AdminToken: [] }],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/AssignOwnerBody" } } },
                },
                responses: {
                    200: { description: "Owner atribuído" },
                    403: { description: "Sem permissão" },
                },
            },
        },

        // ── Courts (nested) ─────────────────────────────────────────────────
        "/places/{placeId}/courts": {
            get: {
                tags: ["Courts"],
                summary: "Lista quadras de um lugar",
                parameters: [
                    { name: "placeId", in: "path", required: true, schema: { type: "string" } },
                    { name: "type", in: "query", schema: { type: "string", enum: COURT_TYPES } },
                    { name: "status", in: "query", schema: { type: "string", enum: ["OPEN", "CLOSED"] } },
                    { name: "minPrice", in: "query", schema: { type: "number" } },
                    { name: "maxPrice", in: "query", schema: { type: "number" } },
                    { name: "availableAt", in: "query", schema: { type: "string", format: "date-time" } },
                ],
                responses: { 200: { description: "Lista de quadras" } },
            },
            post: {
                tags: ["Courts"],
                summary: "Cria uma quadra no lugar (owner/admin)",
                security: [{ OwnerToken: [] }, { AdminToken: [] }],
                parameters: [{ name: "placeId", in: "path", required: true, schema: { type: "string" } }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/CourtBody" } } },
                },
                responses: {
                    201: { description: "Quadra criada" },
                    403: { description: "Sem permissão" },
                },
            },
        },
        "/places/{placeId}/courts/{courtId}": {
            get: {
                tags: ["Courts"],
                summary: "Busca uma quadra por ID",
                parameters: [
                    { name: "placeId", in: "path", required: true, schema: { type: "string" } },
                    { name: "courtId", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: {
                    200: { description: "Quadra encontrada" },
                    404: { description: "Não encontrada" },
                },
            },
            patch: {
                tags: ["Courts"],
                summary: "Atualiza uma quadra (owner/admin)",
                security: [{ OwnerToken: [] }, { AdminToken: [] }],
                parameters: [
                    { name: "placeId", in: "path", required: true, schema: { type: "string" } },
                    { name: "courtId", in: "path", required: true, schema: { type: "string" } },
                ],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateCourtBody" } } },
                },
                responses: { 200: { description: "Quadra atualizada" }, 403: { description: "Sem permissão" } },
            },
            delete: {
                tags: ["Courts"],
                summary: "Remove uma quadra (owner/admin)",
                security: [{ OwnerToken: [] }, { AdminToken: [] }],
                parameters: [
                    { name: "placeId", in: "path", required: true, schema: { type: "string" } },
                    { name: "courtId", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: { 200: { description: "Quadra removida" }, 403: { description: "Sem permissão" } },
            },
        },
        "/places/{placeId}/courts/{courtId}/status": {
            patch: {
                tags: ["Courts"],
                summary: "Atualiza status de uma quadra (owner/admin)",
                security: [{ OwnerToken: [] }, { AdminToken: [] }],
                parameters: [
                    { name: "placeId", in: "path", required: true, schema: { type: "string" } },
                    { name: "courtId", in: "path", required: true, schema: { type: "string" } },
                ],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/CourtStatusBody" } } },
                },
                responses: { 200: { description: "Status atualizado" } },
            },
        },

        // ── Courts (global search) ──────────────────────────────────────────
        "/courts": {
            get: {
                tags: ["Courts"],
                summary: "Busca global de quadras com filtros de localização",
                parameters: [
                    { name: "type", in: "query", schema: { type: "string", enum: COURT_TYPES } },
                    { name: "status", in: "query", schema: { type: "string", enum: ["OPEN", "CLOSED"] } },
                    { name: "minPrice", in: "query", schema: { type: "number" } },
                    { name: "maxPrice", in: "query", schema: { type: "number" } },
                    { name: "availableAt", in: "query", schema: { type: "string", format: "date-time" } },
                    { name: "city", in: "query", schema: { type: "string" } },
                    { name: "neighborhood", in: "query", schema: { type: "string" } },
                ],
                responses: { 200: { description: "Lista de quadras" } },
            },
        },

        // ── Events (nested) ─────────────────────────────────────────────────
        "/courts/{courtId}/events": {
            get: {
                tags: ["Events"],
                summary: "Lista peladas de uma quadra",
                parameters: [
                    { name: "courtId", in: "path", required: true, schema: { type: "string" } },
                    {
                        name: "status",
                        in: "query",
                        schema: { type: "string", enum: ["WAITING", "FULL", "FINISHED", "CANCELLED"] },
                    },
                    { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
                    { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
                ],
                responses: { 200: { description: "Lista de peladas" } },
            },
            post: {
                tags: ["Events"],
                summary: "Cria uma pelada na quadra (autenticado)",
                security: [{ PlayerToken: [] }, { OwnerToken: [] }, { AdminToken: [] }],
                parameters: [{ name: "courtId", in: "path", required: true, schema: { type: "string" } }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/EventBody" } } },
                },
                responses: {
                    201: { description: "Pelada criada" },
                    401: { description: "Não autenticado" },
                },
            },
        },
        "/courts/{courtId}/events/{eventId}": {
            get: {
                tags: ["Events"],
                summary: "Busca uma pelada por ID",
                parameters: [
                    { name: "courtId", in: "path", required: true, schema: { type: "string" } },
                    { name: "eventId", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: { 200: { description: "Pelada encontrada" }, 404: { description: "Não encontrada" } },
            },
            patch: {
                tags: ["Events"],
                summary: "Atualiza uma pelada (organizador/admin)",
                security: [{ PlayerToken: [] }, { OwnerToken: [] }, { AdminToken: [] }],
                parameters: [
                    { name: "courtId", in: "path", required: true, schema: { type: "string" } },
                    { name: "eventId", in: "path", required: true, schema: { type: "string" } },
                ],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateEventBody" } } },
                },
                responses: { 200: { description: "Pelada atualizada" }, 403: { description: "Sem permissão" } },
            },
            delete: {
                tags: ["Events"],
                summary: "Remove uma pelada (organizador/admin)",
                security: [{ PlayerToken: [] }, { OwnerToken: [] }, { AdminToken: [] }],
                parameters: [
                    { name: "courtId", in: "path", required: true, schema: { type: "string" } },
                    { name: "eventId", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: { 200: { description: "Pelada removida" } },
            },
        },
        "/courts/{courtId}/events/{eventId}/status": {
            patch: {
                tags: ["Events"],
                summary: "Atualiza status de uma pelada (organizador/admin)",
                security: [{ PlayerToken: [] }, { OwnerToken: [] }, { AdminToken: [] }],
                parameters: [
                    { name: "courtId", in: "path", required: true, schema: { type: "string" } },
                    { name: "eventId", in: "path", required: true, schema: { type: "string" } },
                ],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/EventStatusBody" } } },
                },
                responses: { 200: { description: "Status atualizado" } },
            },
        },

        // ── Reviews ─────────────────────────────────────────────────────────
        "/courts/{courtId}/events/{eventId}/reviews": {
            post: {
                tags: ["Reviews"],
                summary: "Avalia um participante da pelada (só participantes, só FINISHED)",
                security: [{ PlayerToken: [] }, { OwnerToken: [] }, { AdminToken: [] }],
                parameters: [
                    { name: "courtId", in: "path", required: true, schema: { type: "string" } },
                    { name: "eventId", in: "path", required: true, schema: { type: "string" } },
                ],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/ReviewBody" } } },
                },
                responses: {
                    201: { description: "Avaliação criada" },
                    400: { description: "Auto-avaliação ou avaliado não participou" },
                    401: { description: "Não autenticado" },
                    403: { description: "Reviewer não participou da pelada" },
                    404: { description: "Pelada não encontrada" },
                    409: { description: "Pelada não finalizada ou avaliação duplicada" },
                    422: { description: "Dados inválidos (stars fora do range, tag inválida)" },
                },
            },
            get: {
                tags: ["Reviews"],
                summary: "Lista todas as avaliações de uma pelada (admin)",
                security: [{ AdminToken: [] }],
                parameters: [
                    { name: "courtId", in: "path", required: true, schema: { type: "string" } },
                    { name: "eventId", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: {
                    200: { description: "Lista de avaliações" },
                    401: { description: "Não autenticado" },
                    403: { description: "Não é admin" },
                    404: { description: "Pelada não encontrada" },
                },
            },
        },
        "/courts/{courtId}/events/{eventId}/reviews/progress": {
            get: {
                tags: ["Reviews"],
                summary: "Progresso de avaliações do usuário autenticado na pelada",
                description:
                    "Retorna quantos jogadores o usuário já avaliou (`reviewed`), quantos faltam (`pending`) e se completou todos (`completed`).",
                security: [{ PlayerToken: [] }, { OwnerToken: [] }, { AdminToken: [] }],
                parameters: [
                    { name: "courtId", in: "path", required: true, schema: { type: "string" } },
                    { name: "eventId", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: {
                    200: { description: "Progresso retornado" },
                    401: { description: "Não autenticado" },
                    403: { description: "Usuário não participou da pelada" },
                    404: { description: "Pelada não encontrada" },
                },
            },
        },

        // ── User Profile ────────────────────────────────────────────────────
        "/users/me": {
            get: {
                tags: ["Profile"],
                summary: "Retorna perfil completo do usuário autenticado (com email e pixKey)",
                security: [{ PlayerToken: [] }, { OwnerToken: [] }, { AdminToken: [] }],
                responses: {
                    200: { description: "Perfil retornado" },
                    401: { description: "Não autenticado" },
                },
            },
            patch: {
                tags: ["Profile"],
                summary: "Atualiza perfil do usuário autenticado",
                description:
                    "Campos opcionais: `name`, `avatarUrl`, `pixKey`. Para trocar senha: envie `currentPassword`, `newPassword` e `confirmNewPassword`.",
                security: [{ PlayerToken: [] }, { OwnerToken: [] }, { AdminToken: [] }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateProfileBody" } } },
                },
                responses: {
                    200: { description: "Perfil atualizado" },
                    400: { description: "Conta Google sem senha" },
                    401: { description: "Senha atual incorreta ou não autenticado" },
                    422: { description: "Dados inválidos" },
                },
            },
        },
        "/users/{userId}": {
            get: {
                tags: ["Profile"],
                summary: "Perfil público de um usuário com estatísticas (público)",
                description:
                    "Retorna nome, avatar, badge, role e `stats` com média de estrelas, total de peladas e tags mais recebidas.",
                parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }],
                responses: {
                    200: { description: "Perfil público retornado" },
                    404: { description: "Usuário não encontrado" },
                },
            },
        },

        // ── Reviews por usuário ─────────────────────────────────────────────
        "/users/{userId}/reviews": {
            get: {
                tags: ["Reviews"],
                summary: "Avaliações recebidas por um usuário, com summary (público)",
                description:
                    "Retorna `summary` (média de estrelas, total, tags mais frequentes) e lista completa de avaliações recebidas.",
                parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }],
                responses: { 200: { description: "Avaliações e summary do usuário" } },
            },
        },

        // ── Events (global) ─────────────────────────────────────────────────
        "/events": {
            get: {
                tags: ["Events"],
                summary: "Busca global de peladas com filtros",
                parameters: [
                    {
                        name: "status",
                        in: "query",
                        schema: { type: "string", enum: ["WAITING", "FULL", "FINISHED", "CANCELLED"] },
                    },
                    { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
                    { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
                    { name: "city", in: "query", schema: { type: "string" } },
                    { name: "neighborhood", in: "query", schema: { type: "string" } },
                    { name: "courtType", in: "query", schema: { type: "string", enum: COURT_TYPES } },
                ],
                responses: { 200: { description: "Lista de peladas" } },
            },
        },
        "/events/my/created": {
            get: {
                tags: ["Events"],
                summary: "Lista peladas criadas pelo usuário autenticado",
                security: [{ PlayerToken: [] }, { OwnerToken: [] }, { AdminToken: [] }],
                parameters: [
                    {
                        name: "status",
                        in: "query",
                        schema: { type: "string", enum: ["WAITING", "FULL", "FINISHED", "CANCELLED"] },
                    },
                ],
                responses: { 200: { description: "Peladas criadas" } },
            },
        },
        "/events/my/participating": {
            get: {
                tags: ["Events"],
                summary: "Lista peladas em que o usuário autenticado participa",
                security: [{ PlayerToken: [] }, { OwnerToken: [] }, { AdminToken: [] }],
                parameters: [
                    {
                        name: "status",
                        in: "query",
                        schema: { type: "string", enum: ["WAITING", "FULL", "FINISHED", "CANCELLED"] },
                    },
                ],
                responses: { 200: { description: "Peladas que participa" } },
            },
        },

        // ── Participations ──────────────────────────────────────────────────
        "/courts/{courtId}/events/{eventId}/participations": {
            get: {
                tags: ["Participations"],
                summary: "Lista participantes de uma pelada",
                parameters: [
                    { name: "courtId", in: "path", required: true, schema: { type: "string" } },
                    { name: "eventId", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: { 200: { description: "Lista de participantes" } },
            },
            post: {
                tags: ["Participations"],
                summary: "Entra em uma pelada (autenticado)",
                security: [{ PlayerToken: [] }, { OwnerToken: [] }, { AdminToken: [] }],
                parameters: [
                    { name: "courtId", in: "path", required: true, schema: { type: "string" } },
                    { name: "eventId", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: {
                    201: { description: "Entrou na pelada" },
                    409: { description: "Já está inscrito ou pelada cheia" },
                },
            },
            delete: {
                tags: ["Participations"],
                summary: "Sai de uma pelada (autenticado)",
                security: [{ PlayerToken: [] }, { OwnerToken: [] }, { AdminToken: [] }],
                parameters: [
                    { name: "courtId", in: "path", required: true, schema: { type: "string" } },
                    { name: "eventId", in: "path", required: true, schema: { type: "string" } },
                ],
                requestBody: {
                    content: { "application/json": { schema: { $ref: "#/components/schemas/LeaveBody" } } },
                },
                responses: { 200: { description: "Saiu da pelada" } },
            },
        },
        "/courts/{courtId}/events/{eventId}/participations/{userId}/attendance": {
            patch: {
                tags: ["Participations"],
                summary: "Confirma presença de um participante (organizador/admin)",
                security: [{ PlayerToken: [] }, { OwnerToken: [] }, { AdminToken: [] }],
                parameters: [
                    { name: "courtId", in: "path", required: true, schema: { type: "string" } },
                    { name: "eventId", in: "path", required: true, schema: { type: "string" } },
                    { name: "userId", in: "path", required: true, schema: { type: "string" } },
                ],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/AttendanceBody" } } },
                },
                responses: { 200: { description: "Presença confirmada" } },
            },
        },

        // ── Tournaments ─────────────────────────────────────────────────────
        "/tournaments": {
            get: {
                tags: ["Tournaments"],
                summary: "Lista campeonatos (público)",
                parameters: [
                    { name: "placeId", in: "query", schema: { type: "string" } },
                    { name: "sportType", in: "query", schema: { type: "string", enum: COURT_TYPES } },
                    { name: "status", in: "query", schema: { type: "string", enum: TOURNAMENT_STATUSES } },
                    { name: "format", in: "query", schema: { type: "string", enum: TOURNAMENT_FORMATS } },
                ],
                responses: { 200: { description: "Lista de campeonatos" } },
            },
            post: {
                tags: ["Tournaments"],
                summary: "Cria um campeonato (OWNER ou ADMIN)",
                security: [{ OwnerToken: [] }, { AdminToken: [] }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/TournamentBody" } } },
                },
                responses: {
                    201: { description: "Campeonato criado" },
                    400: { description: "Dados inválidos" },
                    401: { description: "Não autenticado" },
                    403: { description: "Sem permissão (apenas OWNER ou ADMIN)" },
                    404: { description: "Place não encontrado" },
                },
            },
        },
        "/tournaments/{tournamentId}": {
            get: {
                tags: ["Tournaments"],
                summary: "Detalhe de um campeonato com divisões (público)",
                parameters: [
                    { name: "tournamentId", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: {
                    200: { description: "Campeonato encontrado" },
                    404: { description: "Não encontrado" },
                },
            },
            patch: {
                tags: ["Tournaments"],
                summary: "Edita dados do campeonato (OWNER do place, ADMIN ou organizador)",
                security: [{ OwnerToken: [] }, { AdminToken: [] }],
                parameters: [
                    { name: "tournamentId", in: "path", required: true, schema: { type: "string" } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": { schema: { $ref: "#/components/schemas/UpdateTournamentBody" } },
                    },
                },
                responses: {
                    200: { description: "Campeonato atualizado" },
                    403: { description: "Sem permissão" },
                    404: { description: "Não encontrado" },
                    409: { description: "Format bloqueado (status IN_PROGRESS)" },
                },
            },
            delete: {
                tags: ["Tournaments"],
                summary: "Exclui campeonato em DRAFT (OWNER do place, ADMIN ou organizador)",
                security: [{ OwnerToken: [] }, { AdminToken: [] }],
                parameters: [
                    { name: "tournamentId", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: {
                    200: { description: "Campeonato excluído" },
                    403: { description: "Sem permissão" },
                    404: { description: "Não encontrado" },
                    409: { description: "Apenas DRAFT pode ser excluído" },
                },
            },
        },
        "/tournaments/{tournamentId}/status": {
            patch: {
                tags: ["Tournaments"],
                summary: "Muda status do campeonato (OWNER do place, ADMIN ou organizador)",
                description:
                    "Fluxo válido: **DRAFT → OPEN → REGISTRATION_CLOSED → IN_PROGRESS → FINISHED**. CANCELLED é aceito de qualquer estado ativo.",
                security: [{ OwnerToken: [] }, { AdminToken: [] }],
                parameters: [
                    { name: "tournamentId", in: "path", required: true, schema: { type: "string" } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": { schema: { $ref: "#/components/schemas/TournamentStatusBody" } },
                    },
                },
                responses: {
                    200: { description: "Status atualizado" },
                    400: { description: "Status inválido no body" },
                    403: { description: "Sem permissão" },
                    409: { description: "Transição de status inválida" },
                },
            },
        },

        // ── Tournament Divisions ────────────────────────────────────────────
        "/tournaments/{tournamentId}/divisions": {
            get: {
                tags: ["Tournament Divisions"],
                summary: "Lista divisões de um campeonato (público)",
                parameters: [
                    { name: "tournamentId", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: { 200: { description: "Lista de divisões" } },
            },
            post: {
                tags: ["Tournament Divisions"],
                summary: "Cria divisão no campeonato (OWNER do place, ADMIN ou organizador)",
                security: [{ OwnerToken: [] }, { AdminToken: [] }],
                parameters: [
                    { name: "tournamentId", in: "path", required: true, schema: { type: "string" } },
                ],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/DivisionBody" } } },
                },
                responses: {
                    201: { description: "Divisão criada" },
                    400: { description: "Dados inválidos" },
                    401: { description: "Não autenticado" },
                    403: { description: "Sem permissão" },
                    404: { description: "Campeonato não encontrado" },
                },
            },
        },
        "/tournaments/{tournamentId}/divisions/{divisionId}": {
            get: {
                tags: ["Tournament Divisions"],
                summary: "Detalhe de uma divisão (público)",
                parameters: [
                    { name: "tournamentId", in: "path", required: true, schema: { type: "string" } },
                    { name: "divisionId", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: {
                    200: { description: "Divisão encontrada" },
                    404: { description: "Não encontrada" },
                },
            },
            patch: {
                tags: ["Tournament Divisions"],
                summary: "Edita uma divisão (OWNER do place, ADMIN ou organizador)",
                security: [{ OwnerToken: [] }, { AdminToken: [] }],
                parameters: [
                    { name: "tournamentId", in: "path", required: true, schema: { type: "string" } },
                    { name: "divisionId", in: "path", required: true, schema: { type: "string" } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": { schema: { $ref: "#/components/schemas/UpdateDivisionBody" } },
                    },
                },
                responses: {
                    200: { description: "Divisão atualizada" },
                    403: { description: "Sem permissão" },
                    404: { description: "Não encontrada" },
                },
            },
            delete: {
                tags: ["Tournament Divisions"],
                summary: "Remove uma divisão (OWNER do place, ADMIN ou organizador)",
                security: [{ OwnerToken: [] }, { AdminToken: [] }],
                parameters: [
                    { name: "tournamentId", in: "path", required: true, schema: { type: "string" } },
                    { name: "divisionId", in: "path", required: true, schema: { type: "string" } },
                ],
                responses: {
                    200: { description: "Divisão removida" },
                    403: { description: "Sem permissão" },
                    404: { description: "Não encontrada" },
                },
            },
        },

        // ── Admin ───────────────────────────────────────────────────────────
        "/admin/users": {
            get: {
                tags: ["Admin"],
                summary: "Lista todos os usuários (admin)",
                security: [{ AdminToken: [] }],
                parameters: [
                    { name: "role", in: "query", schema: { type: "string", enum: ["PLAYER", "OWNER", "ADMIN"] } },
                ],
                responses: { 200: { description: "Lista de usuários" } },
            },
        },
        "/admin/users/{id}/role": {
            patch: {
                tags: ["Admin"],
                summary: "Atualiza role de um usuário (admin)",
                security: [{ AdminToken: [] }],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateRoleBody" } } },
                },
                responses: { 200: { description: "Role atualizado" } },
            },
        },
    },
};

export const swaggerSpec = swaggerJsdoc({ definition, apis: [] });
