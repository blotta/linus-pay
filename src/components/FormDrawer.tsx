import { Button, CloseButton, Drawer, Portal } from "@chakra-ui/react";
import { type ReactElement, type ReactNode } from "react";

interface GroupCreateProps {
  children: ReactNode;
  formNode: ReactElement;
}

export default function FormDrawer({
  children,
  formNode,
  ...rest
}: GroupCreateProps) {
  return (
    <Drawer.Root size="lg">
      <Drawer.Trigger asChild cursor="pointer" {...rest}>
        {children}
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Create Group</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>{formNode}</Drawer.Body>
            <Drawer.Footer>
              <Button variant="outline">Cancel</Button>
              <Button>Save</Button>
            </Drawer.Footer>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
