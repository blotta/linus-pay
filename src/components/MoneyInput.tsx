import { numberToLocaleCurrencyStr } from "@/utils/locale";
import { NumberInput, useLocaleContext } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

interface MoneyInputProps extends NumberInput.RootProps {
  moneyValue: number;
  onMoneyValueChange?: (value: number) => void;
}

export const MoneyInput = React.forwardRef<HTMLDivElement, MoneyInputProps>(
  function MoneyInput(props, ref) {
    const { children, moneyValue, onMoneyValueChange, ...rest } = props;
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
        {...rest}
        value={moneyValueStr}
        onValueChange={(details) => {
          setMoneyValueStr(details.value);
          if (
            !Number.isNaN(details.valueAsNumber) &&
            details.valueAsNumber != 0
          ) {
            onMoneyValueChange?.(details.valueAsNumber);
          }
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
