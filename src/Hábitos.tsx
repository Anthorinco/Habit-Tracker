import {
  Box,
  Heading,
  Checkbox,
  Table,
  Icon,
  HStack,
  Button,
} from "@chakra-ui/react";
import { LuFileText, LuLayoutGrid, LuTrash2 } from "react-icons/lu";
import type { Modelo } from "./types/Modelo";

export function Hábitos({ lista, onAdd, onRemove }: Modelo) {
  // Colunas da matriz semanal de acompanhamento.
  const dias = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
    "Domingo",
  ];

  return (
    <Box
      maxH="1500px"
      maxW="1400px"
      w="full"
      p="6"
      borderWidth="1px"
      borderRadius="xl"
      shadow="md"
      bg="#121212"
      color="white"
    >
      <HStack justify="space-between" mb="6">
        <Heading size="md" display="flex" alignItems="center" gap="2">
          <Icon as={LuLayoutGrid} color="grey.400" />
          Hábitos
        </Heading>
        <Button size="sm" colorPalette="blue" variant="subtle" onClick={onAdd}>
          + Novo Hábito
        </Button>
      </HStack>

      <Table.Root size="sm" variant="line">
        <Table.Header>
          <Table.Row borderColor="grey.800">
            <Table.ColumnHeader color="grey.400" fontWeight="medium">
              Habitos
            </Table.ColumnHeader>
            {dias.map((dia) => (
              <Table.ColumnHeader key={dia} color="grey.400" textAlign="center">
                {dia.substring(0, 3)}{" "}
              </Table.ColumnHeader>
            ))}
            <Table.ColumnHeader></Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {lista.map((item, index) => (
            <Table.Row
              key={index}
              borderColor="grey.800"
              _hover={{ bg: "whiteAlpha.50" }}
            >
              <Table.Cell display="flex" alignItems="center" gap="2" py="4">
                <Icon as={LuFileText} color="grey.500" />
                {item}
              </Table.Cell>

              {dias.map((dia) => (
                <Table.Cell key={dia} textAlign="center">
                  {/* Checkbox visual. Hoje ele nao persiste estado nem conversa com o backend. */}
                  <Checkbox.Root size="lg" colorPalette="blue">
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                  </Checkbox.Root>
                </Table.Cell>
              ))}

              <Table.Cell>
                <Button
                  variant="ghost"
                  size="xs"
                  colorPalette="red"
                  onClick={() => onRemove(index)}
                >
                  <Icon as={LuTrash2} />
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
