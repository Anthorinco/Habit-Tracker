import { prisma } from "../prisma.js";
import { startOfCurrentWeek } from "../lib/cleanup-policy.js";

/**
 * Remove notas que expiraram e prioridades antigas (criadas antes da semana atual)
 * de usuários que ativaram a opção de autolimpeza.
 * Executa as remoções dentro de uma transação do banco de dados.
 */
export async function cleanupExpiredData(now = new Date()) {
  const [notes, priorities] = await prisma.$transaction([
    // 1. Exclui notas onde a data de expiração é menor ou igual ao momento atual
    prisma.note.deleteMany({
      where: { dataExpiracao: { lte: now } },
    }),
    // 2. Exclui prioridades antigas se a autolimpeza estiver ativa nas preferências do usuário
    prisma.priority.deleteMany({
      where: {
        dataCriacao: { lt: startOfCurrentWeek(now) },
        user: { limparPrioridadesNoFimDaSemana: true },
      },
    }),
  ]);

  return {
    notasRemovidas: notes.count,
    prioridadesRemovidas: priorities.count,
  };
}

/**
 * Configura um intervalo de execução periódico (a cada 1 hora) para rodar a limpeza dos dados expirados.
 */
export function scheduleCleanup() {
  const run = () => {
    void cleanupExpiredData().catch((error: unknown) => {
      console.error("Falha na limpeza automática:", error);
    });
  };

  // Executa imediatamente uma vez ao iniciar
  run();
  
  // Roda de hora em hora. unref() permite que o processo do Node finalize normalmente sem ficar preso por esse timer
  const timer = setInterval(run, 60 * 60 * 1000);
  timer.unref();
  return timer;
}

