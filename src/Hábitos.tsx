import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { LuCheck, LuPlus, LuTrash2 } from "react-icons/lu";
import type { Habit, WeeklyHistory } from "./types/Modelo";

interface HabitsProps {
  lista: Habit[];
  hoje: string; // Data de hoje no formato YYYY-MM-DD
  disabled?: boolean;
  onAdd: (nome: string) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
  onToggle: (id: number, data: string) => Promise<void>;
}

// Mapeamento de cores e textos com base no status do hábito (corMotivacao)
const motivationColors = {
  verde: { dot: "#9dbb92", text: "Bom ritmo" },
  amarelo: { dot: "#d9bd75", text: "Ganhando ritmo" },
  vermelho: { dot: "#d78278", text: "Recomece hoje" },
};

/**
 * Retorna o nome formatado do dia da semana (ex: 'seg', 'segunda').
 */
function dayLabel(data: string, format: "short" | "long") {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: format,
    timeZone: "UTC",
  })
    .format(new Date(`${data}T00:00:00.000Z`))
    .replace("-feira", "")
    .replace(".", "");
}

/**
 * Exibe um estado vazio caso o usuário não possua hábitos cadastrados.
 */
function EmptyRow() {
  return (
    <Flex direction="column" align="center" justify="center" minH="180px" borderTopWidth="1px" borderColor="#2a2c29" textAlign="center" px="4">
      <Flex align="center" justify="center" boxSize="9" borderRadius="md" bg="#242824" color="#a9c99e" mb="3"><Icon as={LuCheck} /></Flex>
      <Text fontSize="sm" fontWeight="medium">Ainda não há hábitos aqui</Text>
      <Text mt="1" fontSize="xs" color="#858a81">Escreva o primeiro hábito no campo acima.</Text>
    </Flex>
  );
}

/**
 * Componente que gerencia o estado do Checkbox para marcar/desmarcar um hábito em um dia da semana.
 */
function HabitControl({
  habit,
  day,
  disabled,
  onToggle,
}: {
  habit: Habit;
  day: WeeklyHistory;
  disabled: boolean;
  onToggle: HabitsProps["onToggle"];
}) {
  return (
    <Checkbox.Root
      checked={day.concluido}
      disabled={disabled}
      onCheckedChange={() => {
        void onToggle(habit.id, day.data).catch(() => undefined);
      }}
      colorPalette="green"
      aria-label={`${habit.nome}: ${dayLabel(day.data, "long")}`}
    >
      <Checkbox.HiddenInput />
      <Checkbox.Control borderColor="#565b53" _hover={{ borderColor: "#a9c99e" }} />
    </Checkbox.Root>
  );
}

/**
 * Componente de detalhe do hábito, mostrando nome, status de motivação e estatísticas.
 */
function HabitDetails({ habit }: { habit: Habit }) {
  const motivation = motivationColors[habit.corMotivacao];
  return (
    <Box minW="0">
      <Text fontWeight="medium" color="#e5e7e2" truncate>{habit.nome}</Text>
      <HStack mt="1" gap="2" color="#858a81" fontSize="xs" wrap="wrap">
        <HStack gap="1"><Box boxSize="1.5" borderRadius="full" bg={motivation.dot} /><Text>{motivation.text}</Text></HStack>
        <Text>•</Text>
        <Text>{habit.sequenciaAtual} dias seguidos</Text>
        <Text>•</Text>
        <Text>{habit.conclusoesNoMes} no mês</Text>
      </HStack>
    </Box>
  );
}

/**
 * Painel principal para gerenciamento e visualização semanal de hábitos.
 */
export function Hábitos({ lista, hoje, disabled = false, onAdd, onRemove, onToggle }: HabitsProps) {
  const [draft, setDraft] = useState("");
  const [touched, setTouched] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const hasError = touched && !draft.trim();
  const days = lista[0]?.historicoSemanal ?? [];

  /**
   * Trata a criação de um novo hábito.
   */
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = draft.trim();
    if (!name) return setTouched(true);
    setPending("new");
    try {
      await onAdd(name);
      setDraft("");
      setTouched(false);
    } catch {
      // Erro é tratado globalmente no componente pai
    } finally {
      setPending(null);
    }
  };

  /**
   * Trata a exclusão de um hábito existente.
   */
  const remove = (habit: Habit) => {
    if (!window.confirm(`Remover o hábito "${habit.nome}" e todo o histórico?`)) return;
    setPending(`remove-${habit.id}`);
    void onRemove(habit.id).catch(() => undefined).finally(() => setPending(null));
  };

  return (
    <Box id="habitos" scrollMarginTop="4" borderWidth="1px" borderColor="#30322f" borderRadius="lg" bg="#191a18" overflow="hidden">
      {/* Cabeçalho da Seção */}
      <Flex direction={{ base: "column", md: "row" }} justify="space-between" gap="4" px={{ base: "4", sm: "5" }} py="5" borderBottomWidth="1px" borderColor="#2a2c29">
        <Box>
          <Heading size="md" letterSpacing="-0.02em">Hábitos</Heading>
          <Text mt="1" fontSize="sm" color="#8f938c">Marque os pequenos compromissos que sustentam sua semana.</Text>
        </Box>
        <Badge alignSelf={{ base: "flex-start", md: "center" }} colorPalette="green" variant="subtle" borderRadius="sm">
          {dayLabel(hoje, "long")} em destaque
        </Badge>
      </Flex>

      {/* Formulário para Adicionar Hábito */}
      <form onSubmit={submit}>
        <Box px={{ base: "4", sm: "5" }} py="3.5" borderBottomWidth="1px" borderColor="#2a2c29">
          <HStack gap="2" align="flex-start">
            <Box flex="1">
              <Input value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={() => setTouched(true)} aria-label="Novo hábito" aria-invalid={hasError} placeholder="Adicionar um hábito..." disabled={disabled || pending !== null} bg="#141513" borderColor={hasError ? "#d78278" : "#3a3d38"} />
              {hasError && <Text mt="1.5" fontSize="xs" color="#e39b93" role="alert">Escreva um hábito antes de adicionar.</Text>}
            </Box>
            <Button type="submit" aria-label="Adicionar hábito" colorPalette="green" loading={pending === "new"} disabled={disabled || !draft.trim()} minW="auto" px="3">
              <Icon as={LuPlus} /><Text display={{ base: "none", sm: "block" }}>Adicionar</Text>
            </Button>
          </HStack>
        </Box>
      </form>

      {/* Listagem de Hábitos */}
      {lista.length === 0 ? <EmptyRow /> : (
        <>
          {/* Tabela de Hábitos para telas maiores */}
          <Box display={{ base: "none", md: "block" }} overflowX="auto">
            <Table.Root size="sm" minW="790px">
              <Table.Header bg="#171815">
                <Table.Row borderColor="#2a2c29">
                  <Table.ColumnHeader color="#858a81" fontWeight="medium" py="3" pl="5">Hábito e ritmo</Table.ColumnHeader>
                  {days.map((day) => <Table.ColumnHeader key={day.data} color={day.data === hoje ? "#bfdab4" : "#858a81"} fontWeight={day.data === hoje ? "semibold" : "medium"} textAlign="center" bg={day.data === hoje ? "#222a21" : undefined} px="2">{dayLabel(day.data, "short")}</Table.ColumnHeader>)}
                  <Table.ColumnHeader w="42px" />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {lista.map((habit) => (
                  <Table.Row key={habit.id} borderColor="#2a2c29" _hover={{ bg: "#20221f" }}>
                    <Table.Cell py="3.5" pl="5" maxW="330px"><HabitDetails habit={habit} /></Table.Cell>
                    {habit.historicoSemanal.map((day) => <Table.Cell key={day.data} textAlign="center" bg={day.data === hoje ? "#1d211c" : undefined} px="2"><HabitControl habit={habit} day={day} disabled={disabled || pending !== null} onToggle={onToggle} /></Table.Cell>)}
                    <Table.Cell px="1"><IconButton aria-label={`Remover ${habit.nome}`} variant="ghost" size="xs" color="#888d85" disabled={disabled || pending !== null} onClick={() => remove(habit)}><Icon as={LuTrash2} /></IconButton></Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>

          {/* Listagem simplificada para dispositivos móveis */}
          <Stack display={{ base: "flex", md: "none" }} gap="0">
            {lista.map((habit) => <Box key={habit.id} px="4" py="4" borderBottomWidth="1px" borderColor="#2a2c29">
              <Flex justify="space-between" gap="3" align="flex-start"><HabitDetails habit={habit} /><IconButton aria-label={`Remover ${habit.nome}`} variant="ghost" size="xs" color="#888d85" disabled={disabled || pending !== null} onClick={() => remove(habit)}><Icon as={LuTrash2} /></IconButton></Flex>
              <Flex mt="4" gap="1.5" justify="space-between">{habit.historicoSemanal.map((day) => <Stack key={day.data} gap="1" align="center"><Text fontSize="10px" color={day.data === hoje ? "#bfdab4" : "#8f938c"} fontWeight={day.data === hoje ? "bold" : "medium"}>{dayLabel(day.data, "short")}</Text><HabitControl habit={habit} day={day} disabled={disabled || pending !== null} onToggle={onToggle} /></Stack>)}</Flex>
            </Box>)}
          </Stack>
        </>
      )}
    </Box>
  );
}

