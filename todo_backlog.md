# REQUISITOS AUSENTES (FEATURES NÃO IMPLEMENTADAS)

* **Endpoints do Módulo de Prioridades Semanais:** As rotas especificadas no plano não foram implementadas no backend:
  * `GET /api/priorities` (Retornar prioridades do usuário logado)
  * `POST /api/priorities` (Criar nova prioridade com padrão `concluido = false`)
  * `PATCH /api/priorities/[id]/toggle` (Alternar status concluído de uma prioridade)
  * `DELETE /api/priorities/[id]` (Excluir registro da prioridade)
* **Endpoints do Módulo de Notas:** Os seguintes endpoints para gerenciamento de notas estão totalmente ausentes:
  * `GET /api/notes` (Retornar notas do usuário)
  * `POST /api/notes` (Criar nova nota em branco/temporária)
  * `PUT /api/notes/[id]` (Salvar conteúdo da nota de forma automática/autosave)
  * `DELETE /api/notes/[id]` (Remover nota)
* **Endpoint de Alternância de Hábitos (`PATCH /api/habits/toggle`):** O endpoint responsável por criar (check) ou deletar (uncheck) uma linha em `historico_habitos` não existe no controlador [habit.controller.ts](file:///home/anthoni/Coding/Projects%28React%29/Habit%20Tracker/backend/src/controllers/habit.controller.ts) ou nas rotas [habit.routes.ts](file:///home/anthoni/Coding/Projects%28React%29/Habit%20Tracker/backend/src/routes/habit.routes.ts).
* **Mecanismos de Limpeza Automática:**
  * Limpeza semanal de prioridades baseada no campo `limparPrioridadesNoFimDaSemana` do modelo `User` em [schema.prisma](file:///home/anthoni/Coding/Projects%28React%29/Habit%20Tracker/backend/prisma/schema.prisma) não possui lógica implementada.
  * Expiração/exclusão automática de notas com prazo definido (`dataExpiracao` no modelo `Note` em [schema.prisma](file:///home/anthoni/Coding/Projects%28React%29/Habit%20Tracker/backend/prisma/schema.prisma)) não possui nenhum mecanismo de expiração.

# AJUSTES E INCONSISTÊNCIAS DE LÓGICA

* **Ausência de Histórico Semanal em `GET /api/habits`:** A função [getHabits](file:///home/anthoni/Coding/Projects%28React%29/Habit%20Tracker/backend/src/controllers/habit.controller.ts#L37-L55) apenas retorna a lista bruta de hábitos do usuário. Ela ignora a especificação de retornar também o histórico de marcações correspondente à semana atual.
* **Tipagem do Campo `dataConclusao` no Banco:** No arquivo [schema.prisma](file:///home/anthoni/Coding/Projects%28React%29/Habit%20Tracker/backend/prisma/schema.prisma#L44), a propriedade `dataConclusao` está definida como `DateTime` padrão. Como o plano prevê o agrupamento por dia (`DATE`), a precisão de horas/minutos/segundos no banco anulará a restrição de unicidade `@@unique([habitId, dataConclusao])`, permitindo múltiplos registros no mesmo dia caso os horários sejam ligeiramente diferentes. Deve ser mapeada explicitamente no banco como `@db.Date`.
* **Falta de Campos Específicos para Motivação e Métricas:** A tabela `historico_habitos` (ou a lógica de retorno da API de hábitos) não armazena nem calcula os dados descritos no plano: dias seguidos concluídos (streak), contagem mensal de conclusões e a cor do sistema de motivação (verde/amarelo/vermelho).
* **Ausência de Validação de Dados:** Os endpoints de cadastro ([register](file:///home/anthoni/Coding/Projects%28React%29/Habit%20Tracker/backend/src/routes/auth.routes.ts#L11)) e login ([login](file:///home/anthoni/Coding/Projects%28React%29/Habit%20Tracker/backend/src/routes/auth.routes.ts#L57)) não realizam validação estrutural do corpo da requisição (`nome`, `email`, `senha`), o que pode acarretar erros não tratados de runtime (ex. hashes nulos no bcrypt) ou violações de integridade de banco de dados.

# DEPENDÊNCIAS E INTEGRAÇÕES PENDENTES

* **Tela de Autenticação e Armazenamento de JWT no Frontend:** O frontend em [App.tsx](file:///home/anthoni/Coding/Projects%28React%29/Habit%20Tracker/src/App.tsx) não possui telas de login/cadastro nem lógica para salvar, injetar nos headers ou expirar o token de autenticação JWT requerido pelas rotas protegidas do backend.
* **Integração de State Dinâmico com API:** O estado do frontend no componente [App.tsx](file:///home/anthoni/Coding/Projects%28React%29/Habit%20Tracker/src/App.tsx#L10-L15) é puramente estático (`useState` com strings fixas). Não existem requisições HTTP (com `fetch` ou `axios`) para carregar ou salvar dados reais de hábitos, prioridades ou notas.
* **Componentes de UI Utilizam Contratos Genéricos de String:** O arquivo [Modelo.ts](file:///home/anthoni/Coding/Projects%28React%29/Habit%20Tracker/src/types/Modelo.ts) força os componentes [Hábitos.tsx](file:///home/anthoni/Coding/Projects%28React%29/Habit%20Tracker/src/H%C3%A1bitos.tsx), [Prioridades.tsx](file:///home/anthoni/Coding/Projects%28React%29/Habit%20Tracker/src/Prioridades.tsx) e [Notas.tsx](file:///home/anthoni/Coding/Projects%28React%29/Habit%20Tracker/src/Notas.tsx) a receberem apenas um array de strings simples (`string[]`). Eles precisam ser refatorados para lidar com objetos estruturados com IDs e metadados vindos do banco de dados (ex: hábitos com histórico semanal de booleanos, notas com data de expiração, prioridades com flag `concluido`).
* **Configuração de CORS no Servidor:** O arquivo [server.ts](file:///home/anthoni/Coding/Projects%28React%29/Habit%20Tracker/backend/src/server.ts) não possui configuração de CORS (`cors` middleware), impossibilitando requisições do frontend React (Vite) para a API devido a restrições de mesma origem nos navegadores.
* **Módulos Ausentes no Servidor:** As rotas de Notas e Prioridades não foram integradas nem registradas em [server.ts](file:///home/anthoni/Coding/Projects%28React%29/Habit%20Tracker/backend/src/server.ts).

# RECOMENDAÇÕES TÉCNICAS RÁPIDAS

* **Instalar Bibliotecas Faltantes no Backend:** Instalar `zod` para validação estrutural do body e `cors`/`@types/cors` para viabilizar as chamadas do frontend no [package.json (backend)](file:///home/anthoni/Coding/Projects%28React%29/Habit%20Tracker/backend/package.json).
* **Definir Scripts de Inicialização no Backend:** Adicionar scripts `"dev"` (usando `tsx watch`) e `"start"` (usando `node`) no [package.json (backend)](file:///home/anthoni/Coding/Projects%28React%29/Habit%20Tracker/backend/package.json) para simplificar a inicialização do ambiente.
* **Agendamento da Limpeza / Purga de Dados:** Implementar um serviço local (com `node-cron`) ou utilizar triggers no PostgreSQL para lidar com a exclusão de prioridades semanais ao fim da semana e remoção de notas expiradas.
* **Refatorar Tipo do Histórico:** Ajustar a coluna `dataConclusao` no [schema.prisma](file:///home/anthoni/Coding/Projects%28React%29/Habit%20Tracker/backend/prisma/schema.prisma) usando a anotação `@db.Date` para garantir que apenas o componente de data (YYYY-MM-DD) seja considerado nas validações de unicidade diária.
