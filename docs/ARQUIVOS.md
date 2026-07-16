# Mapa do projeto

Este arquivo resume, em linguagem simples, o que faz cada arquivo principal do projeto.

## Frontend

| Arquivo | O que faz |
| --- | --- |
| `index.html` | Carrega o app dentro do `#root` |
| `src/main.tsx` | Ponto de entrada do React |
| `src/App.tsx` | Tela principal com hábitos, prioridades e notas |
| `src/App.css` | Folha de estilo global do app |
| `src/Hábitos.tsx` | Tabela semanal de hábitos |
| `src/Prioridades.tsx` | Lista de prioridades da semana |
| `src/Notas.tsx` | Painel lateral de notas rápidas |
| `src/types/Modelo.ts` | Tipo compartilhado dos componentes de lista |
| `src/components/ui/provider.tsx` | Provider do Chakra e do tema |
| `src/components/ui/color-mode.tsx` | Funções de tema claro/escuro |
| `src/components/ui/toaster.tsx` | Sistema de mensagens rápidas |
| `src/components/ui/tooltip.tsx` | Wrapper de tooltip do Chakra |

## Backend

| Arquivo | O que faz |
| --- | --- |
| `backend/src/server.ts` | Sobe a API e registra as rotas |
| `backend/src/prisma.ts` | Cria o cliente Prisma com PostgreSQL |
| `backend/src/routes/auth.routes.ts` | Cadastro e login |
| `backend/src/routes/auth.middleware.ts` | Proteção das rotas com JWT |
| `backend/src/routes/habit.routes.ts` | Rotas de criar, listar e remover hábitos |
| `backend/src/controllers/habit.controller.ts` | Regras do CRUD de hábitos |
| `backend/@types/express.d.ts` | Adiciona `req.userId` ao Express |

## Prisma e banco

| Arquivo | O que faz |
| --- | --- |
| `backend/prisma/schema.prisma` | Modela as tabelas do banco |
| `backend/prisma.config.ts` | Configuração do Prisma CLI |
| `backend/prisma/migrations/...` | Histórico das mudanças no banco |

## Configuração

| Arquivo | O que faz |
| --- | --- |
| `package.json` | Scripts e dependências do frontend |
| `backend/package.json` | Scripts e dependências do backend |
| `vite.config.ts` | Configuração do Vite |
| `eslint.config.js` | Regras de lint |
| `tsconfig.json` | Configuração raiz do TypeScript |
| `tsconfig.app.json` | TypeScript do frontend |
| `tsconfig.node.json` | TypeScript do Vite |
| `backend/tsconfig.json` | TypeScript do backend |

## O que eu deixei de fora

- `node_modules`
- arquivos gerados pelo Prisma em `backend/src/generated/prisma/`
- lockfiles, porque eles só travam versões

