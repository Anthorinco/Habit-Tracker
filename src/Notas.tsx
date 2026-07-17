import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, Flex, Heading, HStack, Icon, IconButton, Input, Stack, Text, Textarea } from "@chakra-ui/react";
import { LuNotebookText, LuPlus, LuTrash2 } from "react-icons/lu";
import type { Note } from "./types/Modelo";

interface NotesProps {
  lista: Note[];
  disabled?: boolean;
  onAdd: () => Promise<void>;
  onRemove: (id: number) => Promise<void>;
  onSave: (id: number, content: string, expiration: string | null) => Promise<void>;
}

function toLocalInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function EditableNote({ note, disabled, onRemove, onSave }: { note: Note; disabled: boolean; onRemove: NotesProps["onRemove"]; onSave: NotesProps["onSave"] }) {
  const [content, setContent] = useState(note.conteudo);
  const [expiration, setExpiration] = useState(() => toLocalInput(note.dataExpiracao));
  const [status, setStatus] = useState<"saved" | "pending" | "saving" | "error">("saved");
  const revision = useRef(0);
  const requestedRevision = useRef<number | null>(null);
  const timer = useRef<number | null>(null);
  const originalExpiration = toLocalInput(note.dataExpiracao);

  const save = useCallback((currentRevision: number) => {
    if (requestedRevision.current === currentRevision) return;
    requestedRevision.current = currentRevision;
    setStatus("saving");
    const expirationIso = expiration ? new Date(expiration).toISOString() : null;
    void onSave(note.id, content, expirationIso)
      .then(() => {
        if (revision.current === currentRevision) setStatus("saved");
      })
      .catch(() => {
        if (revision.current === currentRevision) {
          requestedRevision.current = null;
          setStatus("error");
        }
      });
  }, [content, expiration, note.id, onSave]);

  useEffect(() => {
    if (disabled || (content === note.conteudo && expiration === originalExpiration)) return;
    const currentRevision = revision.current;
    timer.current = window.setTimeout(() => {
      timer.current = null;
      save(currentRevision);
    }, 700);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = null;
    };
  }, [content, disabled, expiration, note.conteudo, originalExpiration, save]);

  const saveOnBlur = () => {
    if (disabled || (content === note.conteudo && expiration === originalExpiration)) return;
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    save(revision.current);
  };

  const statusText = { saved: "Salva", pending: "Alterações pendentes", saving: "Salvando...", error: "Falha ao salvar" }[status];

  return (
    <Box px={{ base: "4", sm: "5" }} py="4" borderBottomWidth="1px" borderColor="#2a2c29" _hover={{ bg: "#20221f" }}>
      <Flex align="flex-start" gap="2">
        <Textarea value={content} onChange={(event) => { revision.current += 1; setContent(event.target.value); setStatus("pending"); }} onBlur={saveOnBlur} aria-label="Conteúdo da nota" placeholder="Escreva sua nota..." autoresize minH="72px" resize="none" disabled={disabled} bg="#141513" borderColor="#3a3d38" />
        <IconButton aria-label="Remover nota" variant="ghost" size="xs" color="#888d85" disabled={disabled} onClick={() => { if (window.confirm("Remover esta nota?")) void onRemove(note.id).catch(() => undefined); }}><Icon as={LuTrash2} /></IconButton>
      </Flex>
      <Flex mt="2.5" direction={{ base: "column", sm: "row" }} align={{ base: "stretch", sm: "center" }} justify="space-between" gap="2">
        <Box>
          <label className="field-label field-label--muted" htmlFor={`expiracao-${note.id}`}>Expirar em (opcional)</label>
          <Input id={`expiracao-${note.id}`} type="datetime-local" value={expiration} onChange={(event) => { revision.current += 1; setExpiration(event.target.value); setStatus("pending"); }} onBlur={saveOnBlur} disabled={disabled} size="xs" maxW={{ sm: "210px" }} bg="#141513" borderColor="#3a3d38" />
        </Box>
        {status === "error" ? <Button size="xs" variant="plain" color="#e39b93" onClick={() => save(revision.current)}>Tentar salvar</Button> : <Text aria-live="polite" fontSize="xs" color="#8f938c">{statusText}</Text>}
      </Flex>
    </Box>
  );
}

export function Notas({ lista, disabled = false, onAdd, onRemove, onSave }: NotesProps) {
  const [adding, setAdding] = useState(false);
  const add = async () => {
    setAdding(true);
    try { await onAdd(); } catch { /* erro exibido no painel */ } finally { setAdding(false); }
  };

  return (
    <Box id="notas" scrollMarginTop="4" borderWidth="1px" borderColor="#30322f" borderRadius="lg" bg="#191a18" overflow="hidden">
      <Flex align="center" justify="space-between" gap="3" px={{ base: "4", sm: "5" }} py="5" borderBottomWidth="1px" borderColor="#2a2c29">
        <HStack gap="3"><Flex align="center" justify="center" boxSize="9" borderRadius="md" bg="#29261e" color="#d9bd75"><Icon as={LuNotebookText} boxSize="4" /></Flex><Box><Heading size="md" letterSpacing="-0.02em">Notas rápidas</Heading><Text mt="0.5" fontSize="sm" color="#8f938c">Salvas automaticamente.</Text></Box></HStack>
        <Button aria-label="Criar nota" size="sm" colorPalette="yellow" loading={adding} disabled={disabled || adding} onClick={() => { void add(); }}><Icon as={LuPlus} /><Text display={{ base: "none", sm: "block" }}>Nova</Text></Button>
      </Flex>

      <Stack gap="0">
        {lista.map((note) => <EditableNote key={note.id} note={note} disabled={disabled} onRemove={onRemove} onSave={onSave} />)}
        {lista.length === 0 && <Text px="5" py="7" fontSize="sm" color="#858a81" textAlign="center">Crie uma nota para guardar uma ideia ou lembrete.</Text>}
      </Stack>
    </Box>
  );
}
