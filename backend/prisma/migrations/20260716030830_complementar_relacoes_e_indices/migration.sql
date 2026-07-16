/*
  Warnings:

  - A unique constraint covering the columns `[habitId,dataConclusao]` on the table `HistoricoHabito` will be added. If there are existing duplicate values, this will fail.

*/
-- Migration complementar que ajusta o historico de habitos e adiciona o indice unico.
-- AlterTable
ALTER TABLE "HistoricoHabito" ALTER COLUMN "dataConclusao" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "HistoricoHabito_habitId_dataConclusao_key" ON "HistoricoHabito"("habitId", "dataConclusao");
