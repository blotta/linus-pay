import { numberToLocaleStr } from "@/utils/locale";
import { InputGroup, NumberInput, useLocaleContext } from "@chakra-ui/react";
import React, { useEffect, useState, type ReactNode } from "react";

interface PercentageInputProps extends NumberInput.RootProps {
  percentageValue: number;
  onPercentageValueChange?: (value: number) => void;
  inputIsZeroToOne?: boolean;
  outputIsZeroToOne?: boolean;
  endElement?: ReactNode;
}

export const PercentageInput = React.forwardRef<
  HTMLDivElement,
  PercentageInputProps
>(function PercentageInput(props, ref) {
  const {
    children,
    percentageValue,
    onPercentageValueChange,
    inputIsZeroToOne = true,
    outputIsZeroToOne = true,
    endElement,
    ...rest
  } = props;
  const { locale } = useLocaleContext();
  const [percentageValueStr, setPercentageValueStr] = useState<string>(
    numberToLocaleStr(percentageValue * (inputIsZeroToOne ? 100 : 1), locale),
  );
  useEffect(() => {
    numberToLocaleStr(percentageValue * (inputIsZeroToOne ? 100 : 1), locale);
  }, [percentageValueStr, percentageValue, locale, inputIsZeroToOne]);

  return (
    <NumberInput.Root
      ref={ref}
      {...rest}
      value={percentageValueStr}
      onValueChange={(details) => {
        if (!Number.isNaN(details.valueAsNumber)) {
          setPercentageValueStr(details.value);
          console.log("setting", details.valueAsNumber);
          onPercentageValueChange?.(
            details.valueAsNumber * (outputIsZeroToOne ? 1 : 0.01),
          );
        }
      }}
      formatOptions={{
        style: "percent",
      }}
    >
      {children}
      {endElement ? (
        <InputGroup endElement={endElement}>
          <NumberInput.Input />
        </InputGroup>
      ) : (
        <NumberInput.Input />
      )}
    </NumberInput.Root>
  );
});
