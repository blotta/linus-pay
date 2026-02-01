"use client";

import {
  ChakraProvider,
  defaultSystem,
  LocaleProvider,
} from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";
import { useActiveLocale } from "@/hooks/useActiveLocale";

export function UIProvider(props: ColorModeProviderProps) {
  const locale = useActiveLocale();

  return (
    <ChakraProvider value={defaultSystem}>
      <LocaleProvider locale={locale}>
        <ColorModeProvider {...props} />
      </LocaleProvider>
    </ChakraProvider>
  );
}
