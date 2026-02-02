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
  Box,
  Separator,
  LocaleProvider,
  FormatNumber,
} from "@chakra-ui/react";
import { forwardRef, useImperativeHandle, type Ref } from "react";
import type { GroupMember } from "./groupSplit.types";
import { colorFromUuid } from "@/utils/colors";
import { labelForPaymentType, PAYMENT_TYPES } from "./groupSplit.types";
import { BiTrash } from "react-icons/bi";
import { CgClose } from "react-icons/cg";
import { SplitTypeNativeSelect } from "./components/SplitTypeNativeSelect";
import { MoneyInput } from "@/components/MoneyInput";
import { PercentageInput } from "@/components/PercentageInput";
import { useEntryForm, type UseEntryFormParams } from "./hooks/useEntryForm";

interface EntryFormProps {
  entryParams: UseEntryFormParams;
  members: GroupMember[];
  onUpdateLoading?: (val: boolean) => void;
  closeDrawer?: () => void;
}

const EntryForm = forwardRef((props: EntryFormProps, ref: Ref<FormHandle>) => {
  const {
    values,
    setValues,
    amounts,
    amountsValid,
    submit,
    changeSplitType,
    changeSplitValue,
    removeEntry,
  } = useEntryForm(props.entryParams);

  const handleSubmit = async () => {
    props.onUpdateLoading?.(true);
    await submit();
    props.onUpdateLoading?.(false);
    props.closeDrawer?.();
  };

  const handleEntryDelete = async (entryId: string) => {
    props.onUpdateLoading?.(true);
    await removeEntry(entryId);
    props.onUpdateLoading?.(false);
    props.closeDrawer?.();
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
            <Field.Label>Amouut</Field.Label>
            <MoneyInput
              width="full"
              min={0.01}
              moneyValue={values.amount}
              onMoneyValueChange={(a) =>
                setValues((v) => ({ ...v, amount: a }))
              }
            ></MoneyInput>
            <Field.ErrorText>Err</Field.ErrorText>
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
        <Field.Root>
          <Field.Label>
            Split Configuration
            {amountsValid === false && (
              <Text as="span" ml="4" color="fg.error">
                Invalid amounts
              </Text>
            )}
          </Field.Label>

          {values.splits.map((split) => (
            <Box
              key={split.member_id}
              bg="bg.muted"
              border="1px solid"
              borderColor="fg.subtle"
              borderRadius="0.3em"
              w="full"
              p="4"
            >
              <HStack justifyContent="space-between">
                <HStack>
                  <Avatar.Root
                    size="sm"
                    colorPalette={colorFromUuid(
                      props.members.find((m) => m.id == split.member_id)!
                        .user_id ?? split.member_id,
                    )}
                  >
                    <Avatar.Fallback
                      name={
                        props.members.find((m) => m.id == split.member_id)!.name
                      }
                    />
                  </Avatar.Root>
                  <p>
                    {props.members.find((m) => m.id == split.member_id)!.name}
                  </p>
                </HStack>
                <Group
                  attached
                  border="1px solid"
                  borderColor="border.emphasized"
                  borderRadius="0.3em"
                >
                  <SplitTypeNativeSelect
                    size="sm"
                    variant="plain"
                    value={split.split_type}
                    onSplitTypeChange={(t) =>
                      changeSplitType(split.member_id, t)
                    }
                  />
                  <Separator orientation="vertical" height="5" mx="2" />
                  {split.split_type === "percentage" && (
                    <Field.Root>
                      <PercentageInput
                        max={1}
                        min={0.01}
                        size="sm"
                        variant="flushed"
                        endElement={
                          <FormatNumber
                            value={amounts[split.member_id]}
                            style="currency"
                            currency="BRL"
                          />
                        }
                        percentageValue={split.percentage ?? 0.01}
                        onPercentageValueChange={(v) => {
                          changeSplitValue(split.member_id, v);
                        }}
                      />
                    </Field.Root>
                  )}
                  {split.split_type === "amount" && (
                    <Field.Root>
                      <LocaleProvider locale="pt-br">
                        <MoneyInput
                          size="sm"
                          variant="flushed"
                          ps="1em"
                          moneyValue={split.amount ?? 0}
                          onMoneyValueChange={(v) => {
                            changeSplitValue(split.member_id, v);
                          }}
                        />
                      </LocaleProvider>
                    </Field.Root>
                  )}
                  {split.split_type === "remainder" && (
                    <Field.Root>
                      <MoneyInput
                        disabled
                        size="sm"
                        variant="flushed"
                        ps="1em"
                        moneyValue={amounts[split.member_id]}
                      />
                    </Field.Root>
                  )}
                </Group>
                <IconButton
                  variant="ghost"
                  color="red.muted"
                  _hover={{ color: "red.solid" }}
                >
                  <CgClose />
                </IconButton>
              </HStack>
            </Box>
          ))}
        </Field.Root>
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
