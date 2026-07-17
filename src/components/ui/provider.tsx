"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

// Empacota o provider do Chakra junto com o provider de tema da aplicacao.
export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider defaultTheme="dark" enableSystem={false} {...props} />
    </ChakraProvider>
  )
}
