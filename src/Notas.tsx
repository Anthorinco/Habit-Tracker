import { List, Box, Heading, HStack, Button, Icon } from "@chakra-ui/react";
import { LuTrash2, LuStickyNote } from "react-icons/lu";
import type { Modelo } from "./types/Modelo";

export function Notas({ lista, onAdd, onRemove }: Modelo) {
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
      minH="400px"
    >
      <HStack justify="space-between" mb="6">
        <Heading size="md" display="flex" alignItems="center" gap="2">
          <Icon as={LuStickyNote} />
          Notas
        </Heading>
        <Button
          size="xs"
          colorPalette="yellow"
          variant="subtle"
          onClick={onAdd}
        >
          + Nota
        </Button>
      </HStack>

      <List.Root gap="2">
        {lista.map((nota, index) => (
          <List.Item
            key={index}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottomWidth="1px"
            borderColor="whiteAlpha.100"
            py="2"
          >
            {/* Texto curto para anotações rapidas e sem estrutura. */}
            <Box fontSize="sm">{nota}</Box>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onRemove(index)}
              color="grey.500"
              _hover={{ color: "red.400" }}
            >
              <Icon as={LuTrash2} />
            </Button>
          </List.Item>
        ))}
      </List.Root>
    </Box>
  );
}
