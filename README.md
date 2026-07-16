# Habit Tracker

Aplicação de produtividade para acompanhar hábitos, prioridades e notas.

O projeto está dividido em duas partes:

- `frontend`: interface em React + Vite + Chakra UI
- `backend`: API em Express + Prisma + PostgreSQL com autenticação via JWT

## Estado atual

- O frontend já exibe três blocos principais: Hábitos, Prioridades Semanais e Notas.
- Os dados da tela ainda vivem em memória local do React.
- O backend já tem cadastro, login e middleware de autenticação.
- A API ainda não está integrada ao fluxo visual do frontend.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Chakra UI, React Icons |
| Backend | Express 5, Prisma 7, PostgreSQL |
| Autenticação | bcryptjs, jsonwebtoken |
| Ferramentas | ESLint, TypeScript, dotenv |

## Estrutura resumida

```text
Habit Tracker/
├─ src/
│  ├─ App.tsx
│  ├─ Hábitos.tsx
│  ├─ Prioridades.tsx
│  ├─ Notas.tsx
│  ├─ components/ui/
│  └─ types/
├─ backend/
│  ├─ src/
│  │  ├─ server.ts
│  │  ├─ prisma.ts
│  │  └─ routes/
│  ├─ prisma/
│  │  └─ schema.prisma
│  └─ prisma.config.ts
├─ package.json
└─ README.md
```

## Frontend

### `src/App.tsx`

É a tela principal. Hoje ela:

- mantém as listas de hábitos, prioridades e notas em estado local;
- permite adicionar itens com `prompt`;
- permite remover itens por índice;
- organiza a página em duas colunas, com a área de notas fixa na lateral.

### `src/Hábitos.tsx`

- Renderiza uma tabela semanal de hábitos.
- Mostra os dias da semana como colunas.
- Exibe checkboxes para marcar execução.
- Remove um hábito pelo botão de lixeira.

### `src/Prioridades.tsx`

- Renderiza a lista de prioridades da semana.
- Permite adicionar e remover itens.
- Usa checkbox por item para marcar conclusão visual.

### `src/Notas.tsx`

- Renderiza notas rápidas.
- Permite adicionar e remover observações.
- Fica em uma coluna lateral com comportamento sticky.

## Backend

### Autenticação

O backend expõe duas rotas principais em `/api/auth`:

- `POST /api/auth/register`
- `POST /api/auth/login`

#### `register`

Recebe:

```json
{
  "nome": "Nome do usuário",
  "email": "usuario@exemplo.com",
  "senha": "senha"
}
```

Fluxo:

- verifica se o e-mail já existe;
- gera hash da senha com `bcryptjs`;
- cria o usuário no banco;
- retorna `id`, `nome` e `email`.

#### `login`

Recebe:

```json
{
  "email": "usuario@exemplo.com",
  "senha": "senha"
}
```

Fluxo:

- busca o usuário pelo e-mail;
- compara a senha com o hash salvo;
- gera um token JWT com expiração de `7d`;
- retorna o usuário e o token.

### Middleware de auth

O arquivo `backend/src/routes/auth.middleware.ts` valida requisições protegidas:

- lê o header `Authorization`;
- exige o formato `Bearer <token>`;
- valida o token com `JWT_SECRET`;
- injeta `req.userId` na request.

### Inicialização do servidor

O arquivo `backend/src/server.ts`:

- cria a aplicação Express;
- habilita `express.json()`;
- registra as rotas de autenticação;
- sobe o servidor na porta `3001`.

## Banco de dados

O schema Prisma define estas entidades:

- `User`
- `Habit`
- `HistoricoHabito`
- `Priority`
- `Note`

Relacionamentos principais:

- um `User` pode ter vários `Habit`, `Priority` e `Note`;
- `Habit` possui histórico de conclusões em `HistoricoHabito`;
- os vínculos usam `onDelete: Cascade` para limpar dados relacionados.

## Variáveis de ambiente

O backend depende de:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/banco
JWT_SECRET=uma_chave_longa_e_segura
```

Observação:

- o frontend, no estado atual, não depende de variáveis de ambiente para funcionar.

## Como rodar

### Frontend

Na raiz do projeto:

```bash
npm install
npm run dev
```

Outros comandos úteis:

```bash
npm run build
npm run lint
```

### Backend

Na pasta `backend`:

```bash
npm install
npx tsx watch src/server.ts
```

Validação útil do Prisma:

```bash
npx prisma validate
```

## Observações importantes

- O backend ainda não tem scripts próprios definidos em `backend/package.json`.
- O cliente Prisma gerado em `backend/src/generated/prisma` é código gerado; não é para editar manualmente.
- A tipagem global de Express para `req.userId` fica em `backend/@types/express.d.ts`.
- A tela principal ainda usa estado local; se quiser persistência real, o próximo passo é ligar o frontend à API.

## Próximos passos naturais

1. Conectar o frontend ao backend para salvar hábitos, prioridades e notas no banco.
2. Adicionar validação de payload nas rotas de auth.
3. Expandir a documentação por endpoint, se o backend crescer.

## Documentação detalhada

Se você quiser o mapa arquivo por arquivo, ele está em [docs/ARQUIVOS.md](/home/anthoni/Coding/Projects(React)/Habit%20Tracker/docs/ARQUIVOS.md).
