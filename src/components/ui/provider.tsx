"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider 
        attribute="class" 
        defaultTheme="light"
        enableSystem={true}
        disableTransitionOnChange={false}
        {...props} 
      />
    </ChakraProvider>
  )
}
