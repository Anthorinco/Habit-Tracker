# Habit Space

Aplicação para acompanhar hábitos, prioridades semanais e notas. Cada pessoa tem uma conta própria e os dados ficam salvos no PostgreSQL.

## O que já funciona

- cadastro e login com senha protegida;
- token de acesso salvo no navegador e removido quando expira;
- hábitos com marcação de segunda a domingo;
- sequência atual, conclusões do mês e cor de motivação;
- prioridades semanais com criação, conclusão e exclusão;
- notas editáveis com salvamento automático e expiração opcional;
- limpeza automática de notas expiradas e prioridades de semanas anteriores;
- layout adaptado para computador e celular.

## Como iniciar

### 1. Backend

Entre na pasta `backend`, instale as dependências e crie o arquivo `.env`:

```bash
cd backend
npm install
cp .env.example .env
```

Preencha `DATABASE_URL` e troque `JWT_SECRET` por uma chave longa. Depois aplique as migrações e inicie a API:

```bash
npm exec prisma -- migrate deploy
npm run dev
```

A API abre em `http://localhost:3001`. Para conferir rapidamente, acesse `http://localhost:3001/api/health`.

### 2. Frontend

Em outro terminal, volte à raiz do projeto:

```bash
npm install
npm run dev
```

O endereço mostrado pelo Vite normalmente será `http://localhost:5173`.

## Variáveis de ambiente

Backend (`backend/.env`):

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/banco
JWT_SECRET=troque-por-uma-chave-longa
FRONTEND_URL=http://localhost:5173
PORT=3001
```

Frontend (`.env`, opcional):

```env
VITE_API_URL=http://localhost:3001/api
```

## Comandos de verificação

Na raiz:

```bash
npm run lint
npm run build
```

Na pasta `backend`:

```bash
npm test
npm run typecheck
npm run build
npm run test:integration
```

O teste de integração usa o banco configurado, cria um usuário temporário, testa todos os módulos e apaga esse usuário ao terminar.

## Rotas principais

| Módulo | Rotas |
| --- | --- |
| Autenticação | `POST /api/auth/register`, `POST /api/auth/login` |
| Hábitos | `GET/POST /api/habits`, `PATCH /api/habits/toggle`, `DELETE /api/habits/:id` |
| Prioridades | `GET/POST /api/priorities`, `PATCH /api/priorities/:id/toggle`, `DELETE /api/priorities/:id` |
| Notas | `GET/POST /api/notes`, `PUT/DELETE /api/notes/:id` |

Todas as rotas de hábitos, prioridades e notas exigem `Authorization: Bearer <token>`.

## Regras automáticas

- A limpeza roda quando o servidor inicia e depois a cada hora.
- Notas cuja `dataExpiracao` já passou são removidas.
- Prioridades de semanas anteriores são removidas quando o usuário mantém a opção `limparPrioridadesNoFimDaSemana` ativa.
- A cor do hábito usa a sequência atual: verde a partir de 5 dias, amarelo a partir de 2 e vermelho abaixo disso.
