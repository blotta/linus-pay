import type { FormHandle } from "@/components/FormDrawer";
import {
  Avatar,
  createListCollection,
  Field,
  Group,
  HStack,
  Input,
  NumberInput,
  Select,
  Stack,
  Textarea,
  useSelectContext,
  VStack,
  Text,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import { forwardRef, useImperativeHandle, type Ref } from "react";
import { useEntryForm, type UseEntryFormParams } from "./useEntries";
import type { GroupMember } from "./groupSplit.types";
import { colorFromUuid } from "@/utils/colors";
import { labelForPaymentType, PAYMENT_TYPES } from "./groupSplit.api";
import { BiTrash } from "react-icons/bi";

interface EntryFormProps {
  entryParams: UseEntryFormParams;
  members: GroupMember[];
  onUpdateLoading?: (val: boolean) => void;
  closeDrawer?: () => void;
}

const EntryForm = forwardRef((props: EntryFormProps, ref: Ref<FormHandle>) => {
  const { values, setValues, submit, removeEntry } = useEntryForm(
    props.entryParams,
  );

  const handleSubmit = async () => {
    props.onUpdateLoading?.(true);
    await submit();
    props.onUpdateLoading?.(false);
  };

  const handleEntryDelete = async (entryId: string) => {
    props.onUpdateLoading?.(true);
    await removeEntry(entryId);
    props.onUpdateLoading?.(false);
  };

  useImperativeHandle(ref, () => ({
    triggerSubmit: handleSubmit,
  }));

  const membersCollection = createListCollection({
    items: props.members.map((m) => ({
      id: m.id,
      name: m.name,
      userId: m.user_id,
    })),
    itemToString: (item) => item.name,
    itemToValue: (item) => item.id,
  });

  const paymentTypeCollection = createListCollection({
    items: PAYMENT_TYPES.map((t) => ({
      value: t,
      label: labelForPaymentType(t),
    })),
  });

  return (
    <>
      <Flex justifyContent="end">
        <IconButton
          variant="ghost"
          color="red.subtle"
          _hover={{ color: "red.solid" }}
          onClick={() => handleEntryDelete(props.entryParams.initialEntry!.id)}
        >
          <BiTrash />
        </IconButton>
      </Flex>
      <VStack align="start" gap="8">
        <Stack gap="8" direction={{ md: "row", smDown: "column" }} width="full">
          <Field.Root required>
            <Field.Label>Description</Field.Label>
            <Input
              type="text"
              required
              onChange={(e) =>
                setValues((v) => ({ ...v, description: e.target.value }))
              }
              value={values.description}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>Date</Field.Label>
            <Input
              type="date"
              required
              onChange={(e) =>
                setValues((v) => ({ ...v, date: e.target.value }))
              }
              value={values.date}
            />
          </Field.Root>
        </Stack>
        <Field.Root>
          <Field.Label>Member (Payer)</Field.Label>
          <Select.Root
            collection={membersCollection}
            defaultValue={[
              props.entryParams.initialEntry?.member_id ??
                props.entryParams.creatorMemberId,
            ]}
            positioning={{ sameWidth: true }}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <SelectValue />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {membersCollection.items.map((item) => (
                  <Select.Item
                    item={item}
                    key={item.id}
                    justifyContent="flex-start"
                  >
                    <Avatar.Root
                      colorPalette={colorFromUuid(item.userId ?? item.id)}
                      size="2xs"
                    >
                      {/*<Avatar.Image src={item.avatar} alt={item.name} />*/}
                      <Avatar.Fallback name={item.name} />
                    </Avatar.Root>
                    {item.name}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </Field.Root>
        <Stack gap="8" direction={{ md: "row", smDown: "column" }} width="full">
          <Field.Root required>
            <Field.Label>Amount</Field.Label>
            <NumberInput.Root
              width="full"
              value={values.amount.toLocaleString()}
              onValueChange={(details) =>
                setValues((v) => ({ ...v, amount: details.valueAsNumber }))
              }
              formatOptions={{
                style: "currency",
                currency: "BRL",
                currencyDisplay: "symbol",
                currencySign: "accounting",
              }}
            >
              <NumberInput.Input />
            </NumberInput.Root>
          </Field.Root>
          <Field.Root>
            <Field.Label>Payment Type</Field.Label>
            <Select.Root
              collection={paymentTypeCollection}
              defaultValue={[values.payment_type]}
              positioning={{ sameWidth: true }}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {paymentTypeCollection.items.map((item) => (
                    <Select.Item
                      item={item}
                      key={item.value}
                      justifyContent="flex-start"
                    >
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
          </Field.Root>
          <Field.Root required maxW="120px">
            <Field.Label>Installments</Field.Label>
            <Group attached>
              <NumberInput.Root
                min={1}
                max={values.installments}
                width="full"
                value={values.installment.toString()}
                onValueChange={(details) =>
                  setValues((v) => ({
                    ...v,
                    installment: details.valueAsNumber,
                  }))
                }
              >
                <NumberInput.Input />
              </NumberInput.Root>
              <Text mx="2" fontSize="xl">
                /
              </Text>
              <NumberInput.Root
                min={1}
                width="full"
                value={values.installments.toString()}
                onValueChange={(details) =>
                  setValues((v) => ({
                    ...v,
                    installments: details.valueAsNumber,
                  }))
                }
              >
                <NumberInput.Input />
              </NumberInput.Root>
            </Group>
          </Field.Root>
        </Stack>
        <Field.Root>
          <Field.Label>Obs</Field.Label>
          <Textarea
            onChange={(e) => setValues((v) => ({ ...v, obs: e.target.value }))}
            value={values.obs ?? ""}
          />
        </Field.Root>
        {values.splits.map((s) => (
          <HStack key={s.member_id}>
            <p>{props.members.find((m) => m.id == s.member_id)!.name}</p>
            <p>{s.split_type}</p>
            {s.split_type === "percentage" && <Text>{s.percentage}%</Text>}
            {s.split_type === "amount" && <Text>${s.amount}</Text>}
          </HStack>
        ))}
      </VStack>
    </>
  );
});

const SelectValue = () => {
  const select = useSelectContext();
  const items = select.selectedItems as Array<{
    id: string;
    name: string;
    userId: string;
  }>;
  const { id, name, userId } = items[0];
  return (
    <Select.ValueText placeholder="Select member">
      <HStack>
        <Avatar.Root colorPalette={colorFromUuid(userId ?? id)} size="2xs">
          {/*<Avatar.Image src={avatar} alt={name} />*/}
          <Avatar.Fallback name={name} />
        </Avatar.Root>
        {name}
      </HStack>
    </Select.ValueText>
  );
};

export default EntryForm;
