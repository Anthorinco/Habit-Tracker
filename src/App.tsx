import { useState } from "react";
import "./App.css";
import { Hábitos } from "./Hábitos.tsx";
import { Prioridades } from "./Prioridades.tsx";
import { Flex, Heading, VStack, HStack, Box } from "@chakra-ui/react";
import { Notas } from "./Notas.tsx";

export default function App() {
  const [habitos, setHabitos] = useState(["Hábito 1", "Hábito 2"]);
  const [prioridades, setPrioridades] = useState([
    "Prioridade 1",
    "Prioridade 2",
  ]);
  const [notas, setNotas] = useState(["Nota 1", "Nota 2"]);

  // Const que adicionam.
  const adicionarHabito = () => {
    const novo = prompt("Digite o novo hábito:");
    if (novo) {
      setHabitos([...habitos, novo]);
    }
  };
  const adicionarPrioridade = () => {
    const novo = prompt("Digite a nova prioridade:");
    if (novo) {
      setPrioridades([...prioridades, novo]);
    }
  };
  const adicionarNotas = () => {
    const novo = prompt("Digite a nova nota:");
    if (novo) {
      setNotas([...notas, novo]);
    }
  };

  // Const que removem.
  const removerHabito = (indexParaRemover: number) => {
    const listaAtualizada = habitos.filter(
      (_, index) => index !== indexParaRemover,
    );
    setHabitos(listaAtualizada);
  };
  const removerPrioridade = (indexParaRemover: number) => {
    const listaAtualizada = prioridades.filter(
      (_, index) => index !== indexParaRemover,
    );
    setPrioridades(listaAtualizada);
  };
  const removerNotas = (indexParaRemover: number) => {
    const listaAtualizada = notas.filter(
      (_, index) => index !== indexParaRemover,
    );
    setNotas(listaAtualizada);
  };
  return (
    <Flex
      direction="column"
      align="center"
      justify="flex-start"
      p={8}
      bg="grey.200"
      minH="100vh"
      w="100vw"
    >
      <Heading mb={12} size="4xl" color="grey.800">
        Meu Habit Tracker
      </Heading>

      <HStack
        align="flex-start"
        gap={10}
        w="full"
        maxW="100%"
        px={4}
        justify="center"
      >
        <VStack gap={10} flex="3" w="full">
          <Box w="full">
            <Hábitos
              lista={habitos}
              onAdd={adicionarHabito}
              onRemove={removerHabito}
            />
          </Box>
          <Box w="full">
            <Prioridades
              lista={prioridades}
              onAdd={adicionarPrioridade}
              onRemove={removerPrioridade}
            />
          </Box>
        </VStack>

        <Box flex="1" w="full" position="sticky" top="20px">
          <Notas lista={notas} onAdd={adicionarNotas} onRemove={removerNotas} />
        </Box>
      </HStack>
    </Flex>
  );
}
