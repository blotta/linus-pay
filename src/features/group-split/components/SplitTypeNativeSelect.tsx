import { NativeSelect } from "@chakra-ui/react";
import {
  labelForSplitType,
  SPLIT_TYPES,
  type SplitType,
} from "../groupSplit.types";

export interface SplitTypeNativeSelectProps extends NativeSelect.RootProps {
  value: SplitType;
  onSplitTypeChange: (type: SplitType) => void;
}

export function SplitTypeNativeSelect(props: SplitTypeNativeSelectProps) {
  const { value, onSplitTypeChange, ...rest } = props;
  return (
    <NativeSelect.Root {...rest}>
      <NativeSelect.Field
        value={value}
        onChange={(e) => onSplitTypeChange(e.target.value as SplitType)}
      >
        {SPLIT_TYPES.map((t) => (
          <option key={t} value={t}>
            {labelForSplitType(t)}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}
