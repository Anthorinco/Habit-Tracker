export interface User {
  id: number;
  nome: string;
  email: string;
}

export interface Session {
  token: string;
  usuario: User;
}

export interface WeeklyHistory {
  data: string;
  concluido: boolean;
}

export interface Habit {
  id: number;
  nome: string;
  dataCriacao: string;
  historicoSemanal: WeeklyHistory[];
  sequenciaAtual: number;
  conclusoesNoMes: number;
  corMotivacao: "verde" | "amarelo" | "vermelho";
}

export interface Priority {
  id: number;
  descricao: string;
  concluido: boolean;
  dataCriacao: string;
}

export interface Note {
  id: number;
  conteudo: string;
  dataCriacao: string;
  dataExpiracao: string | null;
}
