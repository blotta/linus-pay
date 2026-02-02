import { numberToLocaleCurrencyStr } from "@/utils/locale";
import { NumberInput, useLocaleContext } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

interface MoneyInputProps extends NumberInput.RootProps {
  moneyValue: number;
  onMoneyValueChange?: (value: number) => void;
}

export const MoneyInput = React.forwardRef<HTMLDivElement, MoneyInputProps>(
  function MoneyInput(props, ref) {
    const { children, moneyValue, onMoneyValueChange, min, ...rest } = props;
    const { locale } = useLocaleContext();
    const [moneyValueStr, setMoneyValueStr] = useState<string>(
      numberToLocaleCurrencyStr(moneyValue, locale),
    );

    useEffect(() => {
      setMoneyValueStr(numberToLocaleCurrencyStr(moneyValue, locale));
    }, [moneyValue, locale]);

    return (
      <NumberInput.Root
        ref={ref}
        min={min}
        {...rest}
        value={moneyValueStr}
        onValueChange={(details) => {
          setMoneyValueStr(details.value);
        }}
        onValueCommit={(details) => {
          const value = !Number.isNaN(details.valueAsNumber)
            ? details.valueAsNumber
            : (min ?? 0);
          onMoneyValueChange?.(value);
        }}
        formatOptions={{
          style: "currency",
          currency: "BRL",
          currencyDisplay: "symbol",
          currencySign: "accounting",
        }}
      >
        {children}
        <NumberInput.Input />
      </NumberInput.Root>
    );
  },
);
