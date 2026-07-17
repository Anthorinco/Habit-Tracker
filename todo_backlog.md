# Backlog técnico encerrado

Este arquivo registrava recursos ausentes antes da integração final. A revisão de 17/07/2026 confirmou que eles foram implementados.

## Requisitos atendidos

- cinco modelos relacionados no PostgreSQL, com exclusão em cascata do histórico;
- cadastro, login, senha protegida e JWT;
- CRUD autenticado de hábitos, prioridades e notas;
- histórico semanal, sequência, total mensal e cor de motivação;
- toggle de hábito com `id_habito` e data exata;
- notas permanentes ou com expiração e salvamento automático;
- limpeza semanal de prioridades, com controle para o usuário ligar ou desligar;
- validação dos corpos com Zod e isolamento dos dados por usuário;
- frontend conectado à API e ao banco;
- calendário configurado para `America/Maceio` por padrão;
- build único e servidor Express entregando frontend e API.

## Decisões registradas

- Os nomes `User`, `Habit`, `HistoricoHabito`, `Priority` e `Note` são os nomes internos do Prisma. Eles representam as cinco tabelas conceituais descritas no plano, sem diferença funcional.
- Express foi mantido porque “Next.js Route Handlers” aparece como recomendação, não como requisito obrigatório.
- `/api/health` permanece público por ser uma checagem técnica que retorna somente `{ "status": "ok" }`. Todas as rotas com dados do usuário exigem JWT.

## Provas de conclusão

Os comandos usados na entrega estão documentados no `README.md`. O teste de integração cobre autenticação, hábitos, prioridades, preferência semanal, notas, expiração e bloqueio de acesso entre dois usuários.
