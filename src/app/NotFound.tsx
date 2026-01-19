import { AbsoluteCenter, Button, EmptyState, VStack } from "@chakra-ui/react";
import { BiHelpCircle } from "react-icons/bi";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <>
      <AbsoluteCenter>
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <BiHelpCircle />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title fontSize="2xl">Not Found</EmptyState.Title>
              <EmptyState.Description>
                The path provided is unavailable
              </EmptyState.Description>
            </VStack>
            <Button asChild variant="outline">
              <Link to="/">Go to Dashboard</Link>
            </Button>
          </EmptyState.Content>
        </EmptyState.Root>
      </AbsoluteCenter>
    </>
  );
}
