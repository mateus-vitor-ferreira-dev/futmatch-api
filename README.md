⚽ FutMatch API

API REST do FutMatch — plataforma para organização de eventos esportivos.

🚀 Tecnologias
Node.js
Express
Prisma ORM
PostgreSQL
JWT
bcrypt
📦 Pré-requisitos (OBRIGATÓRIO)

Antes de começar, você precisa instalar:

1. Node.js

https://nodejs.org

Após instalar, verifique:

node -v
npm -v

2. Git

https://git-scm.com/

Verifique:

git --version

3. PostgreSQL

https://www.postgresql.org/download/

OU (recomendado se souber Docker):

docker run --name futmatch_postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

📥 Como baixar o projeto
Opção 1 — Clonar com Git (RECOMENDADO)

git clone https://github.com/mateus-vitor-ferreira-dev/futmatch-api.git

cd futmatch-api

Opção 2 — Baixar ZIP
Clique em "Code"
Clique em "Download ZIP"
Extraia
Abra a pasta no terminal
⚙️ Configuração do projeto
1. Instalar dependências

npm install

2. Criar arquivo .env

Copie o arquivo .env.example:

cp .env.example .env

OU crie manualmente um arquivo chamado .env com:

PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/futmatch
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=1d

3. Rodar migrations

npx prisma migrate dev

4. Gerar client Prisma

npx prisma generate

▶️ Rodando o projeto

npm run dev

A API estará em:

http://localhost:3000

Teste:

http://localhost:3000/health

🧠 Estrutura do projeto

src/
├── config/
├── constants/
├── middlewares/
├── modules/
├── routes/
├── utils/
├── app.js
└── server.js

🌱 Fluxo de trabalho (GIT)
Nunca trabalhe direto na main

Criar branch:

git checkout develop
git pull
git checkout -b feat/nome-da-feature

Fazer commit

git add .
git commit -m "feat: create auth module"

Enviar para GitHub

git push origin feat/nome-da-feature

Criar Pull Request
Vá no GitHub
Clique em "Compare & pull request"
Base: develop
Enviar
📌 Conventional Commits

Formato:

tipo: descrição

Tipos principais:

feat → nova funcionalidade
fix → correção de bug
chore → configuração
docs → documentação
refactor → melhoria interna
test → testes

Exemplos

feat: create event module
fix: prevent duplicate participation
chore: setup prisma
docs: update readme
refactor: improve auth service

🚫 Regras importantes
NÃO fazer push na main
NÃO commitar .env
SEMPRE usar branch
SEMPRE usar commit padrão
TESTAR antes de subir
🧪 Comandos úteis

Rodar projeto:
npm run dev

Prisma:
npx prisma studio
npx prisma migrate dev
npx prisma generate

🧠 Dicas

Sempre rode npm install após atualizar o projeto

Se der erro:

rm -rf node_modules
npm install

👥 Colaboração

Projeto com padrão profissional:

arquitetura em camadas
código escalável
boas práticas
🚀 Futuro
login com Google
sistema de amizade
notificações
integração mobile

🔥 Em caso de dúvida, pergunte antes de alterar código.
