# Mapa do projeto

## Frontend

| Arquivo | O que faz |
| --- | --- |
| `src/App.tsx` | Carrega dados reais, coordena autosave e monta o painel principal |
| `src/AuthScreen.tsx` | Cadastro e login |
| `src/api.ts` | Centraliza chamadas HTTP e armazenamento do token |
| `src/Hábitos.tsx` | Histórico semanal e métricas dos hábitos |
| `src/Prioridades.tsx` | Prioridades semanais |
| `src/Notas.tsx` | Notas com autosave e expiração |
| `src/types/Modelo.ts` | Formatos dos dados retornados pela API |

## Backend

| Arquivo | O que faz |
| --- | --- |
| `backend/src/server.ts` | Configura CORS, rotas e entrega o build do frontend |
| `backend/src/routes/*.routes.ts` | Define os endereços de cada módulo |
| `backend/src/controllers/*.controller.ts` | Executa as regras de cada módulo |
| `backend/src/lib/schemas.ts` | Valida os dados recebidos |
| `backend/src/lib/habit-metrics.ts` | Calcula semana, sequência, mês e motivação |
| `backend/src/lib/calendar.ts` | Centraliza datas da aplicação no fuso configurado |
| `backend/src/services/cleanup.service.ts` | Remove dados vencidos automaticamente |
| `backend/src/integration/api.integration.ts` | Testa a API completa com um usuário temporário |

## Banco

| Arquivo | O que faz |
| --- | --- |
| `backend/prisma/schema.prisma` | Define as tabelas e relações |
| `backend/prisma/migrations/` | Guarda as mudanças aplicadas ao PostgreSQL |
| `backend/prisma.config.ts` | Liga o Prisma à variável `DATABASE_URL` |
