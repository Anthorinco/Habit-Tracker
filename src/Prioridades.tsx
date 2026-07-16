import {
  List,
  Box,
  Heading,
  HStack,
  Checkbox,
  Button,
  Icon,
} from "@chakra-ui/react";
import { LuTrash2 } from "react-icons/lu";
import type { Modelo } from "./types/Modelo";

export function Prioridades({ lista, onAdd, onRemove }: Modelo) {
  return (
    <Box
      maxW="full"
      w="full"
      p="6"
      borderWidth="1px"
      borderRadius="xl"
      shadow="md"
      bg="#121212"
      color="white"
    >
      <HStack justify="space-between" mb="4">
        <Heading size="md">Prioridades Semanais</Heading>
        <Button size="sm" colorPalette="blue" variant="subtle" onClick={onAdd}>
          + Adicionar
        </Button>
      </HStack>

      <List.Root gap="3" variant="plain">
        {lista.map((item, index) => (
          <List.Item
            key={index}
            p="2"
            _hover={{ bg: "whiteAlpha.50" }}
            borderRadius="md"
          >
            <HStack justify="space-between" w="full">
              {/* Checkbox de conclusao para marcar a prioridade como feita. */}
              <Checkbox.Root size="lg">
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label fontSize="md">{item}</Checkbox.Label>
              </Checkbox.Root>

              <Button
                variant="ghost"
                size="xs"
                colorPalette="red"
                onClick={() => onRemove(index)}
              >
                <Icon as={LuTrash2} />
              </Button>
            </HStack>
          </List.Item>
        ))}
      </List.Root>
    </Box>
  );
}
