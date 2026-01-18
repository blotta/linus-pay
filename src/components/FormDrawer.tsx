import { Button, CloseButton, Drawer, Portal, Spinner } from "@chakra-ui/react";
import {
  cloneElement,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type Ref,
} from "react";

export type FormHandle = {
  triggerSubmit: () => void;
};

interface FormDrawerProps {
  title: string;
  children: ReactNode;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  formNode: React.ReactElement<
    any,
    React.ElementType<any> & { ref: Ref<FormHandle> }
  >;
  submitLabel: string | null;
}

export default function FormDrawer({
  children,
  formNode,
  title,
  submitLabel,
}: FormDrawerProps) {
  const childRef = useRef<FormHandle>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (childRef.current) {
      childRef.current.triggerSubmit();
    }
  };

  const onUpdateLoading = (val: boolean) => {
    setLoading(val);
  };

  return (
    <Drawer.Root size="lg">
      <Drawer.Trigger asChild cursor="pointer">
        {children}
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner asChild>
          <form onSubmit={handleFormSubmit}>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>{title}</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                {cloneElement(formNode, { ref: childRef, onUpdateLoading })}
              </Drawer.Body>
              <Drawer.Footer>
                <Button disabled={loading} variant="solid" type="submit">
                  {loading ? <Spinner /> : submitLabel}
                </Button>
              </Drawer.Footer>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </form>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
