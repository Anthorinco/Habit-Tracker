# Habit Space

Aplicação para acompanhar hábitos, prioridades semanais e notas. Cada pessoa tem uma conta própria, e os dados ficam salvos no PostgreSQL.

## O que funciona

- cadastro e login com senha protegida;
- token de acesso salvo no navegador e removido quando expira;
- hábitos de segunda a domingo, com sequência, total mensal e motivação;
- prioridades semanais, com opção de ligar ou desligar a limpeza automática;
- notas com salvamento automático e expiração opcional;
- separação segura dos dados de cada usuário;
- calendário no fuso configurado para a aplicação;
- layout adaptado para computador e celular;
- frontend e API entregues pelo mesmo servidor no modo de produção.

## Preparar o projeto pela primeira vez

Na raiz do projeto, instale as duas partes:

```bash
npm install
npm --prefix backend install
```

Crie a configuração do backend:

```bash
cp backend/.env.example backend/.env
```

Abra `backend/.env`, preencha `DATABASE_URL` e troque `JWT_SECRET` por uma chave longa. Depois aplique as migrações:

```bash
cd backend
npx prisma migrate deploy
cd ..
```

## Iniciar o produto completo

Estes dois comandos constroem frontend e backend e iniciam tudo em `http://localhost:3001`:

```bash
npm run build
npm start
```

A página React e a API usam o mesmo endereço. A checagem técnica fica em `http://localhost:3001/api/health`.

## Desenvolvimento com atualização automática

Inicie a interface e a API juntas com:

```bash
npm run dev
```

O Vite abre normalmente em `http://localhost:5173` e encaminha `/api` para o backend. Para iniciar apenas uma das partes, use `npm run dev:frontend` ou `npm run dev:backend`.

## Variáveis de ambiente

Backend (`backend/.env`):

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/banco
JWT_SECRET=troque-por-uma-chave-longa-e-aleatoria
FRONTEND_URL=http://localhost:5173
PORT=3001
APP_TIME_ZONE=America/Maceio
```

Frontend (`.env`, opcional):

```env
VITE_API_URL=http://localhost:3001/api
```

Sem `VITE_API_URL`, a interface usa `/api`, que é a configuração indicada para o produto completo.

## Comandos de verificação

Na raiz:

```bash
npm run lint
npm run build
```

Entre na pasta `backend` e rode:

```bash
cd backend
npm test
npm run typecheck
npm run test:integration
npx prisma validate
npx prisma migrate status
```

O teste de integração cria usuários temporários, percorre os módulos e apaga esses usuários ao terminar. Execute-o apenas com um banco de desenvolvimento ou de teste, nunca com o banco de produção.

## Rotas principais

| Módulo | Rotas |
| --- | --- |
| Autenticação | `POST /api/auth/register`, `POST /api/auth/login` |
| Hábitos | `GET/POST /api/habits`, `PATCH /api/habits/toggle`, `DELETE /api/habits/:id` |
| Prioridades | `GET/POST /api/priorities`, `PATCH /api/priorities/:id/toggle`, `DELETE /api/priorities/:id` |
| Preferência semanal | `GET/PATCH /api/priorities/settings` |
| Notas | `GET/POST /api/notes`, `PUT/DELETE /api/notes/:id` |

Hábitos, prioridades, preferências e notas exigem `Authorization: Bearer <token>`. Apenas autenticação e `/api/health`, que não expõe dados do usuário, são públicas.

O toggle de hábito recebe:

```json
{ "id_habito": 1, "data": "2026-07-17" }
```

Se a marcação já existir, ela é removida; caso contrário, ela é criada.

## Regras automáticas

- A limpeza roda quando o servidor inicia e depois a cada hora.
- Notas cuja data de expiração passou são removidas.
- Prioridades antigas são removidas somente quando o usuário mantém a opção semanal ligada.
- A cor do hábito usa a sequência atual: verde a partir de 5 dias, amarelo a partir de 2 e vermelho abaixo disso.
