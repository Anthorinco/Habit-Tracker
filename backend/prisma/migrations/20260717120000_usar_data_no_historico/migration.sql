-- Remove duplicatas do mesmo dia antes de tornar a coluna um DATE.
DELETE FROM "HistoricoHabito" antigo
USING "HistoricoHabito" recente
WHERE antigo."habitId" = recente."habitId"
  AND antigo."dataConclusao"::date = recente."dataConclusao"::date
  AND antigo."id" > recente."id";

DROP INDEX "HistoricoHabito_habitId_dataConclusao_key";

ALTER TABLE "HistoricoHabito"
  ALTER COLUMN "dataConclusao" TYPE DATE USING "dataConclusao"::date,
  ALTER COLUMN "dataConclusao" SET DEFAULT CURRENT_DATE;

CREATE UNIQUE INDEX "HistoricoHabito_habitId_dataConclusao_key"
  ON "HistoricoHabito"("habitId", "dataConclusao");
