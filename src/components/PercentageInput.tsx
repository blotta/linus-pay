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
    min,
    ...rest
  } = props;
  const { locale } = useLocaleContext();
  const [percentageValueStr, setPercentageValueStr] = useState<string>(
    numberToLocaleStr(percentageValue * (inputIsZeroToOne ? 100 : 1), locale),
  );

  useEffect(() => {
    /* eslint-disable-next-line */
    setPercentageValueStr(
      numberToLocaleStr(percentageValue * (inputIsZeroToOne ? 100 : 1), locale),
    );
  }, [percentageValue, locale, inputIsZeroToOne]);

  return (
    <NumberInput.Root
      ref={ref}
      {...rest}
      min={min}
      value={percentageValueStr}
      onValueChange={(details) => {
        setPercentageValueStr(details.value);
      }}
      onValueCommit={(details) => {
        const value =
          !Number.isNaN(details.valueAsNumber) &&
          details.valueAsNumber >= (min ?? 0)
            ? details.valueAsNumber * (outputIsZeroToOne ? 1 : 0.01)
            : (min ?? 0);
        onPercentageValueChange?.(value);
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
