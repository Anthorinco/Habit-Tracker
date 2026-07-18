import { useState } from "react";
import { Box, Button, Checkbox, Flex, Heading, HStack, Icon, IconButton, Input, Stack, Switch, Text } from "@chakra-ui/react";
import { LuPlus, LuTarget, LuTrash2 } from "react-icons/lu";
import type { Priority } from "./types/Modelo";

interface PrioritiesProps {
  lista: Priority[];
  limparNoFimDaSemana: boolean; // Indica se as prioridades devem ser limpas automaticamente aos domingos
  disabled?: boolean;
  onAdd: (description: string) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
  onToggle: (id: number) => Promise<void>;
  onCleanupChange: (enabled: boolean) => Promise<void>;
}

/**
 * Componente que gerencia a lista de prioridades/compromissos semanais do usuário.
 */
export function Prioridades({ lista, limparNoFimDaSemana, disabled = false, onAdd, onRemove, onToggle, onCleanupChange }: PrioritiesProps) {
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);

  /**
   * Envia uma nova prioridade ao servidor.
   */
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const description = draft.trim();
    if (!description) return;
    setPending(true);
    try {
      await onAdd(description);
      setDraft("");
    } catch {
      // O erro é exibido centralizadamente no painel pai
    } finally {
      setPending(false);
    }
  };

  /**
   * Helper genérico para executar operações assíncronas atualizando o status de pendência.
   */
  const run = async (operation: () => Promise<void>) => {
    setPending(true);
    try { await operation(); } catch { /* erro exibido no painel */ } finally { setPending(false); }
  };

  /**
   * Solicita confirmação e remove uma prioridade.
   */
  const remove = (priority: Priority) => {
    if (!window.confirm(`Remover a prioridade "${priority.descricao}"?`)) return;
    void run(() => onRemove(priority.id));
  };

  return (
    <Box id="prioridades" scrollMarginTop="4" borderWidth="1px" borderColor="#30322f" borderRadius="lg" bg="#191a18" overflow="hidden">
      {/* Cabeçalho com o título da seção e o switch de limpeza de fim de semana */}
      <Flex direction={{ base: "column", sm: "row" }} align={{ base: "flex-start", sm: "center" }} justify="space-between" gap="4" px={{ base: "4", sm: "5" }} py="5" borderBottomWidth="1px" borderColor="#2a2c29">
        <HStack gap="3"><Flex align="center" justify="center" boxSize="9" borderRadius="md" bg="#242824" color="#a9c99e"><Icon as={LuTarget} boxSize="4" /></Flex><Box><Heading size="md" letterSpacing="-0.02em">Prioridades da semana</Heading><Text mt="0.5" fontSize="sm" color="#8f938c">O que merece sua atenção antes do resto.</Text></Box></HStack>
        <Switch.Root checked={limparNoFimDaSemana} disabled={disabled || pending} onCheckedChange={(details) => { void run(() => onCleanupChange(details.checked)); }} colorPalette="green" size="sm">
          <Switch.HiddenInput />
          <Switch.Control><Switch.Thumb /></Switch.Control>
          <Switch.Label fontSize="xs" color="#b9bdb5">Limpar ao fim da semana</Switch.Label>
        </Switch.Root>
      </Flex>

      {/* Lista de prioridades cadastradas */}
      <Stack gap="0">
        {lista.map((priority) => (
          <Flex key={priority.id} align="center" gap="3" px={{ base: "4", sm: "5" }} py="3.5" borderBottomWidth="1px" borderColor="#2a2c29" _hover={{ bg: "#20221f" }}>
            <Checkbox.Root checked={priority.concluido} disabled={disabled || pending} onCheckedChange={() => { void run(() => onToggle(priority.id)); }} colorPalette="green" flex="1" minW="0">
              <Checkbox.HiddenInput /><Checkbox.Control borderColor="#565b53" _hover={{ borderColor: "#a9c99e" }} /><Checkbox.Label color={priority.concluido ? "#858a81" : "#e5e7e2"} textDecoration={priority.concluido ? "line-through" : "none"} fontSize="sm" truncate>{priority.descricao}</Checkbox.Label>
            </Checkbox.Root>
            <IconButton aria-label={`Remover ${priority.descricao}`} variant="ghost" size="xs" color="#888d85" disabled={disabled || pending} onClick={() => remove(priority)}><Icon as={LuTrash2} /></IconButton>
          </Flex>
        ))}
        {lista.length === 0 && <Text px="5" py="7" fontSize="sm" color="#858a81" textAlign="center">Nenhuma prioridade definida para esta semana.</Text>}
      </Stack>

      {/* Formulário para inserção de novas prioridades */}
      <form onSubmit={submit}>
        <Box p={{ base: "4", sm: "5" }} bg="#171815">
          <HStack gap="2"><Input value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="Nova prioridade" placeholder="Adicionar prioridade..." disabled={disabled || pending} bg="#141513" borderColor="#3a3d38" /><Button type="submit" aria-label="Adicionar prioridade" colorPalette="green" loading={pending} disabled={disabled || !draft.trim()} px="3"><Icon as={LuPlus} /></Button></HStack>
        </Box>
      </form>
    </Box>
  );
}

