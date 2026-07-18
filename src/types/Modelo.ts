/**
 * Representa um usuário cadastrado no sistema.
 */
export interface User {
  id: number;
  nome: string;
  email: string;
}

/**
 * Representa uma sessão ativa de autenticação.
 */
export interface Session {
  token: string;
  usuario: User;
}

/**
 * Histórico diário de conclusão de um hábito.
 */
export interface WeeklyHistory {
  data: string; // Formato YYYY-MM-DD
  concluido: boolean;
}

/**
 * Representa um hábito a ser rastreado pelo usuário.
 */
export interface Habit {
  id: number;
  nome: string;
  dataCriacao: string;
  historicoSemanal: WeeklyHistory[];
  sequenciaAtual: number; // Quantidade de dias consecutivos completados
  conclusoesNoMes: number; // Total de conclusões no mês atual
  corMotivacao: "verde" | "amarelo" | "vermelho"; // Status de progresso/alerta visual
}

/**
 * Representa uma prioridade/tarefa do usuário.
 */
export interface Priority {
  id: number;
  descricao: string;
  concluido: boolean;
  dataCriacao: string;
}

/**
 * Definições de configuração para o gerenciamento de prioridades.
 */
export interface PrioritySettings {
  limparNoFimDaSemana: boolean;
}

/**
 * Representa uma nota rápida que possui expiração.
 */
export interface Note {
  id: number;
  conteudo: string;
  dataCriacao: string;
  dataExpiracao: string | null;
}

