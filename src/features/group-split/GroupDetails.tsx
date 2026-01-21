import {
  Avatar,
  AvatarGroup,
  defineStyle,
  Heading,
  HStack,
  Skeleton,
  SkeletonCircle,
  Stack,
  VStack,
} from "@chakra-ui/react";
import { useGroupSplit } from "./useGroupSplit";
import { Tooltip } from "@/components/ui/tooltip";
import { colorFromUuid } from "@/utils/colors";

const ringCss = defineStyle({
  outlineWidth: "2px",
  outlineColor: "colorPalette.500",
  outlineOffset: "0px",
  outlineStyle: "solid",
});

export default function GroupDetails() {
  const { selectedGroup, loadingGroup } = useGroupSplit();

  if (loadingGroup) {
    return (
      <HStack gap="5" alignItems="start">
        <Stack flex="1">
          <Skeleton height="5" width="80%" />
          <Skeleton height="5" width="20%" />
        </Stack>
        <VStack alignItems="end">
          <SkeletonCircle size="10" />
          <HStack spaceX="-5">
            <SkeletonCircle size="8" />
            <SkeletonCircle size="8" />
          </HStack>
        </VStack>
      </HStack>
    );
  }
  return (
    <HStack justifyContent="space-between" alignItems="start">
      <Heading> Group: {selectedGroup?.name}</Heading>
      <VStack alignItems="end" gap="4">
        {selectedGroup?.members
          .filter((m) => m.user_id == selectedGroup.admin_id)
          .map((m) => (
            <HStack key={m.id} gap="4">
              <p key={m.id}>Owner</p>
              <Tooltip content={m.name} interactive>
                <div>
                  <Avatar.Root
                    css={ringCss}
                    colorPalette={colorFromUuid(m.id)}
                    size="sm"
                  >
                    <Avatar.Fallback name={m.name} />
                  </Avatar.Root>
                </div>
              </Tooltip>
            </HStack>
          ))}
        {selectedGroup!.members.length > 1 && (
          <AvatarGroup size="xs" gap="0" spaceX="-3">
            {selectedGroup?.members
              .filter((m) => m.user_id != selectedGroup.admin_id)
              .map((m) => (
                <HStack key={m.id} gap="4">
                  <Tooltip content={m.name}>
                    <div>
                      <Avatar.Root
                        css={ringCss}
                        colorPalette={colorFromUuid(m.id)}
                      >
                        <Avatar.Fallback name={m.name} />
                      </Avatar.Root>
                    </div>
                  </Tooltip>
                </HStack>
              ))}
          </AvatarGroup>
        )}
      </VStack>
    </HStack>
  );
}
