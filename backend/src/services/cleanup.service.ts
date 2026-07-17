import { prisma } from "../prisma.js";
import { startOfCurrentWeek } from "../lib/cleanup-policy.js";

export async function cleanupExpiredData(now = new Date()) {
  const [notes, priorities] = await prisma.$transaction([
    prisma.note.deleteMany({
      where: { dataExpiracao: { lte: now } },
    }),
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

export function scheduleCleanup() {
  const run = () => {
    void cleanupExpiredData().catch((error: unknown) => {
      console.error("Falha na limpeza automática:", error);
    });
  };

  run();
  const timer = setInterval(run, 60 * 60 * 1000);
  timer.unref();
  return timer;
}
