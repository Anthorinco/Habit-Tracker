import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge, Box, Button, Flex, Heading, HStack, Icon, Link, Separator, Skeleton, Stack, Text } from "@chakra-ui/react";
import { LuBookOpen, LuCalendarDays, LuCircleCheckBig, LuLayoutDashboard, LuLogOut, LuNotebookText, LuRefreshCw, LuTarget } from "react-icons/lu";
import "./App.css";
import { api, ApiError, loadSession, saveSession } from "./api";
import { AuthScreen } from "./AuthScreen";
import { Hábitos } from "./Hábitos";
import { Notas } from "./Notas";
import { Prioridades } from "./Prioridades";
import type { Habit, Note, Priority, Session } from "./types/Modelo";

/**
 * Retorna a data atual no fuso horário local formatada como 'YYYY-MM-DD'.
 */
function localDate(date = new Date()) {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return adjusted.toISOString().slice(0, 10);
}

/**
 * Componente Raiz da aplicação. Controla se o usuário deve ver a tela de autenticação
 * ou o painel principal (Dashboard).
 */
export default function App() {
  const [session, setSession] = useState<Session | null>(loadSession);

  /**
   * Armazena a sessão autenticada no localStorage e atualiza o estado.
   */
  const authenticated = (newSession: Session) => {
    saveSession(newSession);
    setSession(newSession);
  };

  /**
   * Finaliza a sessão do usuário, removendo os dados salvos localmente.
   */
  const logout = useCallback(() => {
    saveSession(null);
    setSession(null);
  }, []);

  if (!session) return <AuthScreen onAuthenticated={authenticated} />;
  return <Dashboard session={session} onLogout={logout} />;
}

/**
 * Componente Dashboard. Apresenta o painel de hábitos, prioridades semanais e notas rápidas.
 */
function Dashboard({ session, onLogout }: { session: Session; onLogout: () => void }) {
  // Estados para dados obtidos da API
  const [habits, setHabits] = useState<Habit[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [weeklyCleanupEnabled, setWeeklyCleanupEnabled] = useState(true);
  
  // Estados de controle de carregamento e mutações
  const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  
  // Fila de promessas por nota para evitar condições de corrida em salvamentos rápidos das notas
  const saveQueues = useRef(new Map<number, Promise<void>>());
  const [today, setToday] = useState(localDate);

  /**
   * Centraliza a captura de erros de requisições. 
   * Se o erro for 401 (Não Autorizado), força o logout do usuário.
   */
  const reportError = useCallback((requestError: unknown) => {
    if (requestError instanceof ApiError && requestError.status === 401) {
      onLogout();
      return;
    }
    setError(requestError instanceof ApiError ? requestError.message : "Não foi possível acessar o servidor");
  }, [onLogout]);

  /**
   * Carrega todos os dados iniciais do Dashboard concorrentemente.
   */
  const loadData = useCallback(async () => {
    setLoadStatus("loading");
    setError("");
    try {
      const [loadedHabits, loadedPriorities, loadedNotes, settings] = await Promise.all([
        api.habits.list(session.token),
        api.priorities.list(session.token),
        api.notes.list(session.token),
        api.priorities.settings(session.token),
      ]);
      setHabits(loadedHabits);
      setPriorities(loadedPriorities);
      setNotes(loadedNotes);
      setWeeklyCleanupEnabled(settings.limparNoFimDaSemana);
      setLoadStatus("ready");
    } catch (requestError) {
      reportError(requestError);
      setLoadStatus("error");
    }
  }, [reportError, session.token]);

  // Carrega os dados na montagem do componente
  useEffect(() => { void loadData(); }, [loadData]);

  // Agenda um temporizador para recarregar os dados automaticamente à meia-noite (mudança de dia)
  useEffect(() => {
    const now = new Date();
    const nextDay = new Date(now);
    nextDay.setHours(24, 0, 1, 0);
    const timer = window.setTimeout(() => {
      setToday(localDate());
      void loadData();
    }, nextDay.getTime() - now.getTime());
    return () => window.clearTimeout(timer);
  }, [loadData, today]);

  /**
   * Função auxiliar para encapsular mutações assíncronas atualizando o estado de ocupado.
   */
  const runMutation = useCallback(async (operation: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try { await operation(); } catch (requestError) { reportError(requestError); throw requestError; } finally { setBusy(false); }
  }, [reportError]);

  // Handlers para operações de Hábitos
  const addHabit = (name: string) => runMutation(async () => {
    await api.habits.create(session.token, name);
    setHabits(await api.habits.list(session.token));
  });
  const removeHabit = (id: number) => runMutation(async () => {
    await api.habits.remove(session.token, id);
    setHabits((current) => current.filter((habit) => habit.id !== id));
  });
  const toggleHabit = (id: number, date: string) => runMutation(async () => {
    await api.habits.toggle(session.token, id, date);
    setHabits(await api.habits.list(session.token));
  });

  // Handlers para operações de Prioridades
  const addPriority = (description: string) => runMutation(async () => {
    const priority = await api.priorities.create(session.token, description);
    setPriorities((current) => [...current, priority]);
  });
  const removePriority = (id: number) => runMutation(async () => {
    await api.priorities.remove(session.token, id);
    setPriorities((current) => current.filter((priority) => priority.id !== id));
  });
  const togglePriority = (id: number) => runMutation(async () => {
    const updated = await api.priorities.toggle(session.token, id);
    setPriorities((current) => current.map((priority) => priority.id === id ? updated : priority));
  });
  const updateWeeklyCleanup = (enabled: boolean) => runMutation(async () => {
    const settings = await api.priorities.updateSettings(session.token, enabled);
    setWeeklyCleanupEnabled(settings.limparNoFimDaSemana);
  });

  // Handlers para operações de Notas Rápidas
  const addNote = () => runMutation(async () => {
    const note = await api.notes.create(session.token);
    setNotes((current) => [note, ...current]);
  });
  const removeNote = (id: number) => runMutation(async () => {
    await api.notes.remove(session.token, id);
    setNotes((current) => current.filter((note) => note.id !== id));
  });

  /**
   * Salva alterações em uma nota garantindo ordem cronológica correta através de uma fila (Promise Queue).
   */
  const saveNote = useCallback(async (id: number, content: string, expiration: string | null) => {
    const previous = saveQueues.current.get(id) ?? Promise.resolve();
    const request = previous.catch(() => undefined).then(async () => {
      try {
        const updated = await api.notes.update(session.token, id, content, expiration);
        setNotes((current) => current.map((note) => note.id === id ? updated : note));
      } catch (requestError) {
        if (requestError instanceof ApiError && requestError.status === 401) {
          reportError(requestError);
        }
        throw requestError;
      }
    });
    saveQueues.current.set(id, request);
    void request.finally(() => {
      if (saveQueues.current.get(id) === request) saveQueues.current.delete(id);
    }).catch(() => undefined);
    return request;
  }, [reportError, session.token]);

  // Estatísticas de progresso dos hábitos
  const completedToday = habits.filter((habit) => habit.historicoSemanal.some((day) => day.data === today && day.concluido)).length;
  const progress = habits.length ? Math.round((completedToday / habits.length) * 100) : 0;
  const formattedDate = useMemo(() => new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", weekday: "long" }).format(new Date(`${today}T12:00:00`)), [today]);

  return (
    <Flex minH="100vh" bg="#111211" color="#e8e9e6">
      {/* Sidebar de Navegação Lateral - Visível em telas xl+ */}
      <Flex as="aside" display={{ base: "none", xl: "flex" }} direction="column" w="248px" minH="100vh" borderRightWidth="1px" borderColor="#292b28" bg="#161716" px="4" py="5">
        <HStack gap="3" px="2" mb="9"><Flex align="center" justify="center" boxSize="8" borderRadius="md" bg="#9dbb92" color="#142014" fontWeight="bold" fontSize="sm">H</Flex><Box><Text fontSize="sm" fontWeight="semibold">habit space</Text><Text fontSize="xs" color="#8f938c">seu ritmo, com calma</Text></Box></HStack>
        <Text px="2" mb="2" fontSize="xs" color="#858a81" fontWeight="semibold">VISÃO GERAL</Text>
        <Stack as="nav" aria-label="Seções do painel" gap="1"><Link href="#conteudo-principal" display="flex" alignItems="center" gap="3" px="2.5" py="2" borderRadius="md" bg="#272a26" color="inherit" fontSize="sm" fontWeight="medium" textDecoration="none"><Icon as={LuLayoutDashboard} />Hoje</Link><Link href="#habitos" display="flex" alignItems="center" gap="3" px="2.5" py="2" borderRadius="md" color="#92968f" fontSize="sm" textDecoration="none" _hover={{ bg: "#20221f", color: "#e5e7e2" }}><Icon as={LuCalendarDays} />Esta semana</Link></Stack>
        <Text px="2" mt="8" mb="2" fontSize="xs" color="#858a81" fontWeight="semibold">ESPAÇO PESSOAL</Text>
        <Stack as="nav" aria-label="Espaço pessoal" gap="1"><Link href="#prioridades" display="flex" alignItems="center" gap="3" px="2.5" py="2" borderRadius="md" color="#92968f" fontSize="sm" textDecoration="none" _hover={{ bg: "#20221f", color: "#e5e7e2" }}><Icon as={LuTarget} />Prioridades</Link><Link href="#notas" display="flex" alignItems="center" gap="3" px="2.5" py="2" borderRadius="md" color="#92968f" fontSize="sm" textDecoration="none" _hover={{ bg: "#20221f", color: "#e5e7e2" }}><Icon as={LuNotebookText} />Notas rápidas</Link></Stack>
        <Box mt="auto" borderWidth="1px" borderColor="#30322f" bg="#1c1e1b" borderRadius="lg" p="3.5"><HStack justify="space-between" mb="2"><Text fontSize="xs" color="#b9bdb5">Progresso de hoje</Text><Text fontSize="xs" color="#a9c99e" fontWeight="semibold">{progress}%</Text></HStack><Box h="1.5" borderRadius="full" bg="#30332e" overflow="hidden"><Box h="full" w={`${progress}%`} bg="#9dbb92" borderRadius="full" transition="width 180ms ease" /></Box><Text mt="2" fontSize="xs" color="#7f847c">{completedToday} de {habits.length} hábitos concluídos</Text></Box>
      </Flex>

      {/* Conteúdo Principal do Dashboard */}
      <Box flex="1" minW="0">
        {/* Header Superior - Visível em dispositivos menores */}
        <Flex as="header" display={{ base: "flex", xl: "none" }} align="center" justify="space-between" h="16" px={{ base: "4", sm: "6" }} borderBottomWidth="1px" borderColor="#292b28" bg="#161716"><HStack gap="2.5"><Flex align="center" justify="center" boxSize="7" borderRadius="md" bg="#9dbb92" color="#142014" fontWeight="bold" fontSize="xs">H</Flex><Text fontWeight="semibold" fontSize="sm">habit space</Text></HStack><HStack gap="2"><Badge colorPalette="green" variant="subtle" borderRadius="sm">{progress}% hoje</Badge><Button aria-label="Sair" variant="ghost" size="sm" onClick={onLogout}><Icon as={LuLogOut} /></Button></HStack></Flex>

        <Box as="main" id="conteudo-principal" maxW="1440px" mx="auto" px={{ base: "4", sm: "6", xl: "10" }} py={{ base: "6", lg: "9" }}>
          {/* Saudação e Data */}
          <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "flex-start", sm: "flex-end" }} gap="4" mb={{ base: "6", lg: "8" }}>
            <Box><HStack gap="2" mb="2"><Icon as={LuBookOpen} color="#9dbb92" boxSize="4" /><Text fontSize="xs" color="#9ea39a" textTransform="uppercase" letterSpacing="0.1em" fontWeight="semibold">seu espaço diário</Text></HStack><Heading as="h1" size="xl" letterSpacing="-0.035em" textTransform="capitalize">{formattedDate}</Heading><Text mt="2" color="#9ca099" fontSize="sm">Olá, {session.usuario.nome}. Um passo de cada vez.</Text></Box>
            <HStack gap="3"><HStack gap="3" borderWidth="1px" borderColor="#30332e" bg="#191a18" px="3.5" py="2.5" borderRadius="lg"><Flex boxSize="8" borderRadius="md" align="center" justify="center" bg="#273126" color="#a9c99e"><Icon as={LuCircleCheckBig} boxSize="4" /></Flex><Box><Text fontSize="xs" color="#8f938c">Feito hoje</Text><Text fontSize="sm" fontWeight="semibold">{completedToday} de {habits.length} hábitos</Text></Box></HStack><Button display={{ base: "none", xl: "flex" }} variant="ghost" size="sm" onClick={onLogout}><Icon as={LuLogOut} />Sair</Button></HStack>
          </Flex>

          {/* Banner de Erro Global */}
          {error && <Flex role="alert" align={{ base: "flex-start", sm: "center" }} justify="space-between" direction={{ base: "column", sm: "row" }} gap="3" mb="5" borderWidth="1px" borderColor="#693b37" bg="#352222" color="#f1b4ad" borderRadius="md" px="4" py="3"><Text fontSize="sm">{error}</Text><Button size="xs" variant="outline" onClick={() => { void loadData(); }}><Icon as={LuRefreshCw} />Tentar novamente</Button></Flex>}

          {/* Corpo do Painel - Exibe Skeletons em carregamento inicial */}
          {loadStatus === "loading" ? <Stack gap="5"><Skeleton height="320px" borderRadius="lg" /><Skeleton height="180px" borderRadius="lg" /></Stack> : loadStatus === "ready" ? (
            <Flex direction={{ base: "column", "2xl": "row" }} align="flex-start" gap={{ base: "5", "2xl": "6" }}>
              <Stack flex="1" minW="0" gap="5" w="full"><Hábitos lista={habits} hoje={today} disabled={busy} onAdd={addHabit} onRemove={removeHabit} onToggle={toggleHabit} /><Prioridades lista={priorities} limparNoFimDaSemana={weeklyCleanupEnabled} disabled={busy} onAdd={addPriority} onRemove={removePriority} onToggle={togglePriority} onCleanupChange={updateWeeklyCleanup} /></Stack>
              <Box w={{ base: "full", "2xl": "380px" }} flexShrink="0" position={{ "2xl": "sticky" }} top="6"><Notas lista={notes} disabled={busy} onAdd={addNote} onRemove={removeNote} onSave={saveNote} /></Box>
            </Flex>
          ) : null}

          <Separator borderColor="#292b28" mt="8" /><Text py="5" color="#858a81" fontSize="xs">Seus dados são sincronizados com a API e separados por usuário.</Text>
        </Box>
      </Box>
    </Flex>
  );
}

